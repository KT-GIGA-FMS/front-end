// app/car/page.js
// ✅ Static SSG version for now (works with next.config.js { output: 'export' }).
// 🔄 A ready-to-use dynamic SSR/SWR version is commented at the bottom.
// ❗ No styled-jsx, no client-only imports → safe for Server Component + static export.
import NavBar from "../../../components/NavBar";
export const dynamic = 'force-dynamic';       // ensure static rendering only
export const revalidate = false;      // fully static, no ISR
export const fetchCache = 'force-no-store';

const API_URL = 'https://car-services-e6bmdpbjcffqfzd2.koreacentral-01.azurewebsites.net/api/v1/cars'; // /car 경로와 매칭되는 page.js

// 🧪 Build-time fallback: if the external API is unreachable during build, we render with this sample.
const SAMPLE_CARS = [
  {
    carModelId: 1,
    plateNo: '12가3456',
    // imageUrl: 'https://example.com/car1.jpg',
    fuelType: '휘발유',
    efficiencyKmPerL: 15.5,
    status: '사용가능',
    carType: '법인',
  },
];

async function getCarsAtBuild() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' }); // default for SSG
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    console.warn('[CarService][SSG] Falling back to SAMPLE_CARS:', e?.message || e);
    return SAMPLE_CARS;
  }
}

function Badge({ text }) {
  const palette = {
    사용가능: { bg: '#e8fff3', fg: '#0a7b45', bd: '#bdf1d6' },
    사용대기: { bg: '#fff9e6', fg: '#a06200', bd: '#ffe5a3' },
    불가:   { bg: '#ffecec', fg: '#a11a1a', bd: '#ffc3c3' },
    법인:   { bg: '#eaf2ff', fg: '#1c54b2', bd: '#c8dcff' },
    개인:   { bg: '#f1eaff', fg: '#5a35b6', bd: '#dac8ff' },
    default:{ bg: '#efefef', fg: '#333',    bd: '#ddd'    },
  };
  const p = palette[text] || palette.default;
  return (
    <span className="car-badge" style={{ backgroundColor: p.bg, color: p.fg, borderColor: p.bd }}>
      {text}
    </span>
  );
}

function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  try {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(Number(n));
  } catch {
    return String(n);
  }
}

export default async function CarServicePage() {
  const cars = await getCarsAtBuild();
  const tabs = [
    { label: "차량 목록", href: "/car/cars" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservations" }
  ];
  return (
    <main className="car-wrap">
      <header className="car-hd">
        <NavBar tabs={tabs} />
        <p className="car-sub">총 <strong>{cars.length}</strong>대</p>
      </header>

      {cars.length === 0 ? (
        <div className="car-empty"><p>표시할 차량이 없습니다.</p></div>
      ) : (
        <div className="car-card">
          <div className="car-tableWrap">
            <table className="car-tbl">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>상태</th>
                  <th style={{ width: 100 }}>구분</th>
                  <th style={{ width: 80 }}>모델ID</th>
                  {/* <th>이미지</th> */}
                  <th style={{ width: 130 }}>번호판</th>
                  <th style={{ width: 100 }}>연료</th>
                  <th style={{ width: 120 }}>연비 (km/L)</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c, idx) => (
                  <tr key={`${c.plateNo || idx}`}>
                    <td><Badge text={c.status || '-'} /></td>
                    <td><Badge text={c.carType || '-' } /></td>
                    <td>{c.carModelId ?? '-'}</td>
                    {/* <td>
                      {c.imageUrl ? (
                        <div className="car-imgCell">
                          <img src={c.imageUrl} alt={`${c.plateNo || 'car'}`} />
                        </div>
                      ) : (
                        <span className="car-dim">-</span>
                      )}
                    </td> */}
                    <td className="car-mono">{c.plateNo ?? '-'}</td>
                    <td>{c.fuelType ?? '-'}</td>
                    <td>{formatNumber(c.efficiencyKmPerL)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .car-wrap { padding: 32px 24px; max-width: 1100px; margin: 0 auto; }
  .car-hd h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
  .car-titleRow { display: flex; align-items: center; gap: 10px; }
  .car-mini { font-size: 12px; color: #5b6b7a; background: #f2f5f8; border: 1px solid #e3e8ee; padding: 2px 8px; border-radius: 9999px; }
  .car-sub { color: #5b6b7a; margin-top: 8px; }
  .car-err { background: #1a1a1a; color: #ffb4b4; padding: 12px; border-radius: 10px; overflow: auto; }
  .car-card { background: #ffffff; border: 1px solid #e6e8eb; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
  .car-tableWrap { overflow: auto; border-radius: 16px; }
  .car-tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
  .car-tbl thead th { text-align: left; font-weight: 700; font-size: 13px; color: #49576a; background: #f7f9fc; position: sticky; top: 0; padding: 14px 16px; border-bottom: 1px solid #e6e8eb; }
  .car-tbl tbody td { padding: 14px 16px; font-size: 14px; color: #2d3643; border-bottom: 1px solid #f0f2f4; vertical-align: middle; }
  .car-tbl tbody tr:hover { background: #fbfdff; }
  .car-dim { color: #9aa7b4; }
  .car-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
  .car-imgCell { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 48px; border-radius: 8px; overflow: hidden; border: 1px solid #e6e8eb; background: #fafbfc; }
  .car-imgCell img { width: 100%; height: 100%; object-fit: cover; }
  .car-empty { display: grid; place-items: center; height: 180px; color: #6b7280; border: 2px dashed #e5e7eb; border-radius: 16px; background: #fcfcfd; }
  .car-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; border: 1px solid; font-size: 12px; line-height: 1; white-space: nowrap; }
`;

/*
===============================
🔄 Dynamic SSR version (for later)
-------------------------------
// Replace the two exports at the top with:
// export const dynamic = 'force-dynamic';
// export const revalidate = 0; // or remove this line

// And swap the data loader to:
// async function getCarsAtBuild() {
//   const res = await fetch(API_URL, { cache: 'no-store' });
//   if (!res.ok) throw new Error(`API Error ${res.status}`);
//   const data = await res.json();
//   return Array.isArray(data) ? data : [data];
// }
===============================
*/
