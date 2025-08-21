"use client";
import { useEffect, useRef } from 'react';

export default function BarChart({ data, width = 400, height = 300, color = "#10B981", title }) {
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

    // 패딩 설정
    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 데이터 범위 계산
    const values = data.map(d => d.value || d.count || d.percentage || 0);
    const maxValue = Math.max(...values);
    const valueRange = maxValue || 1;

    // 바 너비 계산
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;

    // 그리드 그리기
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;

    // 수평 그리드
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // 바 차트 그리기
    data.forEach((item, index) => {
      const value = values[index];
      const barHeight = (value / valueRange) * chartHeight;
      const x = padding.left + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = padding.top + chartHeight - barHeight;

      // 바 그리기
      const barColor = item.color || color;
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // 바 상단에 값 표시
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1), x + barWidth / 2, y - 5);

      // X축 라벨
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      
      // 라벨이 길면 줄바꿈
      const label = item.label || item.type || item.status || item.name || `Item ${index + 1}`;
      const maxLabelWidth = barWidth + barSpacing;
      
      if (label.length > 8) {
        const words = label.split(' ');
        if (words.length > 1) {
          ctx.fillText(words[0], x + barWidth / 2, padding.top + chartHeight + 15);
          ctx.fillText(words.slice(1).join(' '), x + barWidth / 2, padding.top + chartHeight + 30);
        } else {
          ctx.fillText(label.slice(0, 8) + '...', x + barWidth / 2, padding.top + chartHeight + 15);
        }
      } else {
        ctx.fillText(label, x + barWidth / 2, padding.top + chartHeight + 15);
      }
    });

    // Y축 라벨
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = (valueRange * (5 - i) / 5);
      const y = padding.top + (i / 5) * chartHeight;
      ctx.fillText(value.toFixed(0), padding.left - 10, y + 4);
    }

  }, [data, width, height, color]);

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
