
"use client";

import { useState } from "react";
import NavBar from "../../components/NavBar";

// 더미 사용자 데이터
const userData = [
  {
    id: 1,
    name: "김사원",
    role: "주임",
    userId: "u_001",
    licenseType: "1종보통",
    vehicleType: "법인",
    department: "개발팀",
    createdDate: "2024.01.15",
    status: "활성"
  },
  {
    id: 2,
    name: "이대리",
    role: "대리",
    userId: "u_002",
    licenseType: "2종보통",
    vehicleType: "개인",
    department: "마케팅팀",
    createdDate: "2024.02.20",
    status: "활성"
  },
  {
    id: 3,
    name: "박과장",
    role: "과장",
    userId: "u_003",
    licenseType: "1종보통",
    vehicleType: "법인",
    department: "영업팀",
    createdDate: "2024.03.10",
    status: "비활성"
  }
];

const statusColors = {
  '활성': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  '비활성': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '대기': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
};

const vehicleTypeColors = {
  '법인': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '개인': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
};

export default function UserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const tabs = [
    { label: "사용자 관리", href: "/user" }
  ];

  const filteredData = userData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.includes(searchTerm) ||
                         user.department.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredData.map(u => u.id));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <NavBar tabs={tabs} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
            <div className="flex items-center gap-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                사용자 등록
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                일괄 수정
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="이름, 사용자ID 또는 부서로 검색"
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
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
              <option value="대기">대기</option>
            </select>
          </div>
        </div>

        {/* 사용자 관리 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredData.length && filteredData.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    운전면허
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    차량 구분
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((user) => {
                  const statusStyle = statusColors[user.status] || statusColors['활성'];
                  const vehicleStyle = vehicleTypeColors[user.vehicleType] || vehicleTypeColors['법인'];
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.role}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">
                          {user.userId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.licenseType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${vehicleStyle.bg} ${vehicleStyle.text} ${vehicleStyle.border}`}>
                          {user.vehicleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.createdDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            수정
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            권한관리
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
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{userData.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-green-600">
                  {userData.filter(u => u.status === '활성').length}
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
                <p className="text-sm font-medium text-gray-600">법인 차량 사용자</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userData.filter(u => u.vehicleType === '법인').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">1종 면허 보유자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userData.filter(u => u.licenseType === '1종보통').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}