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
  Activity,
  Briefcase,
  Award
} from 'lucide-react';

// ── Brand colours ─────────────────────────────────────────────────────────────
const BRAND = {
  primary: '#702b4c',
  primaryLight: '#943f67',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  muted:   '#94a3b8',
  info:    '#6366f1',
};

// Colors for bar chart semantics
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

const resolveColor = (label, fallback) => {
  if (!label) return fallback;
  const key = String(label).toLowerCase();
  return DEFAULT_LABEL_COLORS[key] ?? fallback;
};

// ── API base (dev backend) ────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5131';
const POLL_MS  = 15_000; // 15 seconds

// ── Tab configuration ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'vendors',   label: 'Vendors',   Icon: Briefcase    },
  { id: 'customers', label: 'Customers', Icon: Users        },
  { id: 'admins',    label: 'Admins',    Icon: ShieldCheck  },
];

// ── Per-tab stat-card config ──────────────────────────────────────────────────
const TAB_STAT_CARDS = {
  vendors: [
    { keys: ['totalCount', 'TotalCount'], label: 'Total vendors', Icon: Briefcase, fmt: (v) => v ?? '—', color: BRAND.primary },
    { keys: ['activeCount', 'ActiveCount'], label: 'Active vendors', Icon: CheckCircle2, fmt: (v) => v ?? '—', color: BRAND.success },
    { keys: ['pendingCount', 'PendingCount'], label: 'Pending vendors', Icon: Clock, fmt: (v) => v ?? '—', color: BRAND.warning },
    { keys: ['approvalRatePercent', 'ApprovalRatePercent'], label: 'Approval rate', Icon: TrendingUp, fmt: (v) => v != null ? `${v}%` : '—', color: BRAND.info },
  ],
  customers: [
    { keys: ['totalCount', 'TotalCount'], label: 'Total customers', Icon: Users, fmt: (v) => v ?? '—', color: BRAND.primary },
    { keys: ['activeCount', 'ActiveCount'], label: 'Active customers', Icon: CheckCircle2, fmt: (v) => v ?? '—', color: BRAND.success },
    { keys: ['newThisMonth', 'NewThisMonth'], label: 'New this month', Icon: TrendingUp, fmt: (v) => v ?? '—', color: BRAND.info },
    { keys: ['bannedVendors', 'BannedVendors'], label: 'Banned customers', Icon: AlertCircle, fmt: (v) => v ?? '—', color: BRAND.danger },
  ],
  admins: [
    { keys: ['totalCount', 'TotalCount'], label: 'Total admins', Icon: ShieldCheck, fmt: (v) => v ?? '—', color: BRAND.primary },
    { keys: ['superAdminCount', 'SuperAdminCount'], label: 'Super admins', Icon: Award, fmt: (v) => v ?? '—', color: '#8b5cf6' },
    { keys: ['activeCount', 'ActiveCount'], label: 'Active admins', Icon: CheckCircle2, fmt: (v) => v ?? '—', color: BRAND.success },
    { keys: ['pendingCount', 'PendingCount'], label: 'Pending actions', Icon: Clock, fmt: (v) => v ?? '—', color: BRAND.warning },
  ],
};

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportCsv(tab, data) {
  if (!data) return;
  const lines = [`System Analytics — ${tab} tab`, `Exported: ${new Date().toISOString()}`];

  Object.entries(data).forEach(([k, v]) => {
    if (typeof v !== 'object') lines.push(`${k},${v}`);
  });

  const addSection = (title, arr, cols) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    lines.push('', title, cols.join(','));
    arr.forEach((row) => lines.push(cols.map((c) => `"${row[c] ?? ''}"`).join(',')));
  };

  addSection('Monthly Applications', data.monthlyApplications || data.MonthlyApplications, ['month', 'year', 'applications', 'approved', 'rejected']);
  addSection('Category Breakdown', data.categoryBreakdown || data.CategoryBreakdown, ['label', 'count']);
  addSection('Funnel', data.funnel || data.Funnel, ['label', 'count']);
  addSection('Ban & Suspension Reasons', data.banSuspensionReasons || data.BanSuspensionReasons, ['reason', 'count']);

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

  useEffect(() => {
    setData(null);
    fetchData(activeTab, true);

    const intervalId = setInterval(() => fetchData(activeTab, false), POLL_MS);
    return () => clearInterval(intervalId);
  }, [activeTab, fetchData]);

  const monthlyData       = data?.monthlyApplications || data?.MonthlyApplications || [];
  const categoryData      = data?.categoryBreakdown || data?.CategoryBreakdown || [];
  const funnelData        = data?.funnel || data?.Funnel || [];
  const rawBanReasons     = data?.banSuspensionReasons || data?.BanSuspensionReasons || [];
  const banReasonsData    = rawBanReasons.map((r) => ({
    label: r.reason || r.Reason, count: r.count || r.Count,
  }));

  const statCards = TAB_STAT_CARDS[activeTab] ?? [];

  return (
    <div className="min-h-full space-y-8 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-3xl">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Executive Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live insights auto-refreshing
            {lastFetch && (
              <span className="text-gray-400">
                · Last updated {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(activeTab, false)}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all duration-200"
            title="Refresh now"
          >
            <RefreshCw size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
          <button
            onClick={() => exportCsv(activeTab, data)}
            disabled={!data}
            className="inline-flex items-center gap-2 rounded-xl bg-[#702b4c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#8a3a61] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Tabs (Pill style) ── */}
      <div className="inline-flex rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200/50">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#702b4c] to-[#8a3a61] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50/80 px-5 py-4 text-sm text-red-800 border border-red-100 backdrop-blur-sm shadow-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <p>{error} — showing last available data or empty state.</p>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-md animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-3xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-md animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
            {statCards.map(({ keys, label, Icon, fmt, color }, i) => {
              const rawValue = keys.reduce((acc, k) => acc ?? data?.[k], null);
              return <StatCard key={i} icon={Icon} label={label} value={fmt(rawValue)} color={color} />;
            })}
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeTab === 'vendors' && (
              <>
                <ChartCard title="Applications Over Time" subtitle="Vendor application trends for the last 6 months">
                  <EnhancedTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Vendors by Category" subtitle="Distribution of vendors across service categories">
                  <EnhancedBarChart data={categoryData} color={BRAND.primary} />
                </ChartCard>

                <ChartCard title="Approval Funnel" subtitle="Current status breakdown of all vendor accounts">
                  <EnhancedBarChart data={funnelData} />
                </ChartCard>

                <ChartCard title="Ban & Suspension Reasons" subtitle="Normalized distribution of administrative actions">
                  <EnhancedBarChart data={banReasonsData} color={BRAND.danger} />
                </ChartCard>
              </>
            )}

            {activeTab === 'customers' && (
              <>
                <ChartCard title="Customer Growth" subtitle="Monthly customer registrations">
                  <EnhancedTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Customer Status Breakdown" subtitle="Active vs inactive customer accounts">
                  <EnhancedBarChart data={funnelData} />
                </ChartCard>
              </>
            )}

            {activeTab === 'admins' && (
              <>
                <ChartCard title="Admin Activity" subtitle="Administrative actions over time">
                  <EnhancedTrendChart data={monthlyData} />
                </ChartCard>

                <ChartCard title="Admin Roles Breakdown" subtitle="By access level and role status">
                  <EnhancedBarChart data={funnelData} color={BRAND.primary} />
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
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm hover:shadow-md backdrop-blur-xl transition-all duration-300 group">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: color }} />
      <div className="relative flex items-center justify-between mb-4">
        <div className="inline-flex rounded-2xl p-3 shadow-inner" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm hover:shadow-md backdrop-blur-xl transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

// ── Inlined Enhanced Data Visualizations ──────────────────────────────────────
function EnhancedBarChart({ data, valueKey = 'count', labelKey = 'label', color = BRAND.primary }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center text-gray-400">
        <Activity size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium text-gray-500">No data available at this time.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-5">
      {data.map((item, i) => {
        const val = item[valueKey];
        const pct = Math.round((val / max) * 100);
        const barColor = resolveColor(item[labelKey], color);
        
        return (
          <div key={item[labelKey] || i} className="group relative">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">{item[labelKey]}</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{val}</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundImage: `linear-gradient(90deg, ${barColor}bb, ${barColor})`,
                  boxShadow: `0 2px 4px ${barColor}40`
                }}
              />
            </div>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap shadow-xl">
              {pct}% of max
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EnhancedTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center text-gray-400">
        <Activity size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium text-gray-500">No trend data available.</p>
      </div>
    );
  }

  const CHART_HEIGHT = 180;
  const max = Math.max(...data.map((d) => d.applications), 1);

  return (
    <div className="pt-2">
      <div className="flex items-end justify-between gap-2 sm:gap-4 border-b border-gray-100 pb-2" style={{ height: CHART_HEIGHT }}>
        {data.map((m, i) => {
          const apps       = m.applications || 0;
          const approved   = Math.min(m.approved  || 0, apps);
          const rejected   = Math.min(m.rejected  || 0, apps - approved);
          const pending    = Math.max(apps - approved - rejected, 0);
          const totalPx    = (apps / max) * (CHART_HEIGHT - 20); // leave 20px breathing room
          
          const approvedPx = apps > 0 ? totalPx * (approved / apps) : 0;
          const rejectedPx = apps > 0 ? totalPx * (rejected / apps) : 0;
          const pendingPx  = totalPx - approvedPx - rejectedPx;

          return (
            <div key={m.month || i} className="group relative flex flex-1 flex-col items-center gap-3">
              <div
                className="relative flex w-full max-w-[48px] flex-col-reverse justify-start overflow-hidden rounded-t-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                style={{ height: CHART_HEIGHT - 20 }}
              >
                {/* Active area */}
                <div 
                  className="w-full transition-all duration-1000 ease-out"
                  style={{ height: `${approvedPx}px`, backgroundColor: BRAND.success, opacity: 0.95 }} 
                />
                <div 
                  className="w-full transition-all duration-1000 ease-out"
                  style={{ height: `${rejectedPx}px`, backgroundColor: BRAND.danger, opacity: 0.95 }} 
                />
                <div 
                  className="w-full transition-all duration-1000 ease-out rounded-t-md"
                  style={{ height: `${pendingPx}px`, backgroundColor: BRAND.warning, opacity: 0.95 }} 
                />
                
                {/* Custom Tooltip */}
                <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 z-10 pointer-events-none">
                  <div className="rounded-xl bg-gray-900/95 p-3 text-xs text-white shadow-2xl backdrop-blur-sm min-w-[140px] border border-gray-700">
                    <p className="mb-2 border-b border-gray-700 pb-1.5 font-bold text-center tracking-wider">{m.month}</p>
                    <div className="flex justify-between gap-4 mb-1"><span className="text-gray-400">Total:</span><span className="font-bold text-white">{apps}</span></div>
                    {approved > 0 && <div className="flex justify-between gap-4"><span className="text-emerald-400">Approved:</span><span className="font-semibold">{approved}</span></div>}
                    {pending > 0 && <div className="flex justify-between gap-4"><span className="text-amber-400">Pending:</span><span className="font-semibold">{pending}</span></div>}
                    {rejected > 0 && <div className="flex justify-between gap-4"><span className="text-red-400">Rejected:</span><span className="font-semibold">{rejected}</span></div>}
                    <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900/95 border-b border-r border-gray-700"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{m.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-700">
        <LegendDot hex={BRAND.success} label="Approved / Active" />
        <LegendDot hex={BRAND.danger} label="Rejected / Banned" />
        <LegendDot hex={BRAND.warning}  label="Pending / Other"   />
      </div>
    </div>
  );
}

function LegendDot({ hex, label }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
      <span className="h-3 w-3 rounded-full shadow-inner" style={{ backgroundColor: hex }} />
      {label}
    </span>
  );
}
