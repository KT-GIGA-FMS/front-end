// components/CarRegisterModal.jsx
"use client";
import { useState } from "react";
import { carApi } from "../../../services/car/carApi";

export default function CarRegisterModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    carModelId: 1,
    plateNo: "",
    // imageUrl: "https://example.com/car1.jpg", // 기본값
    fuelType: "휘발유",
    efficiencyKmPerL: 0,
    status: "사용가능",   // ← API 스펙에 맞춰 한글 상태
    carType: "법인"       // ← ownerType 대신
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onChange = (e) => setForm(f => ({
    ...f,
    [e.target.name]: e.target.value
  }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
  //fetch 보내는 부분 : 프록시 서버 사용 
    try {
      const res = await fetch("/api/proxy/car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": "mykey"
        },
        body: JSON.stringify({
          ...form,
          imageUrl: "https://example.com/default-car.jpg" // 임의의 기본 이미지 URL
        })   // API 스펙과 맞는 JSON 전송
      });
  
      if (!res.ok) throw new Error(`등록 실패: ${res.status}`);
      const data = await res.json();
      console.log("POST 성공:", data);
  
      if (onSubmit) await onSubmit(data);
      setResult(data);
      setForm({
        carModelId: 1, plateNo: "", fuelType: "",
        efficiencyKmPerL: 0, status: "사용가능", carType: "법인"
      });
      onClose();
  
    } catch (err) {
      setError(err.message);
      console.error("POST 실패:", err);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;


  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-full max-w-xl space-y-4">
        <h2 className="text-xl font-bold">차량 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="border p-2 w-full" name="plateNo" placeholder="번호판" onChange={onChange} />
          <input className="border p-2 w-full" name="carModelId" type="number" placeholder="모델 ID" onChange={onChange} />
          {/* <input className="border p-2 w-full" name="imageUrl" placeholder="이미지 URL" onChange={onChange} /> */}
          <input className="border p-2 w-full" name="fuelType" placeholder="연료 종류" onChange={onChange} />
          <input className="border p-2 w-full" name="efficiencyKmPerL" type="number" placeholder="연비(km/L)" onChange={onChange} />

          <select className="border p-2 w-full" name="status" onChange={onChange}>
            <option value="사용가능">사용가능</option>
            <option value="사용대기">사용대기</option>
            <option value="불가">불가</option>
          </select>

          <select className="border p-2 w-full" name="carType" onChange={onChange}>
            <option value="법인">법인</option>
            <option value="개인">개인</option>
          </select>

          <button disabled={loading} className="border p-2 rounded w-full">
            {loading ? "등록 중..." : "등록"}
          </button>
        </form>

        {error && <p className="text-red-600">{error}</p>}
        {result }
        <button onClick={onClose} className="border p-2 rounded w-full">닫기</button>
      </div>
    </div>
  );
}
