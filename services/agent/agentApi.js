// services/agent/agentApi.js
// 프록시를 통해 Agent API 호출 - CORS 문제 해결
const PROXY_BASE = "/api/proxy/agent";

// 공통 옵션 - 프록시 사용
function opts(method = "POST", body) {
  const headers = {
    "Content-Type": "application/json",
  };

  const o = { method, headers };
  if (body) o.body = JSON.stringify(body);
  return o;
}

// API 함수들 - 프록시를 통해 호출
export async function createSession() {
  // 고유한 세션 ID 생성
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  // 24시간 후 만료
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const res = await fetch(PROXY_BASE, opts("POST", {
    endpoint: "/api/v1/sessions",
    session_id: sessionId,
    expires_at: expiresAt
  }));
  if (!res.ok) throw new Error("세션 생성 실패");
  return res.json(); // { sessionId, ... }
}

export async function sendChat({ sessionId, message, userId = "u_001" }) {
  const res = await fetch(PROXY_BASE, opts("POST", {
    endpoint: "/api/v1/chat",
    session_id: sessionId,
    message,
    user_id: userId
  }));
  if (!res.ok) throw new Error("대화 실패");
  return res.json(); // { messages: [...], context: {...} }
}

export async function setVehicle({ sessionId, model, userId = "u_001" }) {
  // 자연어: "아반떼로 예약"도 chat으로 처리 가능하지만, 명시 API가 있다면 분리
  const res = await fetch(PROXY_BASE, opts("POST", {
    endpoint: "/api/v1/chat",
    session_id: sessionId,
    message: `차량을 ${model}로 예약하고 싶어`,
    user_id: userId
  }));
  if (!res.ok) throw new Error("차량 선택 실패");
  return res.json();
}

export async function confirmReservation({ sessionId, userId = "u_001" }) {
  // "예약 완료해줘"도 chat으로 처리 가능. 명시 엔드포인트가 있으면 교체
  const res = await fetch(PROXY_BASE, opts("POST", {
    endpoint: "/api/v1/chat",
    session_id: sessionId,
    message: "예약 완료해줘",
    user_id: userId
  }));
  if (!res.ok) throw new Error("예약 확정 실패");
  return res.json(); // { reservation: {...} }
}
