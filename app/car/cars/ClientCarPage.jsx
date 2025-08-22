"use client";

import { useState, useEffect } from "react";
import NavBar from "../../../components/NavBar";
import CarRegisterModal from "./CarResgisterModal";
import "../../../styles/car-page.css";


// Client Component - 데이터는 props로 받음

function Badge({ text }) {
  const palette = {
    사용가능: { bg: '#e8fff3', fg: '#0a7b45', bd: '#bdf1d6' },
    사용대기: { bg: '#fff9e6', fg: '#a06200', bd: '#ffe5a3' },
    불가:   { bg: '#ffecec', fg: '#a11a1a', bd: '#ffc3c3' },
    법인:   { bg: '#eaf2ff', fg: '#1c54b2', bd: '#c8dcff' },
    개인:   { bg: '#f1eaff', fg: '#5a35b6', bd: '#dac8ff' },
    default:{ bg: '#efefef', fg: '#333',    bd: '#ddd'    },
  };
  const p = palette[text] || palette.default;
  return (
    <span className="car-badge" style={{ backgroundColor: p.bg, color: p.fg, borderColor: p.bd }}>
      {text}
    </span>
  );
}

function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  try {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(Number(n));
  } catch {
    return String(n);
  }
}

// 모델명 결정 함수
function getModelName(car) {
  // 차량 모델 매핑
  const modelMap = {
    1: "G90",
    2: "아반떼", 
    3: "G70",
    4: "소나타",
    5: "K5"
  };
  
  // 1순위: carModelName (새로운 모달에서 입력된 경우)
  if (car.carModelName && car.carModelName.trim()) {
    return car.carModelName.trim();
  } 
  // 2순위: carModelId를 통한 매핑
  else if (car.carModelId !== undefined && car.carModelId !== null) {
    return modelMap[car.carModelId] || `모델${car.carModelId}`;
  }
  // 3순위: model 필드
  else if (car.model && car.model.trim()) {
    return car.model.trim();
  }
  // 4순위: modelName 필드
  else if (car.modelName && car.modelName.trim()) {
    return car.modelName.trim();
  }
  // 5순위: name 필드
  else if (car.name && car.name.trim()) {
    return car.name.trim();
  }
  // 최후순위: 번호판이라도 표시
  else if (car.plateNo) {
    return `차량(${car.plateNo})`;
  }
  
  return "알 수 없는 모델";
}

export default function CarServicePage({ initialCars = [] }) {
  const [cars, setCars] = useState(initialCars);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 차량 목록 새로고침
  const refreshCarList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/car', {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🚗 차량 목록 새로고침:', data);
        const carList = Array.isArray(data) ? data : (data.cars || data.data || []);
        setCars(carList);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('차량 목록 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(refreshCarList, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleCarRegister = async (carData) => {
    try {
      console.log('🚗 차량 등록 완료, 목록 새로고침 중...', carData);
      // 등록 완료 후 목록 새로고침
      await refreshCarList();
    } catch (error) {
      console.error('차량 등록 후 새로고침 실패:', error);
      alert('차량 등록 후 목록 업데이트에 실패했습니다.');
    }
  };
  
  const tabs = [
    { label: "차량 목록", href: "/car/cars" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservation" }
  ];
  return (
    
    <main className="w-full h-full bg-gray-50 flex flex-col">
        <NavBar tabs={tabs} />
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">🚗 차량 목록</h1>
              <p className="text-sm text-gray-600">
                마지막 업데이트: {lastUpdated.toLocaleString()}
                {loading && <span className="text-blue-600 ml-2">(업데이트 중...)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={refreshCarList}
                disabled={loading}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    새로고침 중...
                  </>
                ) : (
                  <>
                    🔄 새로고침
                  </>
                )}
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium" 
                onClick={() => setIsModalOpen(true)}
              >
                ➕ 차량 등록
              </button>
            </div>
          </div>
          <CarRegisterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCarRegister} className="z-50"
          />
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <span>ℹ️</span>
                <span className="text-sm">
                  총 <strong>{cars.length}</strong>대의 차량이 등록되어 있습니다.
                </span>
              </div>
              <a href="/car/management" className="text-blue-600 hover:text-blue-700 underline text-sm">
                차량 관리 페이지 →
              </a>
            </div>
          </div>

          {cars.length === 0 ? (
            <div className="car-empty">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🚗</div>
                <p className="text-gray-600 mb-4">등록된 차량이 없습니다</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium" 
                  onClick={() => setIsModalOpen(true)}
                >
                  첫 번째 차량 등록하기
                </button>
              </div>
            </div>
          ) : (
            <div className="car-card">
              <div className="car-tableWrap">
                <table className="car-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>상태</th>
                      <th style={{ width: 100 }}>구분</th>
                      <th style={{ width: 120 }}>모델명</th>
                      {/* <th>이미지</th> */}
                      <th style={{ width: 130 }}>번호판</th>
                      <th style={{ width: 100 }}>연료</th>
                      <th style={{ width: 120 }}>연비 (km/L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((c, idx) => (
                      <tr key={`${c.plateNo || idx}`}>
                        <td><Badge text={c.status || '-'} /></td>
                        <td><Badge text={c.carType || '-' } /></td>
                        <td className="font-medium text-gray-900">{getModelName(c)}</td>
                        {/* <td>
                          {c.imageUrl ? (
                            <div className="car-imgCell">
                              <img src={c.imageUrl} alt={`${c.plateNo || 'car'}`} />
                            </div>
                          ) : (
                            <span className="car-dim">-</span>
                          )}
                        </td> */}
                        <td className="car-mono">{c.plateNo ?? '-'}</td>
                        <td>{c.fuelType ?? '-'}</td>
                        <td>{formatNumber(c.efficiencyKmPerL)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </main>
  );
}

/*
===============================
🔄 Dynamic SSR version (for later)
-------------------------------
// Replace the two exports at the top with:
// export const dynamic = 'force-dynamic';
// export const revalidate = 0; // or remove this line

// And swap the data loader to:
// async function getCarsAtBuild() {
//   const res = await fetch(API_URL, { cache: 'no-store' });
//   if (!res.ok) throw new Error(`API Error ${res.status}`);
//   const data = await res.json();
//   return Array.isArray(data) ? data : [data];
// }
===============================
*/
