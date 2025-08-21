"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";
import CarRegisterModal from "./CarResgisterModal";


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

export default function CarServicePage({ initialCars = [] }) {
  const [cars, setCars] = useState(initialCars);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleCarRegister = async (carData) => {
    try {
      // 새 차량을 목록에 추가
      const newCar = {
        carModelId: cars.length + 1,
        plateNo: carData.plateNo,
        // imageUrl: carData.imageUrl || 'https://example.com/default-car.jpg',
        fuelType: carData.fuelType || '휘발유',
        efficiencyKmPerL: carData.efficiencyKmPerL || 0,
        status: carData.status === 'AVAILABLE' ? '사용가능' : carData.status,
        carType: carData.ownerType === 'CORP' ? '법인' : '개인',
      };
      
      setCars(prev => [...prev, newCar]);
      console.log('차량 등록 성공:', newCar);
    } catch (error) {
      console.error('차량 등록 실패:', error);
      alert('차량 등록에 실패했습니다.');
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
          <div className="flex justify-end mb-4">
            <button className="bg-gray-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium" onClick={() => setIsModalOpen(true)}>
                    차량 등록
            </button>
          </div>
          <CarRegisterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCarRegister} className="z-50"
          />
          
          <p className="car-sub mb-4">총 <strong>{cars.length}</strong>대</p>

          {cars.length === 0 ? (
            <div className="car-empty"><p>표시할 차량이 없습니다.</p></div>
          ) : (
            <div className="car-card">
              <div className="car-tableWrap">
                <table className="car-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>상태</th>
                      <th style={{ width: 100 }}>구분</th>
                      <th style={{ width: 80 }}>모델ID</th>
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
                        <td>{c.carModelId ?? '-'}</td>
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

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .car-wrap { padding: 32px 24px; max-width: 1100px; margin: 0 auto; }
  .car-hd h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
  .car-titleRow { display: flex; align-items: center; gap: 10px; }
  .car-mini { font-size: 12px; color: #5b6b7a; background: #f2f5f8; border: 1px solid #e3e8ee; padding: 2px 8px; border-radius: 9999px; }
  .car-sub { color: #5b6b7a; margin-top: 8px; }
  .car-err { background: #1a1a1a; color: #ffb4b4; padding: 12px; border-radius: 10px; overflow: auto; }
  .car-card { background: #ffffff; border: 1px solid #e6e8eb; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
  .car-tableWrap { overflow: auto; border-radius: 16px; }
  .car-tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
  .car-tbl thead th { text-align: left; font-weight: 700; font-size: 13px; color: #49576a; background: #f7f9fc; position: top: 0; padding: 14px 16px; border-bottom: 1px solid #e6e8eb; }
  .car-tbl tbody td { padding: 14px 16px; font-size: 14px; color: #2d3643; border-bottom: 1px solid #f0f2f4; vertical-align: middle; }
  .car-tbl tbody tr:hover { background: #fbfdff; }
  .car-dim { color: #9aa7b4; }
  .car-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
  .car-imgCell { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 48px; border-radius: 8px; overflow: hidden; border: 1px solid #e6e8eb; background: #fafbfc; }
  .car-imgCell img { width: 100%; height: 100%; object-fit: cover; }
  .car-empty { display: grid; place-items: center; height: 180px; color: #6b7280; border: 2px dashed #e5e7eb; border-radius: 16px; background: #fcfcfd; }
  .car-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; border: 1px solid; font-size: 12px; line-height: 1; white-space: nowrap; }
`;

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
