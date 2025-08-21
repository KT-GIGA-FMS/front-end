"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 홈페이지 접속 시 바로 차량 추적 페이지로 리다이렉트
    router.push('/car-tracking');
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-700">차량 추적 시스템으로 이동 중...</h1>
        <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}