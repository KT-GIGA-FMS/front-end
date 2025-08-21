const BASE_URL = 'https://kt-fms-apim-dev.azure-api.net/analytics-service/v1';

// API 요청 함수
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    console.log(`[ANALYTICS API] 요청: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 필요시 인증 헤더 추가
        // 'Authorization': `Bearer ${token}`,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[ANALYTICS API] 응답:`, data);
    return data;
  } catch (error) {
    console.error(`[ANALYTICS API] 오류 (${url}):`, error);
    throw error;
  }
}

// 대시보드 전체 통계 조회
export async function getDashboardStats() {
  return await apiRequest('/dashboard/stats');
}

// 차량 통계 조회
export async function getVehicleStats() {
  return await apiRequest('/vehicles/stats');
}

// 운행 통계 조회
export async function getDrivingStats() {
  return await apiRequest('/driving/stats');
}

// 연료 통계 조회
export async function getFuelStats() {
  return await apiRequest('/fuel/stats');
}

// 알림/경고 통계 조회
export async function getAlertStats() {
  return await apiRequest('/alerts/stats');
}

// 시간별 데이터 조회 (차트용)
export async function getHourlyData(type = 'driving', date = null) {
  const dateParam = date ? `?date=${date}` : '';
  return await apiRequest(`/charts/hourly/${type}${dateParam}`);
}

// 일별 데이터 조회 (차트용)
export async function getDailyData(type = 'driving', startDate = null, endDate = null) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  return await apiRequest(`/charts/daily/${type}${queryString}`);
}

// 월별 데이터 조회 (차트용)
export async function getMonthlyData(type = 'driving', year = null) {
  const yearParam = year ? `?year=${year}` : '';
  return await apiRequest(`/charts/monthly/${type}${yearParam}`);
}

// 차량별 성능 데이터 조회
export async function getVehiclePerformance() {
  return await apiRequest('/vehicles/performance');
}

// 지역별 통계 조회
export async function getRegionalStats() {
  return await apiRequest('/regional/stats');
}

// 실시간 KPI 조회
export async function getRealTimeKPI() {
  return await apiRequest('/realtime/kpi');
}

// 사용량 트렌드 조회
export async function getUsageTrends(period = '7d') {
  return await apiRequest(`/trends/usage?period=${period}`);
}

// Mock 데이터 생성 함수 (API가 아직 준비되지 않은 경우)
export function generateMockData() {
  return {
    dashboardStats: {
      totalVehicles: 156,
      activeVehicles: 142,
      totalDistance: 15420.5,
      avgFuelEfficiency: 12.3,
      totalAlerts: 23,
      onlineVehicles: 138
    },
    
    vehicleStats: {
      byType: [
        { type: '승용차', count: 89, percentage: 57.1 },
        { type: '트럭', count: 34, percentage: 21.8 },
        { type: '버스', count: 18, percentage: 11.5 },
        { type: '기타', count: 15, percentage: 9.6 }
      ],
      byStatus: [
        { status: '운행중', count: 142, color: '#10B981' },
        { status: '대기중', count: 8, color: '#F59E0B' },
        { status: '정비중', count: 6, color: '#EF4444' }
      ]
    },

    drivingStats: {
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        distance: Math.random() * 1000 + 200,
        vehicles: Math.floor(Math.random() * 50) + 20,
        alerts: Math.floor(Math.random() * 10)
      })),
      
      dailyData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        distance: Math.random() * 5000 + 1000,
        fuel: Math.random() * 500 + 100,
        trips: Math.floor(Math.random() * 200) + 50
      }))
    },

    fuelStats: {
      efficiency: [
        { vehicle: 'veh-0001', efficiency: 14.2, distance: 245.3 },
        { vehicle: 'veh-0002', efficiency: 12.8, distance: 189.7 },
        { vehicle: 'veh-0003', efficiency: 15.1, distance: 312.4 },
        { vehicle: 'veh-0004', efficiency: 11.9, distance: 156.8 },
        { vehicle: 'veh-0005', efficiency: 13.6, distance: 278.2 }
      ],
      consumption: {
        today: 1250.5,
        yesterday: 1180.3,
        thisWeek: 8234.7,
        lastWeek: 7956.2
      }
    },

    alerts: [
      { id: 1, type: '속도위반', vehicle: 'veh-0001', time: new Date(Date.now() - 1000 * 60 * 15), severity: 'high' },
      { id: 2, type: '연료부족', vehicle: 'veh-0003', time: new Date(Date.now() - 1000 * 60 * 45), severity: 'medium' },
      { id: 3, type: '정비필요', vehicle: 'veh-0007', time: new Date(Date.now() - 1000 * 60 * 120), severity: 'low' },
      { id: 4, type: '경로이탈', vehicle: 'veh-0002', time: new Date(Date.now() - 1000 * 60 * 180), severity: 'high' },
      { id: 5, type: '엔진경고', vehicle: 'veh-0005', time: new Date(Date.now() - 1000 * 60 * 300), severity: 'high' }
    ]
  };
}
