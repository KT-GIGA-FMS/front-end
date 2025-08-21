"use client";
import { useEffect, useRef, useState } from "react";
import useCarStream from "../hooks/useCarStream";
import useMultiCarStream from "../hooks/useMultiCarStream";
import { getVehicleList } from "../services/car/vehicleListApi";

export default function MapView({ carId: initialCarId = "veh-0005" , maxTrail = 5000 }) {
  // 차량 목록 및 선택된 차량 상태 관리
  const [vehicleList, setVehicleList] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(initialCarId);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleLoadError, setVehicleLoadError] = useState(null);
  const [multiTrackingEnabled, setMultiTrackingEnabled] = useState(false);
  const [trackedVehicles, setTrackedVehicles] = useState([]);
  
  // 직접 vehicleId 입력 상태
  const [customVehicleId, setCustomVehicleId] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // 실제 추적할 차량 ID 결정
  const actualCarId = isCustomMode ? customVehicleId : selectedCarId;

  // 차량 목록 로드
  useEffect(() => {
    async function loadVehicles() {
      try {
        console.log("[MAP] 차량 목록 로드 시작...");
        setVehicleLoadError(null);
        const vehicles = await getVehicleList();
        console.log("[MAP] 차량 목록 로드 성공:", vehicles);
        setVehicleList(vehicles);
        setLoadingVehicles(false);
        
        // 초기 선택 차량이 목록에 없으면 첫 번째 차량 선택
        if (vehicles.length > 0 && !vehicles.some(v => v.vehicleId === initialCarId)) {
          setSelectedCarId(vehicles[0].vehicleId);
          setTrackedVehicles([vehicles[0].vehicleId]);
        }
      } catch (error) {
        console.error("[MAP] 차량 목록 로드 실패:", error);
        setVehicleLoadError(error);
        setLoadingVehicles(false);
        setVehicleList([]);
      }
    }
    loadVehicles();
  }, [initialCarId]);

// 차량 스트림 데이터 받아오는 부분 (단일 차량 추적)
  const singleCarStream = useCarStream(actualCarId, {
    byCar: true, throttleMs: 0, maxPath: maxTrail, debug: true,
  });

  // 다중 차량 추적
  const multiCarStream = useMultiCarStream(multiTrackingEnabled ? trackedVehicles : [], {
    throttleMs: 0, maxPath: maxTrail, debug: true,
  });

  // 현재 사용 중인 스트림 결정
  const {
    connected,
    lastPoint,
    lastTelemetry,
    dataTimeoutWarning,
    topic,
    publish
  } = multiTrackingEnabled ? {
    connected: multiCarStream.connected,
    lastPoint: multiCarStream.vehicleData[selectedCarId]?.lastPoint || null,
    lastTelemetry: multiCarStream.vehicleData[selectedCarId]?.lastTelemetry || null,
    dataTimeoutWarning: multiCarStream.dataTimeoutWarning,
    topic: `multi-vehicle (${trackedVehicles.length} vehicles)`,
    publish: multiCarStream.publish
  } : {
    connected: singleCarStream.connected,
    lastPoint: singleCarStream.lastPoint,
    lastTelemetry: singleCarStream.lastTelemetry,
    dataTimeoutWarning: singleCarStream.dataTimeoutWarning,
    topic: singleCarStream.topic,
    publish: singleCarStream.publish
  };

  useEffect(() => {
    if (lastPoint) {
      console.log("[lastPoint]", lastPoint);
      // 예: console.log("[lastPoint]", lastPoint.lat, lastPoint.lng, lastPoint.speedKmh);
    } else {
      console.log("[lastPoint] waiting…");
    }
  }, [lastPoint]);
  
// 실시간 스트림 데이터 + 백엔드 데이터 조합으로 배지 값 구성
const selectedVehicle = vehicleList.find(v => v.vehicleId === selectedCarId);

// 우선순위: 1) WebSocket 실시간 데이터 2) 백엔드 API 데이터 3) 기본값
const driverName = lastTelemetry?.vehicleName ?? selectedVehicle?.vehicleName ?? `Vehicle_${selectedCarId}`;
const plateNo = lastTelemetry?.plateNo ?? selectedVehicle?.plateNo ?? "";

const carMeta = { driverName, plateNo };

console.log("[MAP] 차량 메타 정보:", { 
  selectedCarId, 
  driverName, 
  plateNo, 
  hasRealTimeData: !!lastTelemetry, 
  hasApiData: !!selectedVehicle 
});

  //지도 상태 관리 변수 
    const [mapReady, setMapReady] = useState(false);
    const [mapInitialized, setMapInitialized] = useState(false); // 지도가 실제 데이터로 초기화되었는지 추적
    const mapRef = useRef(null); 
    const markerRef = useRef(null); // 단일 추적 모드용
    const polylineRef = useRef(null); // 단일 추적 모드용 (전체 이동 경로)
    const destinationMarkerRef = useRef(null); // 목적지 마커
    const pathRef = useRef([]); // 전체 이동 경로 저장
    
    // 다중 추적 모드용
    const multiMarkersRef = useRef(new Map()); // vehicleId -> marker
    const multiPolylinesRef = useRef(new Map()); // vehicleId -> polyline
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

// ✅ 차량 설정 - 여기 숫자만 추가/수정하면 모든 콘텐츠 자동 생성
const VEHICLE_NUMBERS = [1, 2, 3, 4, 5, 6]; // 🔧 차량 번호 리스트 (숫자만 수정하세요!)

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

function getVehicleColor(vehicleId, vehicleList) {
  const index = vehicleList.findIndex(v => v.vehicleId === vehicleId);
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

// 목적지 마커만 생성 및 업데이트
const updateDestinationMarker = (vehicleId) => {
  if (!mapRef.current || !VEHICLE_DESTINATIONS[vehicleId]) return;
  
  const destination = VEHICLE_DESTINATIONS[vehicleId];
  const color = getVehicleColor(vehicleId, vehicleList);
  
  // 목적지 위치
  const destPos = new naver.maps.LatLng(destination.lat, destination.lng);
  
  // 기존 목적지 마커 제거
  if (destinationMarkerRef.current) {
    destinationMarkerRef.current.setMap(null);
  }
  
  // 목적지 마커 생성
  destinationMarkerRef.current = new naver.maps.Marker({
    position: destPos,
    map: mapRef.current,
    icon: { 
      content: makeDestinationMarkerContent({ name: destination.name, color }), 
      anchor: new naver.maps.Point(8, 8) 
    },
    title: `목적지: ${destination.name}`,
    zIndex: 1000
  });
  
  console.log(`[DESTINATION] 목적지 마커 업데이트: ${vehicleId} -> ${destination.name}`);
};

//마커 생성 함수
  /** 🔹 3D 차량 이미지 마커 생성: 차량 이미지 + 위쪽에 배지 */
const makeMarkerContent = ({ driverName, plateNo, color = "#FF0000" }) => {
  // 차량 번호가 있을 때만 표시, 없거나 빈 문자열이면 표시하지 않음
  const displayText = plateNo && plateNo.trim() ? plateNo : driverName;
  const hasValidInfo = displayText && displayText.trim();
  
  return `
  <div style="position:relative; transform: translate(-80%, -50%);">
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


  // 네이버 지도 스크립트 로드 (위치 데이터 없이 기본 지도만 생성)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function initEmptyMap() {
      // 기본 위치로 지도만 생성 (서울 중심)
      const map = new naver.maps.Map("naverMap", {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 위치
        zoom: 10, // 넓은 범위로 시작
        zoomControl: true,
        zoomControlOptions: { style: naver.maps.ZoomControlStyle.SMALL, position: naver.maps.Position.TOP_RIGHT }
      });
      mapRef.current = map;
      setMapReady(true);
      console.log("[MAP] 기본 지도 초기화 완료");
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
  
  // 실제 차량 데이터로 지도 초기화 (첫 번째 데이터 수신 시)
  const initializeMapWithData = (lat, lng, vehicleId) => {
    if (!mapRef.current || mapInitialized) return;
    
    console.log(`[MAP] 차량 데이터로 지도 초기화: ${vehicleId} at ${lat}, ${lng}`);
    
    // 지도 중심을 실제 차량 위치로 이동하고 줌 레벨 조정
    mapRef.current.setCenter(new naver.maps.LatLng(lat, lng));
    mapRef.current.setZoom(15);
    
    if (!multiTrackingEnabled) {
      // 단일 추적 모드: 마커와 폴리라인 생성
      const color = getVehicleColor(selectedCarId, vehicleList);
      
      markerRef.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: mapRef.current,
        icon: {content: makeMarkerContent({...carMeta, color}), anchor: new naver.maps.Point(16, 16) },
        title: `${carMeta.driverName} · ${carMeta.plateNo}`, 
      });

      polylineRef.current = new naver.maps.Polyline({
        map: mapRef.current, 
        path: [new naver.maps.LatLng(lat, lng)], 
        strokeColor: color, 
        strokeOpacity: 0.8, 
        strokeWeight: 4
      });
    }
    
    setMapInitialized(true);
  };
  
    // 🔄 selectedCarId 변경 시 배지 갱신 및 경로 초기화 (단일 추적 모드)
  useEffect(() => {
    if (!markerRef.current || multiTrackingEnabled) return;
    
    // 차량 변경 시 기존 경로 초기화하고 지도 재초기화 준비
    pathRef.current = [];
    setMapInitialized(false); // 새로운 차량 선택 시 지도 재초기화 허용
    
    if (polylineRef.current) {
      polylineRef.current.setPath([]);
      polylineRef.current.setOptions({
        strokeColor: getVehicleColor(selectedCarId, vehicleList)
      });
    }
    
    const color = getVehicleColor(selectedCarId, vehicleList);
    markerRef.current.setIcon({
      content: makeMarkerContent({...carMeta, color}),
      anchor: new naver.maps.Point(16, 16),
    });
    markerRef.current.setTitle(`${carMeta.driverName} · ${carMeta.plateNo}`);
  }, [selectedCarId, carMeta.driverName, carMeta.plateNo, multiTrackingEnabled, vehicleList]);


  // 단일 차량 추적 모드: 실시간 포인트 들어올 때마다 지도 갱신
  useEffect(() => {
    if (multiTrackingEnabled) return; // 다중 추적 모드에서는 실행하지 않음
    
    console.log("[MAP] 🔄 Single vehicle useEffect 트리거:", { 
      mapReady, 
      mapInitialized,
      hasMap: !!mapRef.current, 
      hasMarker: !!markerRef.current,
      lastPoint: lastPoint ? `${lastPoint.lat}, ${lastPoint.lng}` : null,
      lastTelemetry: lastTelemetry,
      selectedCarId: selectedCarId,
      multiTrackingEnabled: multiTrackingEnabled
    });
    
    if (!mapReady || !mapRef.current || !lastPoint) {
      console.log("[MAP] ❌ 조건 미충족 - 업데이트 건너뜀");
      return;
    }
    
    const { lat, lng } = lastPoint;
    const ll = new naver.maps.LatLng(lat, lng);
    
    // 첫 번째 데이터 수신 시 지도 초기화
    if (!mapInitialized) {
      initializeMapWithData(lat, lng, selectedCarId);
      console.log("[MAP] 🎯 첫 데이터로 지도 초기화:", { lat, lng });
      return;
    }
    
    console.log("[MAP] 🎯 마커 위치 업데이트:", { lat, lng });
  
    // 모든 경로 점을 저장 (제한 없이 전체 이동 경로 표시)
    pathRef.current.push(ll);
    
    console.log("[MAP] 📍 폴리라인 경로 업데이트, 총 포인트:", pathRef.current.length);
    polylineRef.current?.setPath(pathRef.current);
    
    if (markerRef.current) {
      markerRef.current.setPosition(ll);
      console.log("[MAP] ✅ 마커 setPosition 완료");
    } else {
      console.error("[MAP] ❌ markerRef.current가 null입니다!");
    }
    
    // 목적지 마커 표시 (차량 선택 시 한 번만)
    if (pathRef.current.length === 1) {
      updateDestinationMarker(selectedCarId);
    }
  
    if (pathRef.current.length % 5 === 0) {
      console.log("[MAP] 🗺️ 지도 중심 이동");
      mapRef.current.setCenter(ll);
    }
  }, [lastPoint, mapReady, mapInitialized, maxTrail, multiTrackingEnabled, selectedCarId]);

  // 다중 차량 추적 모드: 모든 차량의 마커 업데이트
  useEffect(() => {
    if (!multiTrackingEnabled || !mapReady || !mapRef.current) return;

    console.log("[MAP] 🔄 Multi vehicle useEffect 트리거:", multiCarStream.vehicleData);

    // 첫 번째 차량 데이터로 지도 초기화 (다중 추적 모드)
    if (!mapInitialized && Object.keys(multiCarStream.vehicleData).length > 0) {
      const firstVehicleData = Object.values(multiCarStream.vehicleData)[0];
      if (firstVehicleData?.lastPoint) {
        const { lat, lng } = firstVehicleData.lastPoint;
        console.log("[MAP] 🎯 다중 추적 모드 - 첫 데이터로 지도 초기화:", { lat, lng });
        mapRef.current.setCenter(new naver.maps.LatLng(lat, lng));
        mapRef.current.setZoom(15);
        setMapInitialized(true);
      }
    }

    // 각 차량의 마커 및 경로 업데이트
    Object.entries(multiCarStream.vehicleData).forEach(([vehicleId, data]) => {
      const { lastPoint: point, lastTelemetry, path } = data;
      if (!point) return;

      const color = getVehicleColor(vehicleId, vehicleList);
      const vehicle = vehicleList.find(v => v.vehicleId === vehicleId);
      
      // 우선순위: 1) 각 차량의 실시간 데이터 2) 백엔드 API 데이터 3) 기본값  
      const vehicleMeta = {
        driverName: lastTelemetry?.vehicleName || vehicle?.vehicleName || `Vehicle_${vehicleId}`,
        plateNo: lastTelemetry?.plateNo || vehicle?.plateNo || ""
      };
      
      console.log(`[MAP] 다중추적 차량 ${vehicleId} 메타:`, vehicleMeta);

      // 마커 생성 또는 업데이트
      let marker = multiMarkersRef.current.get(vehicleId);
      if (!marker) {
        marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(point.lat, point.lng),
          map: mapRef.current,
          icon: { content: makeMarkerContent({...vehicleMeta, color}), anchor: new naver.maps.Point(16, 16) },
          title: `${vehicleMeta.driverName} · ${vehicleMeta.plateNo}`
        });
        multiMarkersRef.current.set(vehicleId, marker);
      } else {
        marker.setPosition(new naver.maps.LatLng(point.lat, point.lng));
        marker.setIcon({
          content: makeMarkerContent({...vehicleMeta, color}),
          anchor: new naver.maps.Point(16, 16)
        });
      }

      // 폴리라인 생성 또는 업데이트
      let polyline = multiPolylinesRef.current.get(vehicleId);
      const pathPoints = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
      
      if (!polyline) {
        polyline = new naver.maps.Polyline({
          map: mapRef.current,
          path: pathPoints,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3
        });
        multiPolylinesRef.current.set(vehicleId, polyline);
      } else {
        polyline.setPath(pathPoints);
      }
    });

    // 현재 선택된 차량을 중심으로 지도 이동 (초기화 완료 후)
    if (mapInitialized) {
      const selectedVehicleData = multiCarStream.vehicleData[selectedCarId];
      if (selectedVehicleData?.lastPoint) {
        const { lat, lng } = selectedVehicleData.lastPoint;
        mapRef.current.setCenter(new naver.maps.LatLng(lat, lng));
      }
    }
  }, [multiCarStream.vehicleData, mapReady, mapInitialized, multiTrackingEnabled, vehicleList, selectedCarId]);

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "100rem", 
      padding: "1rem", 
      minHeight: "100vh",
      overflowY: "auto",
      boxSizing: "border-box"
    }}>


      {/* 빠른 차량 선택 버튼 (veh-0001 ~ veh-0006) */}
      <div style={{ marginBottom: 16, padding: 12, background: "#e8f4fd", border: "1px solid #bee3f8", borderRadius: 8 }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: "bold", color: "#2b6cb0" }}>🚗 빠른 차량 선택</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {VEHICLE_NUMBERS.map(num => {
            const vehicleId = `veh-000${num}`;
            const isSelected = selectedCarId === vehicleId;
            
            return (
              <button
                key={vehicleId}
                onClick={() => {
                  console.log(`[QUICK SELECT] 차량 선택: ${vehicleId}`);
                  
                  // 기존 마커와 경로 완전히 제거
                  if (markerRef.current) {
                    markerRef.current.setMap(null);
                    markerRef.current = null;
                  }
                  if (polylineRef.current) {
                    polylineRef.current.setMap(null);
                    polylineRef.current = null;
                  }
                  // 기존 목적지 마커 제거 (새로운 차량 선택 시)
                  if (destinationMarkerRef.current) {
                    destinationMarkerRef.current.setMap(null);
                    destinationMarkerRef.current = null;
                  }
                  
                  // 다중 추적 마커들도 모두 제거
                  multiMarkersRef.current.forEach(marker => marker.setMap(null));
                  multiPolylinesRef.current.forEach(polyline => polyline.setMap(null));
                  multiMarkersRef.current.clear();
                  multiPolylinesRef.current.clear();
                  
                  // 경로 데이터 초기화
                  pathRef.current = [];
                  
                  // 새 차량 선택
                  setSelectedCarId(vehicleId);
                  setIsCustomMode(false);
                        setCustomVehicleId("");
                  setMultiTrackingEnabled(false); // 항상 단일 추적 모드
                  setMapInitialized(false); // 지도 재초기화 허용
                  
                  console.log(`[QUICK SELECT] 차량 전환 완료: ${vehicleId}, 기존 마커 제거됨`);
                      }}
                      style={{
                        padding: "8px 12px",
                  border: `2px solid ${isSelected ? "#2b6cb0" : "#cbd5e0"}`,
                        borderRadius: 6,
                  background: isSelected ? "#2b6cb0" : "#fff",
                  color: isSelected ? "#fff" : "#4a5568",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: isSelected ? "bold" : "normal",
                        transition: "all 0.2s ease",
                  minWidth: "70px"
                }}
              >
                {`000${num}`}
                    </button>
                );
              })}
            </div>
        <div style={{ fontSize: 11, color: "#4a5568", marginTop: 8 }}>
          💡 클릭하여 해당 차량 번호의 실시간 추적을 시작합니다.
              </div>
        {selectedCarId && VEHICLE_DESTINATIONS[selectedCarId] && (
          <div style={{ fontSize: 12, color: "#2b6cb0", marginTop: 8, padding: 8, background: "#f0f9ff", borderRadius: 4 }}>
            🏁 <strong>현재 목적지:</strong> {VEHICLE_DESTINATIONS[selectedCarId].name}
            <br />
            📍 위치: {VEHICLE_DESTINATIONS[selectedCarId].lat.toFixed(4)}, {VEHICLE_DESTINATIONS[selectedCarId].lng.toFixed(4)}
            </div>
        )}
      </div>
      
      <div id="naverMap" style={{ 
        width: "100%", 
        height: "50vh", 
        minHeight: "400px",
        borderRadius: 12, 
        border: "1px solid #ddd",
        marginBottom: "16px"
      }} />
      
      {/* 연결 상태 및 실시간 정보 */}
      <div style={{ marginTop: 12, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
        {/* <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span>WebSocket: <b style={{ color: connected ? "green" : "red" }}>{connected ? "CONNECTED" : "DISCONNECTED"}</b></span>
          <span>구독 토픽: <code>{topic}</code></span>
          <span>맵 준비: <b style={{ color: mapReady ? "green" : "orange" }}>{mapReady ? "완료" : "로딩중"}</b></span>
          {dataTimeoutWarning && (
            <span style={{ color: "orange", fontSize: 12 }}>⚠️ 데이터 수신 없음</span>
          )}
        </div>
         */}
        {/* 테스트 버튼들
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button 
            onClick={() => {
              console.log("[TEST] 테스트 데이터 발송...");
              publish({
                action: "test",
                carId: selectedCarId,
                requestData: true,
                timestamp: Date.now()
              });
            }}
            disabled={!connected}
            style={{ 
              padding: "4px 8px", 
              fontSize: 12, 
              background: connected ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: connected ? "pointer" : "not-allowed"
            }}
          >
            📡 서버에 데이터 요청
          </button>
          
          <button 
            onClick={() => {
              // 임시 테스트 데이터로 마커 이동 테스트
              const testLat = 37.4979 + (Math.random() - 0.5) * 0.01;
              const testLng = 127.0276 + (Math.random() - 0.5) * 0.01;
              console.log("[TEST] 로컬 테스트 데이터:", { testLat, testLng });
              
              // useCarStream의 setLastPoint를 직접 호출할 수 없으므로 
              // 여기서는 그냥 로그만 출력
              if (markerRef.current && mapRef.current) {
                const testLL = new naver.maps.LatLng(testLat, testLng);
                markerRef.current.setPosition(testLL);
                mapRef.current.setCenter(testLL);
                console.log("[TEST] 마커 임시 이동 완료");
              }
            }}
            style={{ 
              padding: "4px 8px", 
              fontSize: 12, 
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            🎯 마커 테스트 이동
          </button>
        </div>
         */}
        {/* 실시간 추적 상태 표시
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: connected ? "#f0fff4" : "#fff5f5", 
          border: `1px solid ${connected ? "#9ae6b4" : "#fed7d7"}`, 
          borderRadius: 8 
        }}>
  
          <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
            <strong>추적 중인 차량:</strong> {actualCarId || "없음"}
            <br />
            <strong>구독 토픽:</strong> <code style={{ background: "#f7fafc", padding: "1px 4px", borderRadius: 2 }}>{topic}</code>
            <br />
            <strong>연결 상태:</strong> {connected ? "✅ 연결됨" : "❌ 연결 안됨"}
          </div>
        </div> */}

        {/* 실시간 위치 정보 - 전체 데이터 표시 */}
        <div style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
          {lastPoint ? (
            <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8, border: "1px solid #e9ecef" }}>
              <h5 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "#495057" }}>📡 최신 수신 데이터</h5>
              <div><strong>🚗 차량:</strong> {lastPoint.vehicleName} ({lastPoint.vehicleId})</div>
              <div><strong>📍 위치:</strong> lat {lastPoint.lat?.toFixed(6)}, lng {lastPoint.lng?.toFixed(6)}</div>
              <div><strong>🏃 속도:</strong> {lastPoint.speedKmh ?? 0}km/h, 방향: {lastPoint.heading ?? 0}°</div>
              <div><strong>⛽ 연료:</strong> {lastPoint.fuelLevel ? `${lastPoint.fuelLevel}%` : 'N/A'}</div>
              <div><strong>🔧 엔진:</strong> {lastPoint.engineStatus || 'N/A'}</div>
              <div><strong>📊 상태:</strong> {lastPoint.status || 'N/A'}</div>
              <div><strong>🕒 업데이트:</strong> {new Date(lastPoint.ts).toLocaleTimeString()}</div>
              <div><strong>📈 경로:</strong> {pathRef.current.length}개 포인트</div>
              
              {/* 원본 텔레매틱 데이터 표시 */}
              {lastTelemetry && (
                <div style={{ marginTop: 8, padding: 8, background: "#fff3cd", borderRadius: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#856404" }}>📡 원본 텔레매틱 데이터:</div>
                  <pre style={{ 
                    fontSize: 9, 
                    color: "#6c757d", 
                    margin: "4px 0 0 0", 
                    maxHeight: "100px", 
                    overflow: "auto",
                    background: "#f8f9fa",
                    padding: "4px",
                    borderRadius: "2px"
                  }}>
                    {JSON.stringify(lastTelemetry, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* 데이터 변화량 표시 */}
              <div style={{ marginTop: 8, padding: 8, background: "#e3f2fd", borderRadius: 4 }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#1565c0" }}>📊 데이터 변화 감지:</div>
                <div style={{ fontSize: 10, color: "#1976d2" }}>
                  {lastPoint.vehicleId !== actualCarId && (
                    <div>⚠️ 다른 차량 데이터: {lastPoint.vehicleId} (요청: {actualCarId})</div>
                  )}
                  <div>마지막 수신: {Math.round((Date.now() - lastPoint.ts) / 1000)}초 전</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* <div style={{ color: "orange", background: "#fffbf0", padding: 12, borderRadius: 8, border: "1px solid #fed7aa" }}>
                ⏳ 데이터 대기 중... (토픽: {topic})
              </div> */}
            </div>
          )}
        </div>
        
        {/* 전체 원본 데이터 표시 */}
        {/* {lastPoint?.rawData && (
          <details style={{ marginTop: 8, fontSize: 11 }}>
            <summary style={{ cursor: "pointer", color: "#666" }}>🔍 전체 원본 데이터 (lastPoint)</summary>
            <pre style={{ background: "#f0f8ff", padding: 8, borderRadius: 4, marginTop: 4, overflow: "auto", maxHeight: "200px" }}>
              {JSON.stringify(lastPoint.rawData, null, 2)}
            </pre>
          </details>
        )} */}
        
        {/* 텔레메트리 상세 정보 */}
        {lastTelemetry && (
          <details style={{ marginTop: 8, fontSize: 11 }}>
            <summary style={{ cursor: "pointer", color: "#666" }}>상세 텔레메트리 정보</summary>
            <pre style={{ background: "#fff", padding: 8, borderRadius: 4, marginTop: 4, overflow: "auto" }}>
              {JSON.stringify(lastTelemetry, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
