// components/agent/MessageBubble.jsx
"use client";
export default function MessageBubble({ role = "assistant", content = "" }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}
      >
        {content}
      </div>
    </div>
  );
}
