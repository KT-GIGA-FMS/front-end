import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS 헤더 추가 함수
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Ocp-Apim-Subscription-Key');
  return response;
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return setCorsHeaders(new Response(null, { status: 200 }));
}

// Agent API 프록시 - 모든 Agent API 호출을 처리
export async function POST(req) {
  const base = process.env.NEXT_PUBLIC_AGENT_API_BASE?.replace(/\/+$/, "");
  const key = process.env.AGENT_APIM_KEY;
  
  if (!base) {
    console.error('❌ Missing environment variables:', {
      NEXT_PUBLIC_AGENT_API_BASE: process.env.NEXT_PUBLIC_AGENT_API_BASE,
      AGENT_APIM_KEY: process.env.AGENT_APIM_KEY ? '[PRESENT]' : '[MISSING]'
    });
    const errorResponse = NextResponse.json(
      { 
        error: 'Agent API 설정이 누락되었습니다.',
        details: 'NEXT_PUBLIC_AGENT_API_BASE 환경변수가 설정되지 않았습니다.' 
      },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }

  try {
    const body = await req.json();
    const { endpoint, ...requestData } = body;
    
    // endpoint가 없으면 기본값 사용
    const url = endpoint || '/api/v1/sessions';
    const fullUrl = `${base}${url}`;
    
    console.log('🔗 Agent API Request:', {
      url: fullUrl,
      endpoint: url,
      hasKey: !!key,
      requestData
    });
    
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
    
    const response = NextResponse.json(data, { status: resp.status });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Agent API Proxy Error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Agent API 호출 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}
