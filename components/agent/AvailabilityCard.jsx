// components/agent/AvailabilityCard.jsx
"use client";
export default function AvailabilityCard({ availability }) {
  // 예시: { model:"아반떼", from:"2025-08-22T05:00:00Z", to:"2025-08-22T09:00:00Z", isAvailable:true }
  const { model, from, to, isAvailable } = availability || {};
  return (
    <div className="rounded-xl border p-3 bg-white">
      <div className="text-sm text-gray-500 mb-1">가용성 확인</div>
      <div className="text-sm">
        <span className="font-medium">{model || "차량"}</span> — {from} ~ {to}
      </div>
      <div className={`text-sm mt-1 ${isAvailable ? "text-green-600" : "text-red-600"}`}>
        {isAvailable ? "예약 가능" : "예약 불가"}
      </div>
    </div>
  );
}
