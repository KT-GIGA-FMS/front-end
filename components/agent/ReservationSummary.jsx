// components/agent/ReservationSummary.jsx
"use client";
export default function ReservationSummary({ reservation }) {
  // 예시: { id, userId, model, from, to, status }
  const r = reservation || {};
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="font-semibold mb-2">예약 요약</div>
      <div className="text-sm space-y-1">
        <div>예약번호: {r.id || "-"}</div>
        <div>사용자: {r.userId || "-"}</div>
        <div>차량: {r.model || "-"}</div>
        <div>기간: {r.from || "-"} ~ {r.to || "-"}</div>
        <div>상태: {r.status || "-"}</div>
      </div>
    </div>
  );
}
