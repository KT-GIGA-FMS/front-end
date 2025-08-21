"use client";
import AllVehiclesView from "../../../components/AllVehiclesView";
import NavBar from "../../../components/NavBar";

export default function AllVehiclesPage() {
  const tabs = [
    { label: "🎯 단일 차량 추적", href: "/car-tracking" },
    { label: "🌍 전체 차량 보기", href: "/car-tracking/all-vehicles" },
    { label: "📊 분석", href: "/analytics" },
  ];

  return (
    <div className="bg-gray-50 overflow-y">
      <NavBar tabs={tabs} />
      <div>
        <AllVehiclesView />
      </div>
    </div>
  );
}
