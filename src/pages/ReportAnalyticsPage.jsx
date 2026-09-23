import { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import AnalyticsBarChart from '../components/reportAnalytics/AnalyticsBarChart';
import MonthlyTrendChart from '../components/reportAnalytics/MonthlyTrendChart';

// ── Brand colours ─────────────────────────────────────────────────────────────
const BRAND = {
  primary: '#702b4c',
  success: '#10b981',
  warning: '#fbbf24',
  danger:  '#ef4444',
  muted:   '#94a3b8',
};

// ── API base (dev backend) ────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5131';
const POLL_MS  = 15_000; // 15 seconds

// ── Tab configuration ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'vendors',   label: 'Vendors',   Icon: Users        },
  { id: 'customers', label: 'Customers', Icon: CheckCircle2 },
  { id: 'admins',    label: 'Admins',    Icon: ShieldCheck  },
];

// ── Per-tab stat-card config ──────────────────────────────────────────────────
const TAB_STAT_CARDS = {
  vendors: [
    { key: 'totalVendors',      label: 'Total vendors',        Icon: Users,        fmt: (v) => v ?? '—' },
    { key: 'approvalRatePercent',label:'Approval rate',        Icon: CheckCircle2, fmt: (v) => v != null ? `${v}%` : '—' },
    { key: 'avgDaysToDecision', label: 'Avg. days to decision',Icon: Clock,        fmt: (v) => v ?? '—' },
    { key: 'topCategory',       label: 'Top category',         Icon: TrendingUp,   fmt: (v) => v ?? '—' },
  ],
  customers: [
    { key: 'totalCustomers',    label: 'Total customers',      Icon: Users,        fmt: (v) => v ?? '—' },
    { key: 'activeCount',       label: 'Active customers',     Icon: CheckCircle2, fmt: (v) => v ?? '—' },
    { key: 'newThisMonth',      label: 'New this month',       Icon: TrendingUp,   fmt: (v) => v ?? '—' },
    { key: 'avgSessionDays',    label: 'Avg. session days',    Icon: Clock,        fmt: (v) => v ?? '—' },
  ],
  admins: [
    { key: 'totalAdmins',       label: 'Total admins',         Icon: ShieldCheck,  fmt: (v) => v ?? '—' },
    { key: 'superAdminCount',   label: 'Super admins',         Icon: ShieldCheck,  fmt: (v) => v ?? '—' },
    { key: 'activeAdmins',      label: 'Active admins',        Icon: CheckCircle2, fmt: (v) => v ?? '—' },
    { key: 'pendingActions',    label: 'Pending actions',      Icon: Clock,        fmt: (v) => v ?? '—' },
  ],
};

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportCsv(tab, data) {
  if (!data) return;
  const lines = [`System Analytics — ${tab} tab`, `Exported: ${new Date().toISOString()}`];

  // Flatten every top-level key that is a primitive
  Object.entries(data).forEach(([k, v]) => {
    if (typeof v !== 'object') lines.push(`${k},${v}`);
  });

  // Add arrays as sections
  const addSection = (title, arr, cols) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    lines.push('', title, cols.join(','));
    arr.forEach((row) => lines.push(cols.map((c) => `"${row[c] ?? ''}"`).join(',')));
  };

  addSection('Monthly Applications', data.monthlyApplications,
    ['month', 'year', 'applications', 'approved', 'rejected']);
  addSection('Category Breakdown', data.categoryBreakdown, ['label', 'count']);
  addSection('Funnel', data.funnel, ['label', 'count']);
  addSection('Ban & Suspension Reasons', data.banSuspensionReasons, ['reason', 'count']);

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `analytics-${tab}-${new Date().toISOString().slice(0, 10)}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ReportAnalyticsPage() {
  const [activeTab,  setActiveTab]  = useState('vendors');
  const [data,       setData]       = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);

  // ── Fetch function ──────────────────────────────────────────────────────
  const fetchData = useCallback(async (tab, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/analytics/${tab}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  // ── Effect: fetch immediately + poll every 15 s ──────────────────────────
  useEffect(() => {
    setData(null);
    fetchData(activeTab, true);

    const intervalId = setInterval(() => fetchData(activeTab, false), POLL_MS);
    return () => clearInterval(intervalId);
  }, [activeTab, fetchData]);

  // ── Derived chart data (safe even when data is null) ─────────────────────
  const monthlyData       = data?.monthlyApplications ?? [];
  const categoryData      = data?.categoryBreakdown   ?? [];
  const funnelData        = data?.funnel              ?? [];
  const banReasonsData    = (data?.banSuspensionReasons ?? []).map((r) => ({
    label: r.reason, count: r.count,
  }));

  const statCards = TAB_STAT_CARDS[activeTab] ?? [];

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">System Analytics</h1>
          <p className="text-sm text-gray-500">
            Live insights — auto-refreshes every 15 s
            {lastFetch && (
              <span className="ml-2 text-gray-400">
                · Last updated {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(activeTab, false)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            title="Refresh now"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => exportCsv(activeTab, data)}
            disabled={!data}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-[#702b4c] shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 px-4 py-3 text-xs text-red-700 border border-red-200">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error} — showing last available data or empty state.</span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg border border-gray-100 bg-gray-50 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg border border-gray-100 bg-gray-50 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map(({ key, label, Icon, fmt }) => (
              <StatCard key={key} icon={Icon} label={label} value={fmt(data?.[key])} />
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeTab === 'vendors' && (
              <>
                <ChartCard title="Applications over time" subtitle="Last 6 months">
                  <MonthlyTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Vendors by category" subtitle="Distribution across categories">
                  <AnalyticsBarChart
                    data={categoryData}
                    color={BRAND.primary}
                  />
                </ChartCard>

                <ChartCard title="Approval funnel" subtitle="Current vendor status breakdown">
                  <AnalyticsBarChart data={funnelData} />
                </ChartCard>

                <ChartCard title="Ban & suspension reasons" subtitle="Normalised from admin actions">
                  <AnalyticsBarChart
                    data={banReasonsData}
                    valueKey="count"
                    labelKey="label"
                    color={BRAND.danger}
                  />
                </ChartCard>
              </>
            )}

            {activeTab === 'customers' && (
              <>
                <ChartCard title="Customer growth" subtitle="Monthly registrations">
                  <MonthlyTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Customer status breakdown" subtitle="Active vs inactive">
                  <AnalyticsBarChart data={funnelData} />
                </ChartCard>
              </>
            )}

            {activeTab === 'admins' && (
              <>
                <ChartCard title="Admin activity" subtitle="Actions over time">
                  <MonthlyTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Admin roles breakdown" subtitle="By role and status">
                  <AnalyticsBarChart data={funnelData} color={BRAND.primary} />
                </ChartCard>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Local helper components ───────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 inline-flex rounded-md bg-[#FDF0F4] p-1.5 text-[#702b4c]">
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
