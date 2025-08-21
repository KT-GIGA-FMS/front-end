"use client";
import { useEffect, useRef, useState } from "react";
import useMultiCarStream from "../hooks/useMultiCarStream";
import { getVehicleList } from "../services/car/vehicleListApi";

export default function AllVehiclesView({ maxTrail = 5000 }) {
  // 차량 목록 및 상태 관리
  const [vehicleList, setVehicleList] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleLoadError, setVehicleLoadError] = useState(null);
  
  // 지도 상태 관리 변수 
  const [mapReady, setMapReady] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null); 
  
  // 다중 추적 모드용
  const multiMarkersRef = useRef(new Map()); // vehicleId -> marker
  const multiPolylinesRef = useRef(new Map()); // vehicleId -> polyline
  const destinationMarkersRef = useRef(new Map()); // vehicleId -> destination marker

  // ✅ 차량 설정 - 여기 숫자만 추가/수정하면 모든 콘텐츠 자동 생성
  const VEHICLE_NUMBERS = [1, 2, 3, 4, 5, 6]; // 🔧 차량 번호 리스트 (숫자만 수정하세요!)
  
  // 자동 생성된 차량 ID 리스트
  const trackedVehicles = VEHICLE_NUMBERS.map(num => `veh-000${num}`);
  
  const multiCarStream = useMultiCarStream(trackedVehicles, {
    throttleMs: 0, maxPath: maxTrail, debug: true,
  });

  // 차량별 색상 배열
  const VEHICLE_COLORS = [
    "#FF0000", // 빨강
    "#0066FF", // 파랑
    "#00CC00", // 초록
    "#FF6600", // 주황
    "#9900FF", // 보라
    "#FF0099", // 분홍
    "#00CCFF", // 하늘색
    "#FFCC00", // 노랑
  ];

  // 서울 주요 지역 목적지 리스트
  const DESTINATIONS = [
    { lat: 37.5665, lng: 126.9780, name: "서울시청" },
    { lat: 37.5519, lng: 126.9918, name: "동대문디자인플라자" },
    { lat: 37.5172, lng: 127.0473, name: "강남역" },
    { lat: 37.5596, lng: 126.9426, name: "홍대입구역" },
    { lat: 37.5796, lng: 126.9770, name: "경복궁" },
    { lat: 37.5758, lng: 126.9768, name: "광화문광장" }
  ];

  // 자동 생성된 차량별 목적지 매핑
  const VEHICLE_DESTINATIONS = {};
  VEHICLE_NUMBERS.forEach((num, index) => {
    const vehicleId = `veh-000${num}`;
    VEHICLE_DESTINATIONS[vehicleId] = DESTINATIONS[index % DESTINATIONS.length];
  });

  function getVehicleColor(vehicleId) {
    const index = trackedVehicles.indexOf(vehicleId);
    return VEHICLE_COLORS[index % VEHICLE_COLORS.length] || "#FF0000";
  }

  // 목적지 마커 콘텐츠 생성
  const makeDestinationMarkerContent = ({ name, color = "#FF0000" }) => {
    return `
    <div style="position:relative; transform: translate(-50%, -100%);">
      <button
        type="button"
        style="
          position:absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background:#1a365d;
          color:#fff;
          border:1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          font-size:10px;
          line-height:1;
          white-space:nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: default;
          user-select: none;
        "
        title="목적지: ${name}"
      >
        🏁 ${name}
      </button>
      <div
        style="
          width:16px;height:16px;
          background:#1a365d;border:2px solid #fff;
          border-radius: 4px;
          box-shadow: 0 0 0 2px rgba(26,54,93,0.3);
        "
      ></div>
    </div>
  `;
  };

  // 3D 차량 이미지 마커 생성
  const makeMarkerContent = ({ driverName, plateNo, color = "#FF0000" }) => {
    const displayText = plateNo && plateNo.trim() ? plateNo : driverName;
    const hasValidInfo = displayText && displayText.trim();
    
    return `
    <div style="position:relative; transform: translate(-40%, -50%);">
      ${hasValidInfo ? `
      <div
        style="
          position:absolute;
          bottom: 45px;
          left: 50%;
          transform: translateX(-70%);
          padding: 4px 8px;
          background:#111827;
          color:#fff;
          border:1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          font-size:10px;
          line-height:1.2;
          white-space:nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: default;
          user-select: none;
          z-index: 1000;
        "
        title="${displayText}"
      >
        ${displayText}
      </div>
      ` : ''}
      <img
        src="/src/3d-car.png"
        style="
          width: 40px;
          height: 40px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          z-index: 999;
        "
        alt="Vehicle"
        draggable="false"
      />
    </div>
  `;
  };

  // 차량 목록 로드
  useEffect(() => {
    async function loadVehicles() {
      try {
        setVehicleLoadError(null);
        const vehicles = await getVehicleList();
        setVehicleList(vehicles);
        setLoadingVehicles(false);
      } catch (error) {
        console.error("[ALL_VEHICLES] 차량 목록 로드 실패:", error);
        setVehicleLoadError(error);
        setLoadingVehicles(false);
        setVehicleList([]);
      }
    }
    loadVehicles();
  }, []);

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    function initEmptyMap() {
      const map = new naver.maps.Map("allVehiclesMap", {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 서울 중심
        zoom: 12, // 전체 보기를 위한 넓은 범위
        zoomControl: true,
        zoomControlOptions: { style: naver.maps.ZoomControlStyle.SMALL, position: naver.maps.Position.TOP_RIGHT }
      });
      mapRef.current = map;
      setMapReady(true);
      console.log("[ALL_VEHICLES] 지도 초기화 완료");
    }

    if (!window.naver?.maps) {
      const script = document.createElement("script");
      script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=vybj2787v3";
      script.async = true;
      script.onload = initEmptyMap;
      document.head.appendChild(script);
    } else {
      initEmptyMap();
    }
  }, []);

  // 다중 차량 추적: 모든 차량의 마커 업데이트
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    console.log("[ALL_VEHICLES] 차량 데이터 업데이트:", multiCarStream.vehicleData);

    // 첫 번째 차량 데이터로 지도 초기화
    if (!mapInitialized && Object.keys(multiCarStream.vehicleData).length > 0) {
      setMapInitialized(true);
    }

    // 각 차량의 마커 및 경로 업데이트
    Object.entries(multiCarStream.vehicleData).forEach(([vehicleId, data]) => {
      const { lastPoint: point, lastTelemetry, path } = data;
      if (!point) return;

      const color = getVehicleColor(vehicleId);
      const vehicle = vehicleList.find(v => v.vehicleId === vehicleId);
      
      const vehicleMeta = {
        driverName: lastTelemetry?.vehicleName || vehicle?.vehicleName || `Vehicle_${vehicleId}`,
        plateNo: lastTelemetry?.plateNo || vehicle?.plateNo || ""
      };

      // 차량 마커 생성 또는 업데이트
      let marker = multiMarkersRef.current.get(vehicleId);
      if (!marker) {
        marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(point.lat, point.lng),
          map: mapRef.current,
          icon: { content: makeMarkerContent({...vehicleMeta, color}), anchor: new naver.maps.Point(20, 20) },
          title: `${vehicleMeta.driverName} · ${vehicleMeta.plateNo}`
        });
        multiMarkersRef.current.set(vehicleId, marker);
      } else {
        marker.setPosition(new naver.maps.LatLng(point.lat, point.lng));
        marker.setIcon({
          content: makeMarkerContent({...vehicleMeta, color}),
          anchor: new naver.maps.Point(20, 20)
        });
      }

      // 폴리라인 생성 또는 업데이트 (전체 경로 표시)
      let polyline = multiPolylinesRef.current.get(vehicleId);
      const pathPoints = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
      
      if (!polyline) {
        polyline = new naver.maps.Polyline({
          map: mapRef.current,
          path: pathPoints,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 4
        });
        multiPolylinesRef.current.set(vehicleId, polyline);
      } else {
        polyline.setPath(pathPoints);
      }

      // 목적지 마커 생성 (한 번만)
      const destination = VEHICLE_DESTINATIONS[vehicleId];
      if (destination && !destinationMarkersRef.current.has(vehicleId)) {
        const destMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(destination.lat, destination.lng),
          map: mapRef.current,
          icon: { 
            content: makeDestinationMarkerContent({ name: destination.name, color }), 
            anchor: new naver.maps.Point(8, 8) 
          },
          title: `목적지: ${destination.name}`,
          zIndex: 1000
        });
        destinationMarkersRef.current.set(vehicleId, destMarker);
      }
    });
  }, [multiCarStream.vehicleData, mapReady, mapInitialized, vehicleList]);

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "100rem", 
      padding: "1rem", 
      minHeight: "100vh",
      overflowY: "auto",
      boxSizing: "border-box"
    }}>
      {/* 전체 차량 추적 정보 */}
      <div style={{ marginBottom: 16, padding: 12, background: "#e8f5e8", border: "1px solid #c3e6cb", borderRadius: 8 }}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: "bold", color: "#155724" }}>🌍 전체 차량 실시간 추적</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {trackedVehicles.map((vehicleId) => {
            const color = getVehicleColor(vehicleId);
            const destination = VEHICLE_DESTINATIONS[vehicleId];
            const vehicleData = multiCarStream.vehicleData[vehicleId];
            
            return (
              <div key={vehicleId} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6,
                padding: "6px 10px",
                background: "#fff",
                border: `2px solid ${color}`,
                borderRadius: 8,
                fontSize: 12,
                minWidth: "180px"
              }}>
                <div style={{ 
                  width: 14, 
                  height: 14, 
                  background: color, 
                  borderRadius: "50%",
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#333" }}>{vehicleId}</div>
                  {destination && (
                    <div style={{ color: "#666", fontSize: 10 }}>→ {destination.name}</div>
                  )}
                </div>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%",
                  background: vehicleData?.lastPoint ? "#28a745" : "#dc3545",
                  flexShrink: 0
                }} title={vehicleData?.lastPoint ? "온라인" : "오프라인"}></div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: "#155724" }}>
          💡 모든 차량의 실시간 위치와 이동 경로를 동시에 확인할 수 있습니다. 지도는 고정된 뷰로 전체 상황을 파악하기 쉽습니다.
        </div>
      </div>
      
      <div id="allVehiclesMap" style={{ 
        width: "100%", 
        height: "70vh", 
        minHeight: "500px",
        borderRadius: 12, 
        border: "1px solid #ddd",
        marginBottom: "16px"
      }} />
      
      {/* 연결 상태 및 실시간 정보 */}
      <div style={{ marginTop: 12, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          {/* <span>WebSocket: <b style={{ color: multiCarStream.connected ? "green" : "red" }}>{multiCarStream.connected ? "CONNECTED" : "DISCONNECTED"}</b></span> */}
          <span>추적 차량: <b>{trackedVehicles.length}대</b></span>
          {/* <span>데이터 수신: <b style={{ color: Object.keys(multiCarStream.vehicleData).length > 0 ? "green" : "orange" }}>{Object.keys(multiCarStream.vehicleData).length}대</b></span> */}
        </div>
        
        <div style={{ fontSize: 12, color: "#666" }}>
          <strong>실시간 상태:</strong> 
          {Object.keys(multiCarStream.vehicleData).length > 0 ? (
            <span style={{ color: "green" }}> ✅ {Object.keys(multiCarStream.vehicleData).length}대 차량 데이터 수신 중</span>
          ) : (
            <span style={{ color: "orange" }}> ⏳ 차량 데이터 대기 중...</span>
          )}
        </div>
      </div>
    </div>
  );
}
