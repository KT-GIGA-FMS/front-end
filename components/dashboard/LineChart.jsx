"use client";
import { useEffect, useRef } from 'react';

export default function LineChart({ data, width = 400, height = 300, color = "#3B82F6", title }) {
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
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 데이터 범위 계산
    const values = data.map(d => d.value || d.distance || d.fuel || d.vehicles || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // 좌표 변환 함수
    const xScale = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (value) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

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

    // 수직 그리드
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (i / 6) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // 라인 차트 그리기
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = xScale(index);
      const y = yScale(values[index]);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 점 그리기
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = xScale(index);
      const y = yScale(values[index]);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // 마우스 오버 시 값 표시 (간단한 버전)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = color;
    });

    // Y축 라벨
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange * (5 - i) / 5);
      const y = padding.top + (i / 5) * chartHeight;
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
    }

    // X축 라벨 (간소화)
    ctx.textAlign = 'center';
    const labelStep = Math.ceil(data.length / 6);
    data.forEach((point, index) => {
      if (index % labelStep === 0 || index === data.length - 1) {
        const x = xScale(index);
        const label = point.label || point.hour !== undefined ? `${point.hour}h` : 
                     point.date ? new Date(point.date).getDate() : index;
        ctx.fillText(label, x, padding.top + chartHeight + 20);
      }
    });

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
