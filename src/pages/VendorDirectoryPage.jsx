import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Ban,
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Camera,
  Sparkles,
  Building2,
  Music2,
  Users,
  Clock,
  ShieldCheck,
  ShieldOff,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../components/vendorDirectory/StatusBadge';
import VendorFormModal from '../components/vendorDirectory/VendorFormModal';
import VendorDetailsModal from '../components/vendorDirectory/VendorDetailsModal';

const CATEGORY_ICON = {
  Photography: Camera,
  Decorations: Sparkles,
  Hotels: Building2,
  Music: Music2,
};

const VENDOR_CATEGORIES = ['Photography', 'Decorations', 'Hotels', 'Music'];
const STATUS_TABS = ['All', 'Pending', 'Approved', 'Suspended', 'Banned', 'Rejected'];
const PAGE_SIZE = 6;

const API_BASE = 'http://localhost:5131/api/admin/vendors';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export default function VendorDirectoryPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [statusTab, setStatusTab] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState({ open: false, vendor: null });
  const [detailsVendor, setDetailsVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch vendors from database
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.title || `Server returned error ${res.status}`);
      }
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const stats = useMemo(() => {
    const byStatus = (s) => vendors.filter((v) => v.status === s).length;
    return {
      total: vendors.length,
      pending: byStatus('Pending'),
      approved: byStatus('Approved'),
      suspended: byStatus('Suspended'),
      banned: byStatus('Banned'),
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors;
    if (statusTab !== 'All') list = list.filter((v) => v.status === statusTab);
    if (category !== 'All') list = list.filter((v) => v.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          (v.businessName && v.businessName.toLowerCase().includes(q)) ||
          (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.id && String(v.id).toLowerCase().includes(q))
      );
    }
    const sorted = [...list].sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vendors, statusTab, category, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetToFirstPage() {
    setPage(1);
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }

  // ---- CRUD & Status handlers ----

  async function handleSaveVendor(form) {
    setActionLoading(true);
    try {
      const numericId = form.vendorId || (form.id ? parseInt(String(form.id).replace(/\D/g, ''), 10) : null);
      const isEdit = Boolean(numericId);
      const url = isEdit ? `${API_BASE}/${numericId}` : API_BASE;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || errData.title || 'Failed to save vendor');
        return;
      }

      await fetchVendors();
      setFormModal({ open: false, vendor: null });
    } catch (err) {
      alert(err.message || 'Error saving vendor.');
    } finally {
      setActionLoading(false);
    }
  }

  async function updateVendorStatus(vendor, newStatus, reason) {
    const id = vendor.vendorId || parseInt(String(vendor.id).replace(/\D/g, ''), 10);
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || errData.title || 'Failed to update vendor status.');
        return;
      }

      await fetchVendors();
      setDetailsVendor(null);
    } catch (err) {
      alert(err.message || 'Error updating vendor status.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleApprove(vendor) {
    updateVendorStatus(vendor, 'Approved');
  }

  function handleReject(vendor, reason) {
    updateVendorStatus(vendor, 'Rejected', reason);
  }

  function handleRequestInfo(vendor) {
    updateVendorStatus(vendor, 'Pending', 'Info Requested');
  }

  function handleHold(vendor) {
    updateVendorStatus(vendor, 'Pending', 'On Hold');
  }

  function handleSuspend(vendor) {
    updateVendorStatus(vendor, 'Suspended', 'Suspended by admin');
  }

  function handleBan(vendor, reason) {
    updateVendorStatus(vendor, 'Banned', reason);
  }

  function handleUnban(vendor) {
    updateVendorStatus(vendor, 'Approved');
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.vendorId || parseInt(String(deleteTarget.id).replace(/\D/g, ''), 10);
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || errData.title || 'Failed to delete vendor.');
        return;
      }

      await fetchVendors();
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Error deleting vendor.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Vendor Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage photography, decorations, hotels and music vendors in one place.
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, vendor: null })}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#8E406F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#78345c] sm:self-auto"
        >
          <Plus size={16} />
          Add vendor
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Total vendors" value={stats.total} />
        <StatCard icon={Clock} label="Pending approval" value={stats.pending} tone="amber" />
        <StatCard icon={ShieldCheck} label="Approved" value={stats.approved} tone="emerald" />
        <StatCard icon={ShieldAlert} label="Suspended" value={stats.suspended} tone="rose" />
        <StatCard icon={ShieldOff} label="Banned" value={stats.banned} tone="slate" />
      </div>

      {/* Main card: tabs, search, filter, table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-6 pt-4">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? vendors.length
                : vendors.filter((v) => v.status === tab).length;
            const active = statusTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusTab(tab);
                  resetToFirstPage();
                }}
                className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-[#8E406F] text-[#8E406F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? 'bg-[#FDF0F4] text-[#8E406F]' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Category filter + search */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Category:
            </span>
            {['All', ...VENDOR_CATEGORIES].map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    resetToFirstPage();
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#8E406F] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
                resetToFirstPage();
              }}
              placeholder="Search by name, owner or email"
              className="w-64 rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <Th label="Vendor" field="businessName" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Category</th>
                <Th label="Listings" field="listingsCount" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Rating" field="rating" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Applied" field="appliedDate" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#8E406F]" />
                      <span>Loading vendors from database...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-red-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle size={24} className="text-red-500" />
                      <span>{error}</span>
                      <button
                        onClick={fetchVendors}
                        className="mt-2 rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No vendors match these filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((v) => {
                  const CategoryIcon = CATEGORY_ICON[v.category] || Building2;
                  return (
                    <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{v.businessName}</p>
                        <p className="text-xs text-gray-400">
                          {v.id} &middot; {v.ownerName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <CategoryIcon size={14} className="text-[#8E406F]" />
                          {v.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{v.listingsCount ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {v.rating ? `${v.rating} ★` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{v.appliedDate}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton icon={Eye} label="View" onClick={() => setDetailsVendor(v)} />
                          <IconButton
                            icon={Edit2}
                            label="Edit"
                            onClick={() => setFormModal({ open: true, vendor: v })}
                          />
                          {v.status === 'Approved' && (
                            <IconButton
                              icon={ShieldAlert}
                              label="Suspend"
                              onClick={() => handleSuspend(v)}
                            />
                          )}
                          {v.status === 'Suspended' && (
                            <IconButton
                              icon={RotateCcw}
                              label="Reactivate"
                              onClick={() => handleApprove(v)}
                            />
                          )}
                          {v.status === 'Banned' && (
                            <IconButton icon={RotateCcw} label="Unban" onClick={() => handleUnban(v)} />
                          )}
                          {v.status !== 'Banned' && v.status !== 'Pending' && (
                            <IconButton
                              icon={Ban}
                              label="Ban"
                              tone="danger"
                              onClick={() => handleBan(v, 'Banned directly from directory')}
                            />
                          )}
                          <IconButton
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => setDeleteTarget(v)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm text-gray-500">
          <span>
            {filtered.length === 0
              ? 'Showing 0 vendors'
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {formModal.open && (
        <VendorFormModal
          vendor={formModal.vendor}
          onClose={() => setFormModal({ open: false, vendor: null })}
          onSave={handleSaveVendor}
          loading={actionLoading}
        />
      )}

      {detailsVendor && (
        <VendorDetailsModal
          vendor={detailsVendor}
          onClose={() => setDetailsVendor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
          onHold={handleHold}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onUnban={handleUnban}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-semibold">Delete vendor?</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">{deleteTarget.businessName}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function StatCard({ icon: Icon, label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-[#FDF0F4] text-[#8E406F]',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`rounded-lg p-2.5 ${toneClasses[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Th({ label, field, sortBy, sortDir, onSort }) {
  const active = sortBy === field;
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-gray-700"
      >
        <span>{label}</span>
        <ArrowUpDown size={12} className={active ? 'text-[#8E406F]' : 'text-gray-300'} />
      </button>
    </th>
  );
}

function IconButton({ icon: Icon, label, onClick, tone = 'default' }) {
  const toneClass =
    tone === 'danger'
      ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700';
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition-colors ${toneClass}`}
    >
      <Icon size={15} />
    </button>
  );
}
