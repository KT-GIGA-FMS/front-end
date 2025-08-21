import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Agent API 프록시 - 모든 Agent API 호출을 처리
export async function POST(req) {
  const base = process.env.NEXT_PUBLIC_AGENT_API_BASE?.replace(/\/+$/, "");
  const key = process.env.AGENT_APIM_KEY;
  
  if (!base) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_AGENT_API_BASE 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { endpoint, ...requestData } = body;
    
    // endpoint가 없으면 기본값 사용
    const url = endpoint || '/api/v1/sessions';
    const fullUrl = `${base}${url}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (key) {
      headers['Ocp-Apim-Subscription-Key'] = key;
    }
    
    const resp = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
      cache: 'no-store'
    });
    
    const data = await resp.json();
    
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Agent API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Agent API 호출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
