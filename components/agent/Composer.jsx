// components/agent/Composer.jsx
"use client";
import { useState } from "react";

export default function Composer({ onSend, loading, onComplete }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder='예시 : 내일 오후 2시부터 6시까지 아반떼 예약해줘'
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button
        className="rounded-xl border px-3 py-2 text-sm"
        onClick={submit}
        disabled={loading}
      >
        전송
      </button>
      <button
        className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm"
        onClick={onComplete}
        disabled={loading}
        title="에이전트 컨텍스트 기준으로 예약 확정"
      >
        예약 완료
      </button>
    </div>
  );
}
