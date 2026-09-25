// Vertical stacked bar chart for monthly application volume, split into
// approved / rejected / still-pending segments. Plain divs, no library —
// matches AnalyticsBarChart's approach for the same reason (frozen stack).
//
// Oleena brand colours:
//   Approved / Active  → #10b981  (Emerald)
//   Rejected / Banned  → #ef4444  (Red)
//   Pending / Other    → #fbbf24  (Amber)

const CHART_HEIGHT = 160; // px

const COLORS = {
  approved: '#10b981',
  rejected: '#ef4444',
  pending:  '#fbbf24',
};

export default function MonthlyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">No data available.</p>;
  }

  const max = Math.max(...data.map((d) => d.applications), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height: CHART_HEIGHT }}>
        {data.map((m) => {
          const apps       = m.applications || 0;
          const approved   = Math.min(m.approved  || 0, apps);
          const rejected   = Math.min(m.rejected  || 0, apps - approved);
          const pending    = Math.max(apps - approved - rejected, 0);
          const totalPx    = (apps / max) * CHART_HEIGHT;
          const approvedPx = apps > 0 ? totalPx * (approved / apps) : 0;
          const rejectedPx = apps > 0 ? totalPx * (rejected / apps) : 0;
          const pendingPx  = totalPx - approvedPx - rejectedPx;

          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                title={`${m.month}: ${apps} total`}
                className="flex w-full max-w-[36px] flex-col-reverse overflow-hidden rounded-t-sm"
              >
                <div style={{ height: `${approvedPx}px`, backgroundColor: COLORS.approved }} />
                <div style={{ height: `${rejectedPx}px`, backgroundColor: COLORS.rejected }} />
                <div style={{ height: `${pendingPx}px`,  backgroundColor: COLORS.pending  }} />
              </div>
              <span className="text-[11px] text-gray-500">{m.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <LegendDot hex={COLORS.approved} label="Approved / Active" />
        <LegendDot hex={COLORS.rejected} label="Rejected / Banned" />
        <LegendDot hex={COLORS.pending}  label="Pending / Other"   />
      </div>
    </div>
  );
}

function LegendDot({ hex, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />
      {label}
    </span>
  );
}
