// components/agent/MessageList.jsx
"use client";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages = [] }) {
  return (
    <div className="space-y-2">
      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} content={m.content} />
      ))}
    </div>
  );
}
