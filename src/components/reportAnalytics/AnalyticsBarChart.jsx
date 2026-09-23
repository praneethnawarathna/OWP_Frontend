// A small dependency-free horizontal bar chart. Each bar's width is a percentage
// of the largest value in the set, so it scales automatically as data changes.
// Deliberately built with plain divs instead of a charting library, since the
// frontend stack is frozen to React + Tailwind + lucide-react only.

export default function AnalyticsBarChart({ data, valueKey = 'count', labelKey = 'label', color = '#8E406F' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = Math.round((item[valueKey] / max) * 100);
        return (
          <div key={item[labelKey]}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">{item[labelKey]}</span>
              <span className="text-gray-500">{item[valueKey]}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
