// components/agent/ChatWindow.jsx
"use client";
import MessageList from "./MessageList";
import Composer from "./Composer";
import AvailabilityCard from "./AvailabilityCard";
import VehiclePicker from "./VehiclePicker";
import ReservationSummary from "./ReservationSummary";

export default function ChatWindow({ messages, context, loading, onSend, onPickVehicle, onComplete }) {
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] rounded-2xl border bg-white">
      {/* 상단 상태바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="font-semibold">차량 예약 도우미</div>
        <div className="text-sm text-gray-500">{loading ? "응답 중..." : "대기"}</div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <MessageList messages={messages} />
        
 
        
        {/* 차량 선택 가이드 (missing_info에 vehicle_id가 있을 때) */}
        {context?.missing_info?.includes('vehicle_id') && (
          <VehiclePicker onSelect={onPickVehicle} />
        )}
      </div>

      {/* 하단 입력 영역 */}
      <div className="border-t p-3">
        <Composer onSend={onSend} loading={loading} onComplete={onComplete} />
      </div>

      {/* 예약 요약(확정 직전/직후 노출) */}
      {context?.reservation && (
        <ReservationSummary reservation={context.reservation} />
      )}
    </div>
  );
}
