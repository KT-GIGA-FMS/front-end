"use client";

export default function KPICard({ title, value, unit, icon, change, changeType, color = "#3B82F6" }) {
  const changeColor = changeType === 'increase' ? '#10B981' : changeType === 'decrease' ? '#EF4444' : '#6B7280';
  const changeIcon = changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→';

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* 색상 액센트 */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "4px",
        height: "100%",
        background: color
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "14px",
            color: "#6B7280",
            fontWeight: "500",
            marginBottom: "8px"
          }}>
            {title}
          </div>
          
          <div style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#111827",
            lineHeight: "1",
            marginBottom: "4px"
          }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && (
              <span style={{
                fontSize: "16px",
                color: "#6B7280",
                fontWeight: "500",
                marginLeft: "4px"
              }}>
                {unit}
              </span>
            )}
          </div>

          {change && (
            <div style={{
              fontSize: "12px",
              color: changeColor,
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span>{changeIcon}</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        {icon && (
          <div style={{
            fontSize: "24px",
            color: color,
            opacity: 0.8
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
