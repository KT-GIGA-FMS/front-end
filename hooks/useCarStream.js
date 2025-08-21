"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function num(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function extractTime(timestamp) {
  if (timestamp) {
    const m = Date.parse(timestamp);
    if (!Number.isNaN(m)) return m;
  }
  return Date.now();
}

/**
 * useCarStream
 * @param {string|null} carId  차량ID (차량별 토픽을 구독하려면 필수)
 * @param {object} opts
 *   - sockUrl: SockJS HTTP 엔드포인트 (기본 .env의 NEXT_PUBLIC_SOCKJS_HTTP)
 *   - byCar: true면 /topic/vehicle/{carId}, false면 /topic/vehicles/all
 *   - throttleMs: 포인트 업데이트 최소 간격(ms)
 *   - maxPath: 경로 최대 길이
 *   - topicOverride: 커스텀 토픽을 직접 주고 싶을 때
 *   - debug: 디버그 출력 여부
 */
export default function useCarStream(
  carId = null,
  opts = {}
) {
  const {
    sockUrl = process.env.NEXT_PUBLIC_SOCKJS_HTTP ,
    byCar = true,
    throttleMs = 200,
    maxPath = 5000,
    topicOverride,
    debug: debugOption = false,
  } = opts;

  const debugFn =
    typeof debugOption === "function"
        ? debugOption
        : debugOption
        ? (m) => console.log("[STOMP]", m)
        : () => {};

  // 진단용: 현재 설정 출력
  useEffect(() => {
    console.log("[CFG] sockUrl:", sockUrl, "byCar:", byCar, "carId:", carId);
    console.log("[CFG] 환경변수 NEXT_PUBLIC_SOCKJS_HTTP:", process.env.NEXT_PUBLIC_SOCKJS_HTTP);
  }, [sockUrl, byCar, carId]);

  const [connected, setConnected] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [lastTelemetry, setLastTelemetry] = useState(null);

  const clientRef = useRef(null);
  const subRef = useRef(null);
  const pathRef = useRef([]);
  const lastEmitRef = useRef(0);

  // 구독 토픽 결정
  const topic = useMemo(() => {
    if (topicOverride) {
      console.log("[WS] 커스텀 토픽 사용:", topicOverride);
      return topicOverride;
    }
    
    if (byCar && carId) {
      return `/topic/vehicle/${carId}`;  // 개별 차량용
    }
    
    return `/topic/vehicles/all`;  // 전체 차량용
  }, [topicOverride, byCar, carId]);

  // ✅ SockJS + Stomp 연결 (올바른 방식)
  useEffect(() => {
    if (!sockUrl) {
      console.warn("[WS] sockUrl이 없습니다");
      return;
    }

    console.log("[WS] 연결 시도:", { sockUrl, topic, carId });
    
    // ✅ 올바른 방식: Stomp.over(new SockJS(...))
    const sockClient = new SockJS(sockUrl);
    const stompClient = Stomp.over(sockClient);
    
    // 디버그 설정
    stompClient.debug = debugFn;

    stompClient.connect({}, 
      // 연결 성공 콜백
      (frame) => {
        console.log("[WS] 연결 성공:", frame);
        setConnected(true);
        clientRef.current = stompClient;
        
        // ✅ 토픽 구독
        console.log("[WS] 토픽 구독:", topic);
        const subscription = stompClient.subscribe(topic, (message) => {
          console.log(`[WS] ${topic}에서 메시지 수신:`, message.body);
          try {
            const data = JSON.parse(message.body);
            console.log("[WS] 파싱된 데이터:", data);
            console.log("[WS] 데이터 필드 확인:", {
              latitude: data.latitude,
              longitude: data.longitude,
              lat: data.lat,
              lng: data.lng,
              x: data.x,
              y: data.y,
              allKeys: Object.keys(data)
            });
            setLastTelemetry(data);
            
            // 다양한 필드명 시도
            const latitude = data.latitude || data.lat || data.y;
            const longitude = data.longitude || data.lng || data.x;
            const { speed, heading, timestamp } = data;
            if (latitude != null && longitude != null) {
              const newPoint = {
                lat: latitude,
                lng: longitude,
                speedKmh: speed || 0,
                heading: heading || 0,
                ts: extractTime(timestamp),
              };
              
              const now = Date.now();
              if (now - lastEmitRef.current >= throttleMs) {
                setLastPoint(newPoint);
                lastEmitRef.current = now;
                
                pathRef.current.push(newPoint);
                if (pathRef.current.length > maxPath) {
                  pathRef.current = pathRef.current.slice(-maxPath);
                }
              }
            }
          } catch (err) {
            console.error("[WS] JSON parse error:", err, "원본:", message.body);
          }
        });
        
        subRef.current = subscription;
      },
      // 연결 실패 콜백
      (error) => {
        console.error("[WS] 연결 오류:", error);
        setConnected(false);
        clientRef.current = null;
        subRef.current = null;
      }
    );

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe();
      }
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
      clientRef.current = null;
      subRef.current = null;
    };
  }, [sockUrl, topic, throttleMs, maxPath, debugOption]);

  // 메시지 발송 함수
  const publish = (data) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn("[WS] publish 실패: 연결되지 않음");
      return;
    }
    
    try {
      client.send("/app/telemetry", {}, JSON.stringify(data));
      console.log("[WS] 메시지 발송:", data);
    } catch (err) {
      console.error("[WS] publish 오류:", err);
    }
  };

  return {
    connected,
    lastPoint,
    lastTelemetry,
    topic,
    getPath: () => pathRef.current.slice(),
    clearPath: () => {
      pathRef.current = [];
      setLastPoint(null);
    },
    publish,
  };
}