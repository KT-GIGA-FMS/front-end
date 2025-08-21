// services/car/vehicleListApi.js
// 백엔드 API에서 차량 목록을 가져오는 서비스 (Mock 데이터 제거)

const VEHICLE_API_URL = process.env.NEXT_PUBLIC_VEHICLE_API_URL || "";

/**
 * 차량 목록을 백엔드 API에서 가져오는 함수
 * API 실패 시 에러를 throw하여 명확한 에러 상태 표시
 */
export async function getVehicleList() {
  // API URL이 설정되지 않은 경우
  if (!VEHICLE_API_URL || VEHICLE_API_URL === "") {
    const error = new Error("VEHICLE_API_URL이 설정되지 않았습니다. 환경변수를 확인해주세요.");
    error.code = "NO_API_URL";
    throw error;
  }

  console.log("[VEHICLE_API] 차량 목록 요청:", VEHICLE_API_URL);
  
  // 가능한 엔드포인트 목록
  const possibleEndpoints = [
    '',                    // 베이스 URL 그대로 (DTG API의 경우)
    '/vehicles',           // 일반적인 vehicles 엔드포인트
    '/cars',              // cars 엔드포인트
    '/api/vehicles',      // api prefix가 있는 경우
    '/v1/vehicles',       // version prefix가 있는 경우
  ];
  
  let lastError = null;
  
  for (const endpoint of possibleEndpoints) {
    try {
      const url = `${VEHICLE_API_URL}${endpoint}`;
      console.log(`[VEHICLE_API] 시도: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Azure APIM 인증이 필요한 경우
          ...(process.env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY && {
            'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY
          })
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[VEHICLE_API] 성공: ${url}`, data);
        
        // API 응답 데이터 파싱
        const vehicles = parseVehicleData(data);
        
        if (vehicles.length === 0) {
          console.warn(`[VEHICLE_API] 응답은 성공했지만 차량 데이터가 없습니다: ${url}`);
          continue;
        }
        
        console.log(`[VEHICLE_API] 파싱된 차량 목록 (${vehicles.length}대):`, vehicles);
        return vehicles;
        
      } else {
        console.warn(`[VEHICLE_API] ${url} 실패: ${response.status} ${response.statusText}`);
        lastError = new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
        lastError.code = "API_ERROR";
        lastError.status = response.status;
      }
      
    } catch (error) {
      console.error(`[VEHICLE_API] ${endpoint} 에러:`, error.message);
      lastError = error;
    }
  }
  
  // 모든 엔드포인트 실패
  const error = new Error(`모든 API 엔드포인트 호출 실패. 서버 상태를 확인해주세요.\n마지막 에러: ${lastError?.message || '알 수 없는 에러'}`);
  error.code = "ALL_ENDPOINTS_FAILED";
  error.originalError = lastError;
  throw error;
}

/**
 * API 응답 데이터를 차량 목록 형식으로 파싱
 */
function parseVehicleData(data) {
  let vehicles = [];
  
  // 다양한 API 응답 형식 지원
  if (Array.isArray(data)) {
    vehicles = data;
  } else if (data.vehicles && Array.isArray(data.vehicles)) {
    vehicles = data.vehicles;
  } else if (data.data && Array.isArray(data.data)) {
    vehicles = data.data;
  } else if (data.result && Array.isArray(data.result)) {
    vehicles = data.result;
  } else if (data.trips && Array.isArray(data.trips)) {
    // DTG API의 경우 trips 배열에서 vehicleId 추출
    vehicles = data.trips;
  } else {
    console.warn("[VEHICLE_API] 알 수 없는 API 응답 형식:", data);
    return [];
  }
  
  // 데이터 정규화
  return vehicles.map((vehicle, index) => {
    // DTG API 응답 형식 처리
    if (vehicle.trip && vehicle.trip.vehicleId) {
      return {
        vehicleId: vehicle.trip.vehicleId,
        vehicleName: vehicle.trip.vehicleName || `Vehicle_${vehicle.trip.vehicleId}`,
        plateNo: vehicle.trip.plateNo || "정보없음",
        status: vehicle.trip.status || "UNKNOWN"
      };
    }
    
    // 일반적인 vehicle 객체 처리
    return {
      vehicleId: vehicle.vehicleId || vehicle.id || vehicle.vehicle_id || `unknown_${index}`,
      vehicleName: vehicle.vehicleName || vehicle.name || vehicle.vehicle_name || `Vehicle_${vehicle.vehicleId || vehicle.id || index}`,
      plateNo: vehicle.plateNo || vehicle.licensePlate || vehicle.plate_no || "정보없음",
      status: vehicle.status || "UNKNOWN"
    };
  }).filter(vehicle => vehicle.vehicleId && vehicle.vehicleId !== `unknown_${vehicles.indexOf(vehicle)}`);
}

/**
 * 개별 차량 정보 조회 (필요한 경우)
 */
export async function getVehicleInfo(vehicleId) {
  if (!VEHICLE_API_URL) {
    throw new Error("VEHICLE_API_URL이 설정되지 않았습니다.");
  }

  try {
    const response = await fetch(`${VEHICLE_API_URL}/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY && {
          'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_APIM_SUBSCRIPTION_KEY
        })
      },
    });

    if (!response.ok) {
      throw new Error(`차량 정보 조회 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`[VEHICLE_API] 차량 정보 조회 에러: ${vehicleId}`, error);
    throw error;
  }
}