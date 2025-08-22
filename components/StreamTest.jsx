"use client";

import { useState, useEffect } from "react";
import useCarStream from "../hooks/useCarStream";

/**
 * STOMP 스트림 데이터 수신 테스트 컴포넌트
 * veh-0001 차량으로 고정하여 데이터 수신 상태를 실시간으로 확인
 */
export default function StreamTest() {
  const [testVehicleId, setTestVehicleId] = useState("veh-0001");
  const [messageHistory, setMessageHistory] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);

  // 테스트 차량의 스트림 데이터 구독
  const streamData = useCarStream(testVehicleId, {
    byCar: true,
    throttleMs: 50, // 빠른 업데이트
    maxPath: 100,
    debug: true,
  });

  const { connected, lastPoint, lastTelemetry, topic, publish } = streamData;

  // 메시지 히스토리 업데이트
  useEffect(() => {
    if (lastPoint) {
      const newMessage = {
        id: Date.now(),
        type: 'POINT',
        timestamp: new Date().toLocaleTimeString(),
        data: lastPoint
      };
      
      setMessageHistory(prev => {
        const updated = [newMessage, ...prev].slice(0, 50); // 최근 50개만 유지
        return updated;
      });
      
      console.log("🧪 [STREAM-TEST] 새로운 포인트 데이터:", lastPoint);
    }
  }, [lastPoint]);

  useEffect(() => {
    if (lastTelemetry) {
      const newMessage = {
        id: Date.now() + 1,
        type: 'TELEMETRY',
        timestamp: new Date().toLocaleTimeString(),
        data: lastTelemetry
      };
      
      setMessageHistory(prev => {
        const updated = [newMessage, ...prev].slice(0, 50);
        return updated;
      });
      
      console.log("🧪 [STREAM-TEST] 새로운 텔레메트리 데이터:", lastTelemetry);
    }
  }, [lastTelemetry]);

  // 테스트 데이터 요청
  const requestTestData = () => {
    if (!connected) {
      alert("STOMP 연결이 없습니다!");
      return;
    }
    
    const testMessage = {
      action: "request_test_data",
      vehicleId: testVehicleId,
      timestamp: Date.now(),
      requestId: Math.random().toString(36).substr(2, 9)
    };
    
    console.log("🧪 [STREAM-TEST] 테스트 데이터 요청:", testMessage);
    publish(testMessage);
  };

  // 차량 ID 변경
  const changeTestVehicle = (newVehicleId) => {
    console.log(`🧪 [STREAM-TEST] 테스트 차량 변경: ${testVehicleId} → ${newVehicleId}`);
    setTestVehicleId(newVehicleId);
    setMessageHistory([]); // 히스토리 초기화
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "monospace"
    }}>
      <h2 style={{ color: "#2563eb", marginBottom: "20px" }}>
        🧪 STOMP 스트림 데이터 테스트
      </h2>
      
      {/* 연결 상태 및 제어 패널 */}
      <div style={{ 
        background: "#f8fafc", 
        border: "1px solid #e2e8f0", 
        borderRadius: "8px", 
        padding: "16px", 
        marginBottom: "20px" 
      }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <strong>연결 상태:</strong>{" "}
            <span style={{ 
              color: connected ? "#16a34a" : "#dc2626",
              fontWeight: "bold"
            }}>
              {connected ? "✅ 연결됨" : "❌ 연결 안됨"}
            </span>
          </div>
          
          <div>
            <strong>테스트 차량:</strong>{" "}
            <select 
              value={testVehicleId} 
              onChange={(e) => changeTestVehicle(e.target.value)}
              style={{ padding: "4px 8px", marginLeft: "8px" }}
            >
              <option value="veh-0001">veh-0001</option>
              <option value="veh-0002">veh-0002</option>
              <option value="veh-0003">veh-0003</option>
              <option value="veh-0004">veh-0004</option>
              <option value="veh-0005">veh-0005</option>
              <option value="veh-0006">veh-0006</option>
            </select>
          </div>
          
          <div>
            <strong>구독 토픽:</strong>{" "}
            <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
              {topic}
            </code>
          </div>
          
          <button
            onClick={requestTestData}
            disabled={!connected}
            style={{
              padding: "8px 16px",
              background: connected ? "#2563eb" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: connected ? "pointer" : "not-allowed"
            }}
          >
            📡 테스트 데이터 요청
          </button>
        </div>
      </div>

      {/* 현재 상태 표시 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* 최신 포인트 데이터 */}
        <div style={{ 
          background: "#f0f9ff", 
          border: "1px solid #0ea5e9", 
          borderRadius: "8px", 
          padding: "16px" 
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#0369a1" }}>📍 최신 위치 데이터</h3>
          {lastPoint ? (
            <pre style={{ 
              background: "white", 
              padding: "12px", 
              borderRadius: "4px", 
              fontSize: "12px",
              overflow: "auto",
              margin: 0
            }}>
              {JSON.stringify(lastPoint, null, 2)}
            </pre>
          ) : (
            <div style={{ color: "#64748b", fontStyle: "italic" }}>
              데이터 수신 대기 중...
            </div>
          )}
        </div>

        {/* 최신 텔레메트리 데이터 */}
        <div style={{ 
          background: "#fdf4ff", 
          border: "1px solid #a855f7", 
          borderRadius: "8px", 
          padding: "16px" 
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#7c2d12" }}>📡 최신 텔레메트리</h3>
          {lastTelemetry ? (
            <pre style={{ 
              background: "white", 
              padding: "12px", 
              borderRadius: "4px", 
              fontSize: "12px",
              overflow: "auto",
              margin: 0
            }}>
              {JSON.stringify(lastTelemetry, null, 2)}
            </pre>
          ) : (
            <div style={{ color: "#64748b", fontStyle: "italic" }}>
              데이터 수신 대기 중...
            </div>
          )}
        </div>
      </div>

      {/* 메시지 히스토리 */}
      <div style={{ 
        background: "#fafafa", 
        border: "1px solid #d1d5db", 
        borderRadius: "8px", 
        padding: "16px" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, color: "#374151" }}>
            📋 수신 메시지 히스토리 ({messageHistory.length}/50)
          </h3>
          <div>
            <label style={{ marginRight: "16px" }}>
              <input 
                type="checkbox" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.target.checked)}
                style={{ marginRight: "4px" }}
              />
              자동 스크롤
            </label>
            <button
              onClick={() => setMessageHistory([])}
              style={{
                padding: "4px 8px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              히스토리 지우기
            </button>
          </div>
        </div>
        
        <div style={{ 
          maxHeight: "400px", 
          overflowY: "auto", 
          background: "white", 
          border: "1px solid #e5e7eb",
          borderRadius: "4px"
        }}>
          {messageHistory.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              아직 수신된 메시지가 없습니다.
            </div>
          ) : (
            messageHistory.map((msg) => (
              <div 
                key={msg.id}
                style={{ 
                  borderBottom: "1px solid #f3f4f6",
                  padding: "12px",
                  fontSize: "12px"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "8px"
                }}>
                  <span style={{ 
                    background: msg.type === 'POINT' ? "#dbeafe" : "#fae8ff",
                    color: msg.type === 'POINT' ? "#1e40af" : "#7c2d12",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "bold"
                  }}>
                    {msg.type}
                  </span>
                  <span style={{ color: "#6b7280" }}>{msg.timestamp}</span>
                </div>
                <pre style={{ 
                  margin: 0, 
                  fontSize: "10px", 
                  color: "#374151",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}>
                  {JSON.stringify(msg.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 환경변수 정보 */}
      <div style={{ 
        marginTop: "20px",
        padding: "12px",
        background: "#fffbeb",
        border: "1px solid #f59e0b",
        borderRadius: "8px",
        fontSize: "12px"
      }}>
        <strong>🔧 디버깅 정보:</strong>
        <div style={{ marginTop: "8px" }}>
          <div><strong>NEXT_PUBLIC_SOCKJS_HTTP:</strong> {process.env.NEXT_PUBLIC_SOCKJS_HTTP || "❌ 설정되지 않음"}</div>
          <div><strong>현재 토픽:</strong> {topic}</div>
          <div><strong>브라우저 콘솔:</strong> [WS], [MAP], [STREAM-TEST] 태그로 상세 로그 확인 가능</div>
        </div>
      </div>
    </div>
  );
}
