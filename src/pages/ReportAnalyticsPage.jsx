import { useMemo } from 'react';
import {
  Download,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react';
import { initialVendors, VENDOR_CATEGORIES } from '../mock/vendorDirectoryData';
import { monthlyApplications, banSuspensionReasons } from '../mock/reportAnalyticsData';
import AnalyticsBarChart from '../components/reportAnalytics/AnalyticsBarChart';
import MonthlyTrendChart from '../components/reportAnalytics/MonthlyTrendChart';

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function ReportAnalyticsPage() {
  const stats = useMemo(() => {
    const byStatus = (s) => initialVendors.filter((v) => v.status === s);
    const approved = byStatus('Approved');
    const rejected = byStatus('Rejected');
    const pending = byStatus('Pending');
    const suspended = byStatus('Suspended');
    const banned = byStatus('Banned');

    const decided = [...approved, ...rejected];
    const approvalRate = decided.length
      ? Math.round((approved.length / decided.length) * 100)
      : 0;

    const decisionDurations = initialVendors
      .map((v) => {
        const decidedDate = v.approvedDate || v.banDate || v.suspendedDate;
        if (!v.appliedDate || !decidedDate) return null;
        return daysBetween(v.appliedDate, decidedDate);
      })
      .filter((d) => d !== null && d >= 0);
    const avgDecisionDays = decisionDurations.length
      ? Math.round(
          (decisionDurations.reduce((sum, d) => sum + d, 0) / decisionDurations.length) * 10
        ) / 10
      : null;

    const categoryBreakdown = VENDOR_CATEGORIES.map((cat) => ({
      label: cat,
      count: initialVendors.filter((v) => v.category === cat).length,
    }));
    const topCategory = categoryBreakdown.reduce(
      (top, c) => (c.count > top.count ? c : top),
      categoryBreakdown[0]
    );

    const funnel = [
      { label: 'Pending', count: pending.length },
      { label: 'Approved', count: approved.length },
      { label: 'Rejected', count: rejected.length },
      { label: 'Suspended', count: suspended.length },
      { label: 'Banned', count: banned.length },
    ];

    return {
      total: initialVendors.length,
      approvalRate,
      avgDecisionDays,
      categoryBreakdown,
      topCategory,
      funnel,
    };
  }, []);

  function handleExportCsv() {
    const lines = [];
    lines.push('Directory Report Analytics — Summary');
    lines.push(`Total vendors,${stats.total}`);
    lines.push(`Approval rate,${stats.approvalRate}%`);
    lines.push(
      `Average days to decision,${stats.avgDecisionDays !== null ? stats.avgDecisionDays : 'N/A'}`
    );
    lines.push('');
    lines.push('Vendors by category');
    lines.push('Category,Count');
    stats.categoryBreakdown.forEach((c) => lines.push(`${c.label},${c.count}`));
    lines.push('');
    lines.push('Approval funnel');
    lines.push('Status,Count');
    stats.funnel.forEach((f) => lines.push(`${f.label},${f.count}`));
    lines.push('');
    lines.push('Monthly applications');
    lines.push('Month,Applications,Approved,Rejected');
    monthlyApplications.forEach((m) =>
      lines.push(`${m.month},${m.applications},${m.approved},${m.rejected}`)
    );
    lines.push('');
    lines.push('Ban & suspension reasons');
    lines.push('Reason,Count');
    banSuspensionReasons.forEach((r) => lines.push(`"${r.reason}",${r.count}`));

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `directory-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Directory report analytics</h1>
          <p className="text-sm text-gray-500">
            Read-only insights into vendor applications, approvals and category mix.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-[#FDF0F4] px-4 py-3 text-xs text-[#8E406F]">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          This page is reporting only — to approve, reject, suspend or edit a vendor, use All
          Vendors.
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total vendors" value={stats.total} />
        <StatCard icon={CheckCircle2} label="Approval rate" value={`${stats.approvalRate}%`} />
        <StatCard
          icon={Clock}
          label="Avg. days to decision"
          value={stats.avgDecisionDays !== null ? stats.avgDecisionDays : '—'}
        />
        <StatCard icon={TrendingUp} label="Top category" value={stats.topCategory?.label ?? '—'} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Applications over time" subtitle="Last 6 months">
          <MonthlyTrendChart data={monthlyApplications} />
        </ChartCard>

        <ChartCard title="Vendors by category" subtitle="Photography, Decorations, Hotels, Music">
          <AnalyticsBarChart data={stats.categoryBreakdown} />
        </ChartCard>

        <ChartCard title="Approval funnel" subtitle="Current vendor status breakdown">
          <AnalyticsBarChart data={stats.funnel} color="#8E406F" />
        </ChartCard>

        <ChartCard title="Ban & suspension reasons" subtitle="Categorized from admin actions">
          <AnalyticsBarChart data={banSuspensionReasons} valueKey="count" labelKey="reason" color="#dc2626" />
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 inline-flex rounded-md bg-[#FDF0F4] p-1.5 text-[#8E406F]">
        <Icon size={16} />
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
