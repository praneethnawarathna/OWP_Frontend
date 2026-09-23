// Vertical stacked bar chart for monthly application volume, split into
// approved / rejected / still-pending segments. Plain divs, no library —
// matches AnalyticsBarChart's approach for the same reason (frozen stack).

const CHART_HEIGHT = 160; // px

export default function MonthlyTrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.applications), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height: CHART_HEIGHT }}>
        {data.map((m) => {
          const pending = Math.max(m.applications - m.approved - m.rejected, 0);
          const totalPx = (m.applications / max) * CHART_HEIGHT;
          const approvedPx = totalPx * (m.approved / m.applications);
          const rejectedPx = totalPx * (m.rejected / m.applications);
          const pendingPx = totalPx - approvedPx - rejectedPx;

          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full max-w-[36px] flex-col-reverse overflow-hidden rounded-t-sm">
                <div style={{ height: `${approvedPx}px` }} className="bg-emerald-500" />
                <div style={{ height: `${rejectedPx}px` }} className="bg-red-400" />
                <div style={{ height: `${pendingPx}px` }} className="bg-amber-300" />
              </div>
              <span className="text-[11px] text-gray-500">{m.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <LegendDot color="bg-emerald-500" label="Approved" />
        <LegendDot color="bg-red-400" label="Rejected" />
        <LegendDot color="bg-amber-300" label="Pending / other" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
