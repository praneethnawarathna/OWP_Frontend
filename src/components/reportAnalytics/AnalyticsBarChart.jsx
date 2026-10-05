// A small dependency-free horizontal bar chart. Each bar's width is a percentage
// of the largest value in the set, so it scales automatically as data changes.
// Deliberately built with plain divs instead of a charting library, since the
// frontend stack is frozen to React + Tailwind + lucide-react only.
//
// `colorMap` allows callers to pass a { label → hex } mapping so each bar gets
// a semantic brand colour (e.g. Approved → #10b981, Banned → #ef4444).
// Falls back to the single `color` prop when no mapping entry is found.

const BRAND = {
  primary:  '#702b4c', // Wine / Burgundy
  success:  '#10b981', // Emerald
  warning:  '#fbbf24', // Amber
  danger:   '#ef4444', // Red
  muted:    '#94a3b8', // Slate
};

// Semantic label → colour lookup used when no explicit colorMap is provided.
const DEFAULT_LABEL_COLORS = {
  approved:  BRAND.success,
  active:    BRAND.success,
  resolved:  BRAND.success,
  pending:   BRAND.warning,
  suspended: BRAND.warning,
  rejected:  BRAND.danger,
  banned:    BRAND.danger,
  inactive:  BRAND.danger,
};

function resolveColor(label, colorMap, fallback) {
  if (colorMap && colorMap[label]) return colorMap[label];
  const key = String(label).toLowerCase();
  return DEFAULT_LABEL_COLORS[key] ?? fallback;
}

export default function AnalyticsBarChart({
  data,
  valueKey  = 'count',
  labelKey  = 'label',
  color     = BRAND.primary,   // single fallback colour
  colorMap  = null,            // optional { [label]: hexColor } override
}) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">No data available.</p>;
  }

  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct       = Math.round((item[valueKey] / max) * 100);
        const barColor  = resolveColor(item[labelKey], colorMap, color);
        return (
          <div key={item[labelKey]}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">{item[labelKey]}</span>
              <span className="text-gray-500">{item[valueKey]}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
