import { categoryBreakdown } from '../../mock/dashboardData';

const TOTAL = 420;
const SIZE  = 140;
const SW    = 28;
const R     = (SIZE - SW) / 2;
const CIRC  = 2 * Math.PI * R;
const CX    = SIZE / 2;
const CY    = SIZE / 2;

function DonutChart() {
  let offset = 0;
  const segments = categoryBreakdown.map((cat) => {
    const len   = (cat.value / 100) * CIRC;
    const seg   = { ...cat, dashOffset: CIRC - offset, dashLen: len - 2 };
    offset += len;
    return seg;
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-label="Category distribution donut chart"
        role="img"
      >
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1E5EC" strokeWidth={SW} />
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={SW}
            strokeDasharray={`${seg.dashLen} ${CIRC - seg.dashLen}`}
            strokeDashoffset={seg.dashOffset}
          />
        ))}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {TOTAL}
        </span>
        <span className="text-[10px] text-[#999]">Total</span>
      </div>
    </div>
  );
}

export default function CategoryChart() {
  return (
    <section aria-label="Listings by category" className="flex flex-col h-full p-6">
      <h2
        className="text-base font-semibold text-[#1E293B] mb-5"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Listings by Category
      </h2>

      {/* Donut centered */}
      <div className="flex justify-center mb-6">
        <DonutChart />
      </div>

      {/* Legend */}
      <ul className="space-y-2.5" role="list">
        {categoryBreakdown.map((cat) => (
          <li key={cat.label} className="flex items-center gap-3">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm text-[#555]">{cat.label}</span>
            <span className="text-sm font-semibold text-[#333]">{cat.value}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
