import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { initialVendors, VENDOR_CATEGORIES, generateVendorId } from '../mock/vendorDirectoryData';
import StatusBadge from '../components/vendorDirectory/StatusBadge';
import VendorFormModal from '../components/vendorDirectory/VendorFormModal';
import VendorDetailsModal from '../components/vendorDirectory/VendorDetailsModal';

const CATEGORY_ICON = {
  Photography: Camera,
  Decorations: Sparkles,
  Hotels: Building2,
  Music: Music2,
};

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Suspended', 'Banned', 'Rejected'];
const PAGE_SIZE = 6;

export default function VendorDirectoryPage() {
  const [vendors, setVendors] = useState(initialVendors);
  const [statusTab, setStatusTab] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState({ open: false, vendor: null });
  const [detailsVendor, setDetailsVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
          v.businessName.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
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

  // ---- CRUD handlers ----

  function handleSaveVendor(form) {
    if (form.id) {
      setVendors((prev) => prev.map((v) => (v.id === form.id ? { ...v, ...form } : v)));
    } else {
      const newVendor = {
        ...form,
        id: generateVendorId(),
        appliedDate: new Date().toISOString().slice(0, 10),
        listingsCount: 0,
        rating: null,
        revenue: 0,
        verificationDocs: [],
      };
      setVendors((prev) => [newVendor, ...prev]);
    }
    setFormModal({ open: false, vendor: null });
  }

  function updateVendor(id, patch) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function handleApprove(vendor) {
    updateVendor(vendor.id, {
      status: 'Approved',
      approvedDate: new Date().toISOString().slice(0, 10),
      suspendReason: undefined,
    });
    setDetailsVendor(null);
  }

  function handleReject(vendor, reason) {
    updateVendor(vendor.id, { status: 'Rejected', rejectReason: reason });
    setDetailsVendor(null);
  }

  function handleRequestInfo(vendor) {
    updateVendor(vendor.id, { status: 'Pending', infoRequested: true });
    setDetailsVendor(null);
  }

  function handleHold(vendor) {
    updateVendor(vendor.id, { status: 'Pending', onHold: true });
    setDetailsVendor(null);
  }

  function handleSuspend(vendor) {
    updateVendor(vendor.id, {
      status: 'Suspended',
      suspendedDate: new Date().toISOString().slice(0, 10),
      suspendReason: 'Suspended by admin pending review',
    });
    setDetailsVendor(null);
  }

  function handleBan(vendor, reason) {
    updateVendor(vendor.id, {
      status: 'Banned',
      banDate: new Date().toISOString().slice(0, 10),
      banReason: reason,
    });
    setDetailsVendor(null);
  }

  function handleUnban(vendor) {
    updateVendor(vendor.id, { status: 'Approved', banReason: undefined, banDate: undefined });
    setDetailsVendor(null);
  }

  function confirmDelete() {
    setVendors((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Vendor directory</h1>
          <p className="text-sm text-gray-500">
            Manage photography, decorations, hotels and music vendors in one place.
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, vendor: null })}
          className="inline-flex items-center gap-2 rounded-md bg-[#8E406F] px-4 py-2 text-sm font-medium text-white hover:bg-[#75325a]"
        >
          <Plus size={16} />
          Add vendor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard icon={Users} label="Total vendors" value={stats.total} />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tone="amber" />
        <StatCard icon={ShieldCheck} label="Approved" value={stats.approved} tone="emerald" />
        <StatCard icon={ShieldAlert} label="Suspended" value={stats.suspended} tone="orange" />
        <StatCard icon={ShieldOff} label="Banned" value={stats.banned} tone="red" />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <CategoryPill
          label="All categories"
          active={category === 'All'}
          onClick={() => {
            setCategory('All');
            resetToFirstPage();
          }}
        />
        {VENDOR_CATEGORIES.map((c) => (
          <CategoryPill
            key={c}
            label={c}
            icon={CATEGORY_ICON[c]}
            active={category === c}
            onClick={() => {
              setCategory(c);
              resetToFirstPage();
            }}
          />
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Status tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusTab(s);
                  resetToFirstPage();
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusTab === s
                    ? 'bg-[#FDF0F4] text-[#8E406F]'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
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
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No vendors match these filters.
                  </td>
                </tr>
              )}
              {pageItems.map((v) => {
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
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {formModal.open && (
        <VendorFormModal
          vendor={formModal.vendor}
          onClose={() => setFormModal({ open: false, vendor: null })}
          onSave={handleSaveVendor}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              <h3 className="font-semibold">Delete vendor?</h3>
            </div>
            <p className="text-sm text-gray-600">
              This permanently removes <strong>{deleteTarget.businessName}</strong> and its
              records from the directory. This can&rsquo;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneClass =
    {
      amber: 'text-amber-600 bg-amber-50',
      emerald: 'text-emerald-600 bg-emerald-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
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

function CategoryPill({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
        active
          ? 'border-[#8E406F] bg-[#8E406F] text-white'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

function Th({ label, field, sortBy, sortDir, onSort }) {
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

function IconButton({ icon: Icon, label, onClick, tone }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`rounded-md p-1.5 ${
        tone === 'danger'
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={15} />
    </button>
  );
}
