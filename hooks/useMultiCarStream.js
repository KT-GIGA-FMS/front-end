"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function num(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function parseTs(ts) {
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const m = Date.parse(ts);
    if (!Number.isNaN(m)) return m;
  }
  return Date.now();
}

/**
 * useMultiCarStream - 여러 차량을 동시에 추적하는 훅
 * @param {string[]} carIds - 추적할 차량 ID 배열
 * @param {object} opts - 옵션
 */
export default function useMultiCarStream(carIds = [], opts = {}) {
  const {
    sockUrl = process.env.NEXT_PUBLIC_SOCKJS_HTTP || "",
    throttleMs = 200,
    maxPath = 5000,
    debug: debugOption = false,
  } = opts;

  const debugFn =
    typeof debugOption === "function"
      ? debugOption
      : debugOption
      ? (m) => console.log("[MULTI-STOMP]", m)
      : () => {};

  const [connected, setConnected] = useState(false);
  const [vehicleData, setVehicleData] = useState({}); // vehicleId -> {lastPoint, lastTelemetry, path}
  const [dataTimeoutWarning, setDataTimeoutWarning] = useState(false);

  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map()); // vehicleId -> subscription
  const lastEmitRef = useRef({});

  // 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: debugFn,
      onConnect: (frame) => {
        console.log("[MULTI-WS] CONNECTED", frame?.headers);
        setConnected(true);
        
        // 연결 후 모든 차량에 대해 데이터 요청
        carIds.forEach(carId => {
          console.log(`[MULTI-WS] ${carId}에 대한 데이터 요청 전송...`);
          client.publish({
            destination: "/app/telemetry",
            body: JSON.stringify({ 
              action: "request", 
              carId: carId,
              timestamp: Date.now() 
            }),
          });
        });
      },
      onWebSocketClose: (e) => {
        console.log("[MULTI-WS] CLOSE", e?.code, e?.reason);
        setConnected(false);
      },
      onStompError: (f) =>
        console.error("MULTI-STOMP error:", f.headers?.["message"], f.body),
    });

    client.activate();
    clientRef.current = client;
    
    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [sockUrl, debugOption]);

  // 구독 관리
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected || carIds.length === 0) return;

    // 기존 구독 정리
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current.clear();

    // 각 차량에 대해 구독 설정 (백엔드 토픽에 맞춤)
    carIds.forEach(carId => {
      const topic = `/topic/vehicle/${carId}`;  // 백엔드 발행 토픽에 맞춤
      console.log(`[MULTI-WS] 구독 설정: ${topic}`);

      const subscription = client.subscribe(topic, (msg) => {
        console.log(`[MULTI-WS][RX] ${carId} 메시지 수신:`, msg.body);
        
        if (!msg?.body) {
          console.log(`[MULTI-WS][RX] ${carId} 빈 메시지 바디`);
          return;
        }
        
        let raw;
        try {
          raw = JSON.parse(msg.body);
          console.log(`[MULTI-WS][RX] ${carId} 파싱된 데이터:`, raw);
          console.log(`[MULTI-WS][RX] ${carId} 필드 확인:`, {
            latitude: raw.latitude,
            longitude: raw.longitude,
            lat: raw.lat,
            lng: raw.lng,
            x: raw.x,
            y: raw.y,
            allKeys: Object.keys(raw)
          });
        } catch (error) {
          console.error(`[MULTI-WS][RX] ${carId} JSON 파싱 에러:`, error);
          return;
        }

        // 백엔드 스키마 매핑 - 다양한 필드명 시도
        const lat = num(raw.latitude ?? raw.lat ?? raw.y, NaN);
        const lng = num(raw.longitude ?? raw.lng ?? raw.x, NaN);
        
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          console.error(`[MULTI-WS][RX] ${carId} 유효하지 않은 위치 데이터:`, { lat, lng });
          return;
        }

        const telem = {
          id: raw.id ?? null,
          vehicleId: raw.vehicleId ?? carId ?? null,
          vehicleName: raw.vehicleName ?? null,
          plateNo: raw.plateNo ?? null,
          latitude: lat,
          longitude: lng,
          speed: num(raw.speed, 0),
          heading: num(raw.heading, null),
          status: raw.status ?? null,
          timestamp: raw.timestamp ?? raw.ts ?? null,
          ts: parseTs(raw.timestamp ?? raw.ts),
          fuelLevel: num(raw.fuelLevel, null),
          engineStatus: raw.engineStatus ?? null,
          _raw: raw,
        };

        // 스로틀
        const now = Date.now();
        if (!lastEmitRef.current[carId]) lastEmitRef.current[carId] = 0;
        if (now - lastEmitRef.current[carId] < throttleMs) return;
        lastEmitRef.current[carId] = now;

        const point = {
          lat,
          lng,
          ts: telem.ts,
          speedKmh: telem.speed,
          heading: telem.heading,
        };

        // 차량별 데이터 업데이트
        setVehicleData(prev => {
          const currentVehicleData = prev[carId] || { path: [] };
          const newPath = [...currentVehicleData.path, point];
          
          // 경로 길이 제한
          if (newPath.length > maxPath) {
            newPath.splice(0, newPath.length - maxPath);
          }

          return {
            ...prev,
            [carId]: {
              lastPoint: point,
              lastTelemetry: telem,
              path: newPath
            }
          };
        });

        setDataTimeoutWarning(false);
        console.log(`[MULTI-WS][RX] ✅ ${carId} 포인트 업데이트:`, point);
      });

      subscriptionsRef.current.set(carId, subscription);
    });

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [carIds, connected, throttleMs, maxPath]);

  // 서버로 메시지 발행
  const publish = (payload) => {
    const c = clientRef.current;
    if (!c?.connected) {
      console.warn("[MULTI-WS] publish 실패 - 클라이언트 연결 안됨");
      return;
    }
    try {
      c.publish({
        destination: "/app/telemetry",
        body: JSON.stringify(payload),
      });
      console.log("[MULTI-WS] publish 성공:", payload);
    } catch (error) {
      console.error("[MULTI-WS] publish 에러:", error);
    }
  };

  return {
    connected,
    vehicleData,
    dataTimeoutWarning,
    publish,
    clearVehicleData: (carId) => {
      if (carId) {
        setVehicleData(prev => {
          const updated = { ...prev };
          delete updated[carId];
          return updated;
        });
      } else {
        setVehicleData({});
      }
    }
  };
}
