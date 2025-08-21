
import dynamic from "next/dynamic";

import NavBar from "../../components/NavBar";


export default function CarTrackingPage() {

  const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });
  const tabs = [
    { label: "🎯 단일 차량 추적", href: "/car-tracking" },
    { label: "🌍 전체 차량 보기", href: "/car-tracking/all-vehicles" },
  ];
  return(

    <div className=" bg-gray-50 overflow-y">
      <NavBar tabs={tabs} />
      <div>
        <MapView />
      </div>
    </div>

  )
 

}
