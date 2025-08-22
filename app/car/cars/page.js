"use client";
import { useEffect, useState } from "react";
import ClientCarPage from "./ClientCarPage";

export default function CarPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCars() {
      try {
        const response = await fetch('/api/proxy/car', {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          setCars(Array.isArray(data) ? data : (data.cars || data.data || []));
        }
      } catch (error) {
        console.error('차량 목록 로드 오류:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadCars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">차량 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return <ClientCarPage initialCars={cars} />;
}