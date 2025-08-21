// app/car/management/page.js
"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";

// 더미 데이터
const vehicleManagementData = [
  {
    id: 1,
    name: "G90",
    plateNumber: "59너5959",
    model: "제네시스 G90",
    year: "2023",
    fuelType: "가솔린",
    status: "정상",
    mileage: "12,450",
    lastInspection: "2024.06.15",
    nextInspection: "2024.12.15",
    location: "본사 주차장 A구역",
    driver: "김사원",
    // image: "/api/placeholder/60/40"
    // image: "../public/src/car_img/g90.png"
  },
  {
    id: 2,
    name: "아반떼",
    plateNumber: "15라1234",
    model: "현대 아반떼",
    year: "2022",
    fuelType: "가솔린",
    status: "정비필요",
    mileage: "45,230",
    lastInspection: "2024.03.20",
    nextInspection: "2024.09.20",
    location: "정비소",
    driver: "-",
    // image: "/api/placeholder/60/40"
    // image: "../public/src/car_img/avante.png"
  },
  {
    id: 3,
    name: "G시리즈(G70)",
    plateNumber: "321더4740",
    model: "제네시스 G70",
    year: "2023",
    fuelType: "가솔린",
    status: "정상",
    mileage: "8,950",
    lastInspection: "2024.05.10",
    nextInspection: "2024.11.10",
    location: "본사 주차장 B구역",
    driver: "이대리",
    // image: "/api/placeholder/60/40"
    // image: "../public/src/car_img/g70.png"
  }
];

const statusColors = {
  '정상': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '정비필요': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '점검중': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  '사용불가': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

export default function CarManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const tabs = [
    { label: "차량 목록", href: "/car" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservation" }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">차량 관리</h1>
            <div className="flex items-center gap-3">
             
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                일괄 정비 예약
              </button>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            수정
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            정비예약
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            상세
                          </button>
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
              <div className="text-gray-500">검색 결과가 없습니다.</div>
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
                <p className="text-2xl font-bold text-gray-900">22.2km</p>
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