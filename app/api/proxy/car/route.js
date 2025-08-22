import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_CAR_BASE_URL;
  const key = process.env.APIM_SUBSCRIPTION_KEY;
  
  try {
    const resp = await fetch(`${base}/cars`, {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await resp.json();
    console.log('[CAR API] GET 응답 데이터:', JSON.stringify(data, null, 2));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('[CAR API] GET 오류:', error);
    return NextResponse.json({ error: '차량 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(req) {
  const base = process.env.NEXT_PUBLIC_CAR_BASE_URL;
  const key = process.env.APIM_SUBSCRIPTION_KEY;
  const body = await req.json();
  
  console.log('[CAR API] POST 요청 데이터:', JSON.stringify(body, null, 2));

  try {
    // 1. 차량 등록
    const carResp = await fetch(`${base}/cars`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const carData = await carResp.json();
    console.log('[CAR API] POST 응답 데이터:', JSON.stringify(carData, null, 2));
    
    if (!carResp.ok) {
      throw new Error(`차량 등록 실패: ${carResp.status}`);
    }

    // 2. 분석 시스템에 차량 정보 동기화 (선택사항)
    try {
      await syncToAnalytics(carData, key);
    } catch (syncError) {
      console.warn('[CAR API] 분석 시스템 동기화 실패:', syncError);
      // 차량 등록은 성공했으므로 계속 진행
    }

    return NextResponse.json(carData, { status: carResp.status });
  } catch (error) {
    console.error('[CAR API] POST 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 분석 시스템에 차량 정보 동기화
async function syncToAnalytics(carData, apiKey) {
  const analyticsBase = 'https://kt-fms-apim-dev.azure-api.net/analytics-service/v1';
  
  const syncData = {
    vehicleId: carData.id || carData.carId,
    plateNo: carData.plateNo,
    carType: carData.carType,
    fuelType: carData.fuelType,
    efficiency: carData.efficiencyKmPerL,
    status: carData.status,
    registeredAt: new Date().toISOString()
  };

  await fetch(`${analyticsBase}/vehicles/sync`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(syncData)
  });
}