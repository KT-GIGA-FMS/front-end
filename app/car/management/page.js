// app/car/management/page.js
"use client";

import { useState, useEffect } from "react";
import NavBar from "../../../components/NavBar";

const statusColors = {
  '정상': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '정비필요': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '점검중': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '사용불가': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

export default function CarManagementPage() {
  const [vehicleManagementData, setVehicleManagementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // 차량 목록 데이터를 관리 데이터로 변환하는 함수
  const transformCarData = (cars) => {
    return cars.map((car, index) => {
      // 차량 모델 매핑
      const modelMap = {
        1: "G90",
        2: "아반떼", 
        3: "G70",
        4: "소나타",
        5: "K5"
      };

      // 역방향 모델명 매핑 (모델명 → ID)
      const reverseModelMap = {
        "G90": 1,
        "아반떼": 2,
        "G70": 3,
        "소나타": 4,
        "K5": 5
      };

      // 상태 매핑
      const statusMap = {
        '사용가능': '정상',
        '사용대기': '점검중',
        '불가': '정비필요'
      };

      // 주행거리 생성 (등록일 기준)
      const daysSinceRegistration = car.createdAt 
        ? Math.floor((Date.now() - new Date(car.createdAt)) / (1000 * 60 * 60 * 24))
        : Math.floor(Math.random() * 365);
      const mileage = Math.max(100, Math.floor(Math.random() * 50 + 10) * Math.max(1, daysSinceRegistration));

      // 위치 생성
      const locations = [
        '본사 주차장 A구역',
        '본사 주차장 B구역', 
        '지사 주차장',
        '정비소',
        '외부 업무'
      ];

      // 담당자 생성
      const drivers = ['김사원', '이대리', '박과장', '최팀장', '-'];

      // 날짜 포맷 함수
      const formatDate = (dateStr, dayOffset = 0) => {
        const date = dateStr ? new Date(dateStr) : new Date();
        date.setDate(date.getDate() + dayOffset);
        return date.toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1);
      };

      // 모델명 결정 로직 강화
      let modelName = "알 수 없는 모델";
      
      // 1순위: carModelName (새로운 모달에서 입력된 경우)
      if (car.carModelName && car.carModelName.trim()) {
        modelName = car.carModelName.trim();
      } 
      // 2순위: carModelId를 통한 매핑
      else if (car.carModelId !== undefined && car.carModelId !== null) {
        modelName = modelMap[car.carModelId] || `모델${car.carModelId}`;
      }
      // 3순위: model 필드
      else if (car.model && car.model.trim()) {
        modelName = car.model.trim();
      }
      // 4순위: modelName 필드 (다른 가능한 필드명)
      else if (car.modelName && car.modelName.trim()) {
        modelName = car.modelName.trim();
      }
      // 5순위: name 필드
      else if (car.name && car.name.trim()) {
        modelName = car.name.trim();
      }
      // 최후순위: 번호판이라도 표시
      else if (car.plateNo) {
        modelName = `차량(${car.plateNo})`;
      }

      console.log('🚗 차량 데이터 디버깅:', {
        index: index,
        carModelName: car.carModelName,
        carModelId: car.carModelId,
        model: car.model,
        modelName: car.modelName,
        name: car.name,
        plateNo: car.plateNo,
        결정된모델명: modelName,
        전체필드목록: Object.keys(car),
        전체데이터: car
      });

      return {
        id: car.id || car.carId || index + 1,
        name: modelName,
        plateNumber: car.plateNo || `미등록${index + 1}`,
        model: `${car.carType || '일반'} ${car.fuelType || '휘발유'}`,
        year: car.createdAt ? new Date(car.createdAt).getFullYear().toString() : "2024",
        fuelType: car.fuelType || "휘발유",
        status: statusMap[car.status] || '정상',
        mileage: mileage.toLocaleString(),
        lastInspection: formatDate(car.createdAt, -90), // 90일 전
        nextInspection: formatDate(car.createdAt, 90),  // 90일 후
        location: locations[(car.id || index) % locations.length],
        driver: drivers[(car.id || index) % drivers.length],
        efficiency: car.efficiencyKmPerL,
        originalData: car // 원본 데이터 보관
      };
    });
  };

  // 차량 데이터 로드
  useEffect(() => {
    async function loadVehicleData() {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy/car', {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 원본 API 응답 데이터:', data);
          const cars = Array.isArray(data) ? data : (data.cars || data.data || []);
          console.log('🚗 차량 배열 데이터:', cars);
          const transformedData = transformCarData(cars);
          setVehicleManagementData(transformedData);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('차량 관리 데이터 로드 실패:', error);
        setVehicleManagementData([]);
      } finally {
        setLoading(false);
      }
    }

    loadVehicleData();

    // 30초마다 자동 새로고침
    const interval = setInterval(loadVehicleData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 수동 새로고침
  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proxy/car', {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 새로고침 API 응답:', data);
        const cars = Array.isArray(data) ? data : (data.cars || data.data || []);
        const transformedData = transformCarData(cars);
        setVehicleManagementData(transformedData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      alert('데이터 새로고침에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "차량 목록", href: "/car/cars" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservation" }
  ];

  // 로딩 상태 표시
  if (loading && vehicleManagementData.length === 0) {
    return (
      <div className="w-full bg-gray-50">
        <NavBar tabs={tabs} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">차량 관리 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = vehicleManagementData.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plateNumber.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const selectAllVehicles = () => {
    if (selectedVehicles.length === filteredData.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredData.map(v => v.id));
    }
  };

  return (
    <div className=" w-full bg-gray-50">
      <NavBar tabs={tabs} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚗 차량 관리</h1>
              <p className="text-sm text-gray-600 mt-1">
                마지막 업데이트: {lastUpdated.toLocaleString()}
                {loading && <span className="text-blue-600 ml-2">(업데이트 중...)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={refreshData}
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
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                📋 일괄 정비 예약
              </button>
              <a 
                href="/analytics" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📊 분석 대시보드
              </a>
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span>ℹ️</span>
              <span className="text-sm">
                <strong>실시간 연동:</strong> 차량 목록에서 등록된 차량이 자동으로 관리 데이터에 반영됩니다.
              </span>
              <a href="/car/cars" className="text-blue-600 hover:text-blue-700 underline ml-2">
                차량 등록하러 가기 →
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="차량명 또는 번호판으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">전체 상태</option>
              <option value="정상">정상</option>
              <option value="정비필요">정비필요</option>
              <option value="점검중">점검중</option>
              <option value="사용불가">사용불가</option>
            </select>
          </div>
        </div>

        {/* 차량 관리 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.length === filteredData.length && filteredData.length > 0}
                      onChange={selectAllVehicles}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    차량 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주행거리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    점검 일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 위치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연비
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((vehicle) => {
                  const statusStyle = statusColors[vehicle.status] || statusColors['정상'];
                  
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={() => toggleVehicleSelection(vehicle.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.plateNumber}
                            </div>
                            <div className="text-xs text-gray-400">
                              {vehicle.model} ({vehicle.year})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.mileage} km
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          다음: {vehicle.nextInspection}
                        </div>
                        <div className="text-xs text-gray-500">
                          이전: {vehicle.lastInspection}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.driver}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {vehicle.efficiency ? `${vehicle.efficiency} km/L` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="차량 상세 정보"
                          >
                            📋 상세
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="정비 예약"
                          >
                            🔧 정비예약
                          </button>
                          <a 
                            href={`/car-tracking?vehicleId=${vehicle.originalData?.plateNo || vehicle.plateNumber}`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            title="실시간 추적"
                          >
                            📍 추적
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {vehicleManagementData.length === 0 ? (
                  <div>
                    <div className="text-4xl mb-4">🚗</div>
                    <p className="mb-2">등록된 차량이 없습니다</p>
                    <a href="/car/cars" className="text-blue-600 hover:text-blue-700 underline">
                      차량을 등록해보세요 →
                    </a>
                  </div>
                ) : (
                  "검색 결과가 없습니다."
                )}
              </div>
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">전체 차량</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleManagementData.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">정상 운행</p>
                <p className="text-2xl font-bold text-green-600">
                  {vehicleManagementData.filter(v => v.status === '정상').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">정비 필요</p>
                <p className="text-2xl font-bold text-red-600">
                  {vehicleManagementData.filter(v => v.status === '정비필요').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">평균 주행거리</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicleManagementData.length > 0 
                    ? Math.round(vehicleManagementData.reduce((sum, v) => sum + parseInt(v.mileage.replace(/,/g, '')), 0) / vehicleManagementData.length).toLocaleString() + 'km'
                    : '0km'
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}