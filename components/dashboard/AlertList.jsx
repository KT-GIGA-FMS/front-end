"use client";

export default function AlertList({ alerts, title = "최근 알림" }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const formatTime = (time) => {
    const now = new Date();
    const alertTime = new Date(time);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return alertTime.toLocaleDateString();
  };

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#111827",
          margin: "0"
        }}>
          {title}
        </h3>
        <span style={{
          fontSize: "12px",
          color: "#6B7280",
          background: "#F3F4F6",
          padding: "4px 8px",
          borderRadius: "12px"
        }}>
          {alerts?.length || 0}건
        </span>
      </div>

      <div style={{
        maxHeight: "300px",
        overflowY: "auto"
      }}>
        {alerts && alerts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alerts.map((alert, index) => (
              <div
                key={alert.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "#F9FAFB",
                  borderRadius: "8px",
                  border: `1px solid ${getSeverityColor(alert.severity)}20`
                }}
              >
                <div style={{
                  fontSize: "16px",
                  flexShrink: 0
                }}>
                  {getSeverityIcon(alert.severity)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "4px"
                  }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#111827"
                    }}>
                      {alert.type}
                    </span>
                    <span style={{
                      fontSize: "11px",
                      color: "#6B7280",
                      flexShrink: 0,
                      marginLeft: "8px"
                    }}>
                      {formatTime(alert.time)}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: "12px",
                    color: "#6B7280"
                  }}>
                    차량: <span style={{ fontWeight: "500" }}>{alert.vehicle}</span>
                  </div>
                </div>

                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getSeverityColor(alert.severity),
                  flexShrink: 0
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6B7280"
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📋</div>
            <div>알림이 없습니다</div>
          </div>
        )}
      </div>

      {alerts && alerts.length > 5 && (
        <div style={{
          textAlign: "center",
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: "1px solid #E5E7EB"
        }}>
          <button style={{
            fontSize: "12px",
            color: "#3B82F6",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline"
          }}>
            모든 알림 보기
          </button>
        </div>
      )}
    </div>
  );
}
