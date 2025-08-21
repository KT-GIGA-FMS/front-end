// app/car/reservations/agent/page.js
"use client";

import { useEffect, useState } from "react";
import useAgentChat from "../../../hooks/useAgentChat";
import ChatWindow from "../../../components/agent/ChatWindow";
import NavBar from "../../../components/NavBar";

export default function AgentReservationPage() {
  const { sessionId, messages, context, loading, send, chooseVehicle, complete } = useAgentChat();
  const [mounted, setMounted] = useState(false);

  const tabs = [
    { label: "차량 목록", href: "/car" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservation" }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <NavBar tabs={tabs} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">법인 차량 예약</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChatWindow
            messages={messages}
            context={context}
            loading={loading}
            onSend={send}
            onPickVehicle={chooseVehicle}
            onComplete={async () => {
              const res = await complete();
              // 필요하면 알럿/토스트
              if (res?.context?.reservation?.status) {
                alert(`예약 상태: ${res.context.reservation.status}`);
              }
            }}
          />

          {/* 우측 패널: 선택사항(최근 기록/가이드/FAQ 등) → 초기엔 비워둠 */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold mb-2">도움말</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>자연어로 시간/사용자/차량을 말하면 에이전트가 이해해요.</li>
                <li>예: "내일 14~18시, u_001, 아반떼로 예약해줘".</li>
                <li>"예약 완료" 버튼으로 확정할 수 있어요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
