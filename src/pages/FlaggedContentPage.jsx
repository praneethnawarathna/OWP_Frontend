import { useMemo, useState } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Flag,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { initialFlags, CONTENT_TYPES } from '../mock/flaggedContentData';
import { FlagStatusBadge, SeverityBadge } from '../components/flaggedContent/FlagBadges';
import FlagDetailsModal from '../components/flaggedContent/FlagDetailsModal';

const STATUS_TABS = ['All', 'Open', 'UnderReview', 'Dismissed', 'ContentRemoved'];
const STATUS_TAB_LABELS = {
  All: 'All',
  Open: 'Open',
  UnderReview: 'Under review',
  Dismissed: 'Dismissed',
  ContentRemoved: 'Removed',
};
const SEVERITY_ORDER = { High: 3, Medium: 2, Low: 1 };
const PAGE_SIZE = 6;

export default function FlaggedContentPage() {
  const [flags, setFlags] = useState(initialFlags);
  const [statusTab, setStatusTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('reportedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [detailsFlag, setDetailsFlag] = useState(null);

  const stats = useMemo(() => {
    const count = (s) => flags.filter((f) => f.status === s).length;
    return {
      total: flags.length,
      open: count('Open'),
      underReview: count('UnderReview'),
      resolved: count('Dismissed') + count('ContentRemoved'),
    };
  }, [flags]);

  const filtered = useMemo(() => {
    let list = flags;
    if (statusTab !== 'All') list = list.filter((f) => f.status === statusTab);
    if (typeFilter !== 'All') list = list.filter((f) => f.contentType === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.contentTitle.toLowerCase().includes(q) ||
          f.vendorName.toLowerCase().includes(q) ||
          f.reason.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = sortBy === 'severity' ? SEVERITY_ORDER[a.severity] : a[sortBy] ?? '';
      const bv = sortBy === 'severity' ? SEVERITY_ORDER[b.severity] : b[sortBy] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [flags, statusTab, typeFilter, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }

  function updateFlag(id, patch) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  const today = () => new Date().toISOString().slice(0, 10);

  function handleMarkReview(flag) {
    updateFlag(flag.id, { status: 'UnderReview' });
    setDetailsFlag((prev) => (prev ? { ...prev, status: 'UnderReview' } : prev));
  }

  function handleDismiss(flag, note) {
    updateFlag(flag.id, { status: 'Dismissed', resolutionNote: note, reviewedAt: today() });
    setDetailsFlag(null);
  }

  function handleRemove(flag, note) {
    updateFlag(flag.id, { status: 'ContentRemoved', resolutionNote: note, reviewedAt: today() });
    setDetailsFlag(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Flagged content review</h1>
        <p className="text-sm text-gray-500">
          Review listings, reviews and vendor profiles reported by customers, admins or the AI agent.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Flag} label="Total flags" value={stats.total} />
        <StatCard icon={Clock} label="Open" value={stats.open} tone="amber" />
        <StatCard icon={Eye} label="Under review" value={stats.underReview} tone="blue" />
        <StatCard icon={ShieldCheck} label="Resolved" value={stats.resolved} tone="emerald" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusTab(s);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusTab === s ? 'bg-[#FDF0F4] text-[#8E406F]' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {STATUS_TAB_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
            >
              <option value="All">All content types</option>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, vendor or reason"
                className="w-64 rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Content</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <Th label="Severity" field="severity" sortBy={sortBy} onSort={toggleSort} />
                <Th label="Reported" field="reportedAt" sortBy={sortBy} onSort={toggleSort} />
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No flagged content matches these filters.
                  </td>
                </tr>
              )}
              {pageItems.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{f.contentTitle}</p>
                    <p className="text-xs text-gray-400">
                      {f.id} &middot; {f.vendorName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.contentType}</td>
                  <td className="px-4 py-3 text-gray-600">{f.reason}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.reportedAt}</td>
                  <td className="px-4 py-3">
                    <FlagStatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDetailsFlag(f)}
                        title="Review"
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <span>
            Showing {pageItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-200 p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-200 p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailsFlag && (
        <FlagDetailsModal
          flag={detailsFlag}
          onClose={() => setDetailsFlag(null)}
          onMarkReview={handleMarkReview}
          onDismiss={handleDismiss}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneClass =
    {
      amber: 'text-amber-600 bg-amber-50',
      blue: 'text-blue-600 bg-blue-50',
      emerald: 'text-emerald-600 bg-emerald-50',
    }[tone] || 'text-[#8E406F] bg-[#FDF0F4]';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className={`mb-2 inline-flex rounded-md p-1.5 ${toneClass}`}>
        <Icon size={16} />
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Th({ label, field, sortBy, onSort }) {
  const active = sortBy === field;
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 ${active ? 'text-[#8E406F]' : ''}`}
      >
        {label}
        <ArrowUpDown size={12} className={active ? 'opacity-100' : 'opacity-30'} />
      </button>
    </th>
  );
}
