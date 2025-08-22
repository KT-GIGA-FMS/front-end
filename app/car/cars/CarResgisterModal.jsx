// components/CarRegisterModal.jsx
"use client";
import { useState } from "react";
import { carApi } from "../../../services/car/carApi";

export default function CarRegisterModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    carModelName: "",
    plateNo: "",
    // imageUrl: "https://example.com/car1.jpg", // 기본값
    fuelType: "휘발유",
    efficiencyKmPerL: 0,
    status: "사용가능",   // ← API 스펙에 맞춰 한글 상태
    carType: "법인"       // ← ownerType 대신
  });

  // 모델명을 모델 ID로 변환하는 함수
  const getModelIdFromName = (modelName) => {
    const modelMap = {
      "G90": 1,
      "아반떼": 2,
      "G70": 3,
      "소나타": 4,
      "K5": 5
    };
    return modelMap[modelName] || 1; // 기본값 1
  };
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
      console.log('📤 차량 등록 요청 데이터:', {
        ...form,
        carModelId: getModelIdFromName(form.carModelName),
        carModelName: form.carModelName,
        모델명변환: `${form.carModelName} → ${getModelIdFromName(form.carModelName)}`
      });
      const res = await fetch("/api/proxy/car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": "mykey"
        },
        body: JSON.stringify({
          ...form,
          carModelId: getModelIdFromName(form.carModelName), // 모델명을 ID로 변환
          carModelName: form.carModelName, // 모델명도 함께 전송
          imageUrl: "https://example.com/default-car.jpg" // 임의의 기본 이미지 URL
        })   // API 스펙과 맞는 JSON 전송
      });
  
      if (!res.ok) throw new Error(`등록 실패: ${res.status}`);
      const data = await res.json();
      console.log("POST 성공:", data);
  
      if (onSubmit) await onSubmit(data);
      setResult(data);
      setForm({
        carModelName: "", plateNo: "", fuelType: "휘발유",
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-xl space-y-4 shadow-2xl">
        <h2 className="text-xl font-bold">차량 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">번호판</label>
            <input 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="plateNo" 
              placeholder="예: 12가3456" 
              value={form.plateNo}
              onChange={onChange} 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">차량 모델명</label>
            <input 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="carModelName" 
              placeholder="예: G90, 아반떼, G70, 소나타, K5" 
              value={form.carModelName}
              onChange={onChange} 
              list="carModels"
              required
            />
            <datalist id="carModels">
              <option value="G90" />
              <option value="아반떼" />
              <option value="G70" />
              <option value="소나타" />
              <option value="K5" />
            </datalist>
            <p className="text-xs text-gray-500 mt-1">사용 가능한 모델: G90, 아반떼, G70, 소나타, K5</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연료 종류</label>
            <input 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="fuelType" 
              placeholder="예: 휘발유, 경유, 하이브리드" 
              value={form.fuelType}
              onChange={onChange} 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연비 (km/L)</label>
            <input 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="efficiencyKmPerL" 
              type="number" 
              step="0.1"
              placeholder="예: 12.5" 
              value={form.efficiencyKmPerL}
              onChange={onChange} 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">차량 상태</label>
            <select 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="status" 
              value={form.status}
              onChange={onChange}
            >
              <option value="사용가능">사용가능</option>
              <option value="사용대기">사용대기</option>
              <option value="불가">불가</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">차량 유형</label>
            <select 
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              name="carType" 
              value={form.carType}
              onChange={onChange}
            >
              <option value="법인">법인</option>
              <option value="개인">개인</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-md font-medium"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={loading} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium"
            >
              {loading ? "등록 중..." : "🚗 차량 등록"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
            <strong>오류:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
            <strong>등록 완료!</strong> 차량이 성공적으로 등록되었습니다.
          </div>
        )}
      </div>
    </div>
  );
}
