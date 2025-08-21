"use client";

import { useState } from "react"
import { Car, Users, Truck, BarChart3, Settings } from "lucide-react"
import { cn } from "../lib/utils"
import { useRouter } from "next/navigation"

// 사이드바 메뉴 아이콘 및 라벨
const menuItems = [
    { icon: Car, label: "차량", id: "branch" ,path: "/car"},
    { icon: Users, label: "사용자", id: "users" ,path: "/user"},
    { icon: Truck, label: "운행", id: "operation" ,path: "/car-tracking"},
    { icon: BarChart3, label: "분석", id: "analytics", active: true ,path: "/analytics"}
    // { icon: Settings, label: "시스템 설정", id: "settings" },
]

export default function Sidebar() {
    const [activeItem, setActiveItem] = useState("analytics")
    const router = useRouter()

    const handleNavigation = (item) => {
        setActiveItem(item.id)
        if (item.path) {
            router.push(item.path)
        }
    }
  
    return (
      <div 
        className="w-64 h-screen bg-slate-800 text-white flex flex-col sticky top-0"
        style={{
          width: '256px',
          height: '100vh', 
          backgroundColor: '#1e293b',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '0'
        }}
      >
        {/* 로고 영역 */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-semibold">KT DTG FMS</span>
          </div>
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 py-6 ">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "w-full flex items-center space-x-3  text-left transition-all duration-200 ",
                "hover:bg-blue-600 hover:bg-opacity-20 hover:text-blue-300",
                activeItem === item.id 
                  ? "bg-blue-600 bg-opacity-30 border-blue-400 text-blue-200" 
                  : "text-gray-300 hover:text-white",
              )}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                textAlign: 'left',
                backgroundColor: activeItem === item.id ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
                color: activeItem === item.id ? '#bfdbfe' : '#d1d5db',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeItem !== item.id) {
                  e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.2)'
                  e.target.style.color = '#93c5fd'
                }
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.id) {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#d1d5db'
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
  
        {/* 사용자정보 */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-600 hover:bg-opacity-20 hover:text-blue-300 cursor-pointer text-gray-300">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">U</span>
            </div>
            <div>
              <div className="text-sm font-medium">userID</div>
              <div className="text-xs text-gray-400">userName</div>
            </div>
          </div>
        </div>
      </div>
    )
}