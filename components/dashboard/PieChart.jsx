"use client";
import { useEffect, useRef } from 'react';

export default function PieChart({ data, width = 300, height = 300, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 고해상도 디스플레이 지원
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // 캔버스 클리어
    ctx.clearRect(0, 0, width, height);

    // 중심점과 반지름 설정
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // 총합 계산
    const total = data.reduce((sum, item) => sum + (item.value || item.count || item.percentage || 0), 0);

    // 색상 팔레트
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];

    let currentAngle = -Math.PI / 2; // 12시 방향부터 시작

    // 파이 슬라이스 그리기
    data.forEach((item, index) => {
      const value = item.value || item.count || item.percentage || 0;
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = item.color || colors[index % colors.length];

      // 슬라이스 그리기
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // 테두리 그리기
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 라벨 위치 계산 (슬라이스 중간)
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      // 퍼센티지 표시
      const percentage = ((value / total) * 100).toFixed(1);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (percentage > 5) { // 5% 이상일 때만 라벨 표시
        ctx.fillText(`${percentage}%`, labelX, labelY);
      }

      currentAngle += sliceAngle;
    });

    // 범례 그리기
    const legendX = width - 120;
    const legendY = 20;
    const legendItemHeight = 20;

    data.forEach((item, index) => {
      const color = item.color || colors[index % colors.length];
      const y = legendY + index * legendItemHeight;
      
      // 색상 박스
      ctx.fillStyle = color;
      ctx.fillRect(legendX, y, 12, 12);
      
      // 라벨 텍스트
      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      const label = item.label || item.type || item.status || item.name || `Item ${index + 1}`;
      const value = item.value || item.count || item.percentage || 0;
      ctx.fillText(`${label} (${value})`, legendX + 16, y);
    });

  }, [data, width, height]);

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    }}>
      {title && (
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#111827",
          margin: "0 0 16px 0"
        }}>
          {title}
        </h3>
      )}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          margin: "0 auto"
        }}
      />
    </div>
  );
}
