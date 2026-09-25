import React from 'react';
import {
  Package,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

function StatCard({ label, value, subtext, icon: Icon }) {
  return (
    <article
      aria-label={`${label}: ${value}`}
      className="group relative overflow-hidden rounded-2xl border border-[#F1E5EC] bg-[#FDF0F4] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-[#737373] leading-snug">{label}</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8E406F] shadow-sm border border-[#F1E5EC] transition-transform group-hover:scale-110 shrink-0">
            <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>

        <p
          className="text-3xl sm:text-4xl font-bold text-[#1E293B] leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {value}
        </p>

        {subtext && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="text-[#737373] font-medium">{subtext}</span>
          </div>
        )}
      </div>

      <div className="mt-3 h-[2px] w-10 rounded-full bg-[#8E406F]/30 transition-all group-hover:w-16" />
    </article>
  );
}

export default function ActiveListingsSummary({ summary }) {
  if (!summary) return null;

  const stats = [
    {
      id: 'total',
      label: 'Total Listings',
      value: summary.total ?? 0,
      subtext: 'All catalog items',
      icon: Package,
    },
    {
      id: 'active',
      label: 'Active / Published',
      value: summary.active ?? 0,
      subtext: 'Live on marketplace',
      icon: CheckCircle2,
    },
    {
      id: 'pending',
      label: 'Pending Review',
      value: summary.pending ?? 0,
      subtext: 'Awaiting moderation',
      icon: Clock3,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: summary.rejected ?? 0,
      subtext: 'Action required',
      icon: XCircle,
    },
    {
      id: 'flagged',
      label: 'Flagged Content',
      value: summary.flagged ?? 0,
      subtext: 'Under admin review',
      icon: AlertTriangle,
    },
  ];

  return (
    <section aria-label="Listing Status Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            subtext={stat.subtext}
            icon={stat.icon}
          />
        ))}
      </div>
    </section>
  );
}
