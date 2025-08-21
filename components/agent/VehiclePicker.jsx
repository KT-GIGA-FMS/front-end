// components/agent/VehiclePicker.jsx
"use client";
export default function VehiclePicker({ onSelect }) {
  // 실제 사용 가능한 차량 목록
  const availableVehicles = [
    { id: 'avante', model: '아반떼' },
    { id: 'sonata', model: '소나타' },
    { id: 'santafe', model: '싼타페' },
    { id: 'casper', model: '캐스퍼' }
  ];

  return (
    <div className="border rounded-xl p-3 bg-green-50 border-green-200">
      <div className="text-sm font-medium mb-2 text-green-800">차량을 선택해주세요</div>
      <div className="flex flex-wrap gap-2">
        {availableVehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onSelect(vehicle.model)}
            className="px-3 py-1 text-sm rounded-full border border-green-300 hover:bg-green-100 text-green-700"
          >
            {vehicle.model}
          </button>
        ))}
      </div>
    </div>
  );
}
