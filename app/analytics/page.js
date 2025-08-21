"use client";
import { useState, useEffect } from 'react';
import KPICard from '../../components/dashboard/KPICard';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';
import PieChart from '../../components/dashboard/PieChart';
import AlertList from '../../components/dashboard/AlertList';
import { 
  getDashboardStats, 
  getVehicleStats, 
  getDrivingStats, 
  getFuelStats, 
  generateMockData 
} from '../../services/analytics/analyticsApi';

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useRealAPI, setUseRealAPI] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        if (useRealAPI) {
          // 실제 API 호출
          const [dashStats, vehicleStats, drivingStats, fuelStats] = await Promise.all([
            getDashboardStats(),
            getVehicleStats(),
            getDrivingStats(),
            getFuelStats()
          ]);

          setDashboardData({
            dashboardStats: dashStats,
            vehicleStats: vehicleStats,
            drivingStats: drivingStats,
            fuelStats: fuelStats,
            alerts: []
          });
        } else {
          // Mock 데이터 사용
          console.log("[DASHBOARD] Mock 데이터 사용 중...");
          const mockData = generateMockData();
          setDashboardData(mockData);
        }
      } catch (err) {
        console.error("[DASHBOARD] 데이터 로드 실패:", err);
        setError(err.message);
        
        // API 실패 시 Mock 데이터로 대체
        console.log("[DASHBOARD] Mock 데이터로 대체...");
        const mockData = generateMockData();
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [useRealAPI]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#F9FAFB"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #E5E7EB",
            borderTop: "4px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <div style={{ color: "#6B7280" }}>분석 대시보드 데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#F9FAFB",
      minHeight: "100vh",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* 헤더 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 4px 0"
            }}>
              📊 운행 관리 대시보드
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#6B7280",
              margin: "0"
            }}>
              실시간 차량 현황 및 운행 통계를 확인하세요
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#374151"
            }}>
              <input
                type="checkbox"
                checked={useRealAPI}
                onChange={(e) => setUseRealAPI(e.target.checked)}
                style={{ margin: 0 }}
              />
              실제 API 사용
            </label>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                background: "#3B82F6",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "24px",
            color: "#991B1B"
          }}>
            ⚠️ API 연결 오류: {error} (Mock 데이터로 표시 중)
          </div>
        )}

        {dashboardData && (
          <>
            {/* KPI 카드들 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "32px"
            }}>
              <KPICard
                title="전체 차량"
                value={dashboardData.dashboardStats.totalVehicles}
                unit="대"
                icon="🚗"
                change="+5 vs 어제"
                changeType="increase"
                color="#3B82F6"
              />
              <KPICard
                title="운행 중인 차량"
                value={dashboardData.dashboardStats.activeVehicles}
                unit="대"
                icon="🟢"
                change="+12 vs 어제"
                changeType="increase"
                color="#10B981"
              />
              <KPICard
                title="총 운행거리"
                value={dashboardData.dashboardStats.totalDistance}
                unit="km"
                icon="📍"
                change="+8.2% vs 어제"
                changeType="increase"
                color="#F59E0B"
              />
              <KPICard
                title="평균 연비"
                value={dashboardData.dashboardStats.avgFuelEfficiency}
                unit="km/L"
                icon="⛽"
                change="-0.3 vs 어제"
                changeType="decrease"
                color="#EF4444"
              />
              <KPICard
                title="알림 건수"
                value={dashboardData.dashboardStats.totalAlerts}
                unit="건"
                icon="🚨"
                change="-2 vs 어제"
                changeType="decrease"
                color="#8B5CF6"
              />
              <KPICard
                title="온라인 차량"
                value={dashboardData.dashboardStats.onlineVehicles}
                unit="대"
                icon="📡"
                change="실시간"
                changeType="neutral"
                color="#06B6D4"
              />
            </div>

            {/* 차트 섹션 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "24px",
              marginBottom: "32px"
            }}>
              {/* 시간별 운행 데이터 */}
              <LineChart
                data={dashboardData.drivingStats.hourlyData}
                width={600}
                height={300}
                color="#3B82F6"
                title="📈 시간별 운행 거리 (오늘)"
              />

              {/* 차량 상태 분포 */}
              <PieChart
                data={dashboardData.vehicleStats.byStatus}
                width={300}
                height={300}
                title="🚗 차량 상태 분포"
              />
            </div>

            {/* 하단 차트들 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
              marginBottom: "32px"
            }}>
              {/* 차량 유형별 분포 */}
              <BarChart
                data={dashboardData.vehicleStats.byType}
                width={350}
                height={250}
                color="#10B981"
                title="🚙 차량 유형별 분포"
              />

              {/* 연료 효율성 */}
              <BarChart
                data={dashboardData.fuelStats.efficiency}
                width={350}
                height={250}
                color="#F59E0B"
                title="⛽ 차량별 연비 현황"
              />

              {/* 최근 알림 */}
              <AlertList
                alerts={dashboardData.alerts}
                title="🚨 최근 알림"
              />
            </div>

            {/* 월별 트렌드 */}
            <div style={{ marginBottom: "32px" }}>
              <LineChart
                data={dashboardData.drivingStats.dailyData}
                width={1200}
                height={300}
                color="#8B5CF6"
                title="📊 최근 30일 운행 거리 트렌드"
              />
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
