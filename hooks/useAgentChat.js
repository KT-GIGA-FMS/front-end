// hooks/useAgentChat.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSession, sendChat, setVehicle, confirmReservation } from "../services/agent/agentApi";
import { load, save } from "../utils/storage";

const STORAGE_KEY = "agent_session_id_v1";

export default function useAgentChat() {
  const [sessionId, setSessionId] = useState(null); // 일시적으로 저장된 세션 무시
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', content:string}
  const [context, setContext] = useState(null); // 예약 컨텍스트(가용성/선택모델/시간 등)
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  


  // 최초 마운트 시 세션 없으면 생성
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (!sessionId) {
      (async () => {
        try {
          const s = await createSession();
          
          // Agent API 응답에서 세션 ID 추출
          const extractedSessionId = s.session_id || s.sessionId || s.id;
          
          if (extractedSessionId) {
            setSessionId(extractedSessionId);
            save(STORAGE_KEY, extractedSessionId);
          }
          
          // Agent API 응답이 있으면 메시지로 추가
          if (s.response) {
            setMessages([{ role: "assistant", content: s.response }]);
          } else {
            // 기본 웰컴 메시지
            setMessages([{ role: "assistant", content: "안녕하세요! 차량 예약 도우미입니다. 원하는 시간/차량을 말씀해 주세요." }]);
          }
          
          // 컨텍스트 설정
          if (s.status || s.missing_info || s.filled_slots) {
            setContext({
              status: s.status,
              missing_info: s.missing_info,
              next_question: s.next_question,
              filled_slots: s.filled_slots
            });
          }
        } catch (e) {
          console.error('❌ Session creation failed:', e);
        }
      })();
    }
  }, [sessionId]);

  const send = async (text) => {
    if (!text?.trim() || !sessionId) return;
    setLoading(true);
    try {
      // 낙관적 업데이트 - 사용자 메시지 추가
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      
      const res = await sendChat({ sessionId, message: text });
      
      // Agent API 응답 처리
      if (res.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
      }
      
      // 컨텍스트 업데이트
      if (res.status || res.missing_info || res.filled_slots) {
        setContext({
          status: res.status,
          missing_info: res.missing_info,
          next_question: res.next_question,
          filled_slots: res.filled_slots
        });
      }
    } catch (error) {
      console.error('❌ Send message failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const chooseVehicle = async (model) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await setVehicle({ sessionId, model });
      
      // Agent API 응답 처리
      if (res.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
      }
      
      // 컨텍스트 업데이트
      if (res.status || res.missing_info || res.filled_slots) {
        setContext({
          status: res.status,
          missing_info: res.missing_info,
          next_question: res.next_question,
          filled_slots: res.filled_slots
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const complete = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await confirmReservation({ sessionId });
      
      // Agent API 응답 처리
      if (res.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
      }
      
      // 컨텍스트 업데이트
      if (res.status || res.missing_info || res.filled_slots) {
        setContext({
          status: res.status,
          missing_info: res.missing_info,
          next_question: res.next_question,
          filled_slots: res.filled_slots
        });
      }
      
      return res;
    } finally {
      setLoading(false);
    }
  };

  const state = useMemo(() => ({ sessionId, messages, context, loading }), [sessionId, messages, context, loading]);
  return { ...state, send, chooseVehicle, complete };
}
