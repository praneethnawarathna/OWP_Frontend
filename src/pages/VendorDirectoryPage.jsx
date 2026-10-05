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
import { logActivity, ACTION_TYPES } from '../utils/activityLogger';
import VendorFormModal from '../components/vendorDirectory/VendorFormModal';
import VendorDetailsModal from '../components/vendorDirectory/VendorDetailsModal';
import AddVendorWizard from '../components/vendorDirectory/AddVendorWizard';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableCard,
  AdminTableToolbar,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTablePagination,
  AdminIconButton,
} from '../components/common/AdminTableComponents';

const CATEGORY_ICON = {
  Photography: Camera,
  Decorations: Sparkles,
  Hotels: Building2,
  'Hotel / Venue': Building2,
  Venue: Building2,
  Catering: Sparkles,
  Music: Music2,
};

const VENDOR_CATEGORIES = ['Photography', 'Decorations', 'Hotels', 'Music', 'Catering'];
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

  const [isAddOpen, setIsAddOpen] = useState(false);
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
    if (category !== 'All') {
      const selectedLower = category.trim().toLowerCase();
      list = list.filter((v) => {
        if (!v.category) return false;
        return v.category
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .includes(selectedLower);
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          (v.businessName && v.businessName.toLowerCase().includes(q)) ||
          (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.id && String(v.id).toLowerCase().includes(q)) ||
          (v.category && v.category.toLowerCase().includes(q))
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

  async function handleSaveVendor(form, meta = {}) {
    setActionLoading(true);
    try {
      const numericId = form.vendorId || (form.id ? parseInt(String(form.id).replace(/\D/g, ''), 10) : null);
      const isEdit = Boolean(numericId);
      const url = isEdit ? `${API_BASE}/${numericId}` : API_BASE;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...form,
        reason: meta.reason || form.reason || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || errData.title || 'Failed to save vendor');
        return;
      }

      // Acting admin name from stored auth
      let actorName = 'System Admin';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        actorName = storedUser.fullName || storedUser.name || storedUser.email || 'System Admin';
      } catch (e) {
        actorName = 'System Admin';
      }

      if (isEdit) {
        const changedFields = meta.changedFields || [];
        if (changedFields.length > 0) {
          const changesSummary = changedFields
            .map((f) => `${f.label}: "${f.oldValue || 'none'}" → "${f.newValue || 'none'}"`)
            .join(', ');

          const description = meta.reason
            ? `Updated Vendor #${numericId} ("${form.businessName || 'Vendor'}") fields [${changesSummary}]. Reason: ${meta.reason}`
            : `Updated Vendor #${numericId} ("${form.businessName || 'Vendor'}") fields [${changesSummary}]`;

          logActivity(
            ACTION_TYPES.VENDOR_UPDATED,
            'Vendor',
            numericId.toString(),
            description,
            actorName
          );
        }
      } else {
        const data = await res.json().catch(() => ({}));
        const newId = data.vendorId || 'New';
        logActivity(
          ACTION_TYPES.GENERAL_UPDATE,
          'Vendor',
          newId.toString(),
          `Created new vendor "${form.businessName}" (${form.category || 'General'})`,
          actorName
        );
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

      // Acting admin name from stored auth
      let actorName = 'System Admin';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        actorName = storedUser.fullName || storedUser.name || storedUser.email || 'System Admin';
      } catch (e) {
        actorName = 'System Admin';
      }

      const actionType =
        newStatus === 'Approved' ? ACTION_TYPES.VENDOR_APPROVED :
        newStatus === 'Suspended' ? ACTION_TYPES.VENDOR_SUSPENDED :
        newStatus === 'Banned' ? ACTION_TYPES.VENDOR_BANNED :
        newStatus === 'Rejected' ? ACTION_TYPES.VENDOR_REJECTED :
        ACTION_TYPES.GENERAL_UPDATE;

      const oldStatus = vendor.status || 'Pending';
      const targetLabel = vendor.businessName ? `"${vendor.businessName}" (#${id})` : `Vendor #${id}`;
      const description = reason && reason.trim()
        ? `Changed ${targetLabel} status: ${oldStatus} → ${newStatus} (Reason: ${reason.trim()})`
        : `Changed ${targetLabel} status: ${oldStatus} → ${newStatus}`;

      logActivity(
        actionType,
        'Vendor',
        id.toString(),
        description,
        actorName
      );

      await fetchVendors();
      setDetailsVendor(null);
    } catch (err) {
      alert(err.message || 'Error updating vendor status.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleApprove(vendor) {
    updateVendorStatus(vendor, 'Approved', 'Approved by admin');
  }

  function handleReject(vendor, reason) {
    updateVendorStatus(vendor, 'Rejected', reason || 'Application rejected');
  }

  function handleRequestInfo(vendor) {
    updateVendorStatus(vendor, 'Pending', 'Info Requested by admin');
  }

  function handleHold(vendor) {
    updateVendorStatus(vendor, 'Pending', 'Placed on hold by admin');
  }

  function handleSuspend(vendor, reason) {
    if (reason) {
      updateVendorStatus(vendor, 'Suspended', reason);
    } else {
      const input = window.prompt(`Please enter a reason for suspending "${vendor.businessName}":`, 'Suspended due to compliance review');
      if (input === null) return;
      updateVendorStatus(vendor, 'Suspended', input.trim() || 'Suspended by admin');
    }
  }

  function handleBan(vendor, reason) {
    if (reason) {
      updateVendorStatus(vendor, 'Banned', reason);
    } else {
      const input = window.prompt(`Please enter a reason for banning "${vendor.businessName}":`, 'Policy violation');
      if (input === null) return;
      updateVendorStatus(vendor, 'Banned', input.trim() || 'Banned by admin');
    }
  }

  function handleUnban(vendor) {
    updateVendorStatus(vendor, 'Approved', 'Reactivated / Unbanned by admin');
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
      <AdminPageHeader
        title="Vendor Management"
        subtitle="Manage photography, decorations, hotels and music vendors in one place."
        action={
          <button
            id="add-vendor-btn"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8E406F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#78345c] transition-all"
          >
            <Plus size={15} />
            Add New Vendor
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <AdminStatCard icon={Users} label="Total vendors" value={stats.total} />
        <AdminStatCard
          icon={Clock}
          label="Pending approval"
          value={stats.pending}
          iconBg="bg-[#FEF3C7]"
          iconColor="text-[#D97706]"
        />
        <AdminStatCard
          icon={ShieldCheck}
          label="Approved"
          value={stats.approved}
          iconBg="bg-[#D1FAE5]"
          iconColor="text-[#059669]"
        />
        <AdminStatCard
          icon={ShieldAlert}
          label="Suspended"
          value={stats.suspended}
          iconBg="bg-[#FEF3F2]"
          iconColor="text-[#D92D20]"
        />
        <AdminStatCard
          icon={ShieldOff}
          label="Banned"
          value={stats.banned}
          iconBg="bg-[#F1F5F9]"
          iconColor="text-[#475569]"
        />
      </div>

      {/* Main card: tabs, search, filter, table */}
      <AdminTableCard>
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F1E5EC] px-6 pt-4">
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
                className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-[#8E406F] text-[#8E406F]'
                    : 'border-transparent text-[#737373] hover:text-[#333]'
                }`}
              >
                {tab}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? 'bg-[#FDF0F4] text-[#8E406F]' : 'bg-[#F1E5EC]/60 text-[#737373]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Category filter + search */}
        <div className="p-4 border-b border-[#F1E5EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
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
                  className={`rounded-lg px-3 py-1 text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'bg-[#8E406F] text-white shadow-sm'
                      : 'bg-[#FAFBFC] border border-[#F1E5EC] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search by name, owner or email"
              className="w-64 rounded-lg border border-[#F1E5EC] bg-[#FAFBFC] py-2 pl-8 pr-3 text-xs text-[#333] placeholder:text-[#aaa] outline-none focus:bg-white focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHead className="w-[22%]">
              <button
                onClick={() => toggleSort('businessName')}
                className="inline-flex items-center gap-1 hover:text-[#333] transition-colors"
              >
                <span>Vendor</span>
                <ArrowUpDown size={12} className={sortBy === 'businessName' ? 'text-[#8E406F]' : 'text-[#bbb]'} />
              </button>
            </AdminTableHead>
            <AdminTableHead className="w-[15%]">Category</AdminTableHead>
            <AdminTableHead align="center" className="w-[8%]">
              <button
                onClick={() => toggleSort('listingsCount')}
                className="inline-flex items-center gap-1 hover:text-[#333] transition-colors"
              >
                <span>Listings</span>
                <ArrowUpDown size={12} className={sortBy === 'listingsCount' ? 'text-[#8E406F]' : 'text-[#bbb]'} />
              </button>
            </AdminTableHead>
            <AdminTableHead align="center" className="w-[8%]">
              <button
                onClick={() => toggleSort('rating')}
                className="inline-flex items-center gap-1 hover:text-[#333] transition-colors"
              >
                <span>Rating</span>
                <ArrowUpDown size={12} className={sortBy === 'rating' ? 'text-[#8E406F]' : 'text-[#bbb]'} />
              </button>
            </AdminTableHead>
            <AdminTableHead className="w-[11%]">
              <button
                onClick={() => toggleSort('appliedDate')}
                className="inline-flex items-center gap-1 hover:text-[#333] transition-colors"
              >
                <span>Applied</span>
                <ArrowUpDown size={12} className={sortBy === 'appliedDate' ? 'text-[#8E406F]' : 'text-[#bbb]'} />
              </button>
            </AdminTableHead>
            <AdminTableHead className="w-[13%]">Status</AdminTableHead>
            <AdminTableHead align="right" className="w-[23%] text-right">Actions</AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-[#aaa]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={28} className="animate-spin text-[#8E406F]" />
                    <span>Loading vendors from database...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#D92D20]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle size={28} className="text-[#D92D20]" />
                    <span>{error}</span>
                    <button
                      onClick={fetchVendors}
                      className="mt-2 rounded-lg border border-[#F1E5EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F]"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#aaa]">
                  No vendors match these filters.
                </td>
              </tr>
            ) : (
              pageItems.map((v) => {
                const primaryCat = (v.category || '').split(',')[0].trim();
                const CategoryIcon = CATEGORY_ICON[primaryCat] || CATEGORY_ICON[v.category] || Building2;
                return (
                  <AdminTableRow key={v.id}>
                    <AdminTableCell>
                      <p className="font-semibold text-[#333] text-sm">{v.businessName}</p>
                      <p className="text-xs text-[#737373] mt-0.5">
                        {v.id} &middot; {v.ownerName}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#555] font-medium">
                        <CategoryIcon size={14} className="text-[#8E406F] shrink-0" />
                        {v.category}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell align="center" className="text-xs text-[#555] font-medium">{v.listingsCount ?? 0}</AdminTableCell>
                    <AdminTableCell align="center" className="text-xs text-[#555] font-medium">
                      {v.rating ? `${v.rating} ★` : '—'}
                    </AdminTableCell>
                    <AdminTableCell className="text-xs text-[#737373]">{v.appliedDate}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-0.5">
                        <div>
                          <StatusBadge status={v.status} />
                        </div>
                        {(v.statusChangedAt || v.statusChangeReason) && (
                          <div className="max-w-[190px] text-[11px] text-[#737373]">
                            {v.statusChangedAt && (
                              <span className="block text-[10px] text-[#999]">
                                {v.statusChangedAt}
                              </span>
                            )}
                            {v.statusChangeReason && (
                              <span 
                                className="block truncate text-[#737373] italic" 
                                title={v.statusChangeReason}
                              >
                                &ldquo;{v.statusChangeReason}&rdquo;
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell align="right" className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <AdminIconButton
                          label="View"
                          ariaLabel="View"
                          title="View Details"
                          onClick={() => setDetailsVendor(v)}
                        >
                          <Eye size={14} />
                        </AdminIconButton>
                        <AdminIconButton
                          label="Edit"
                          ariaLabel="Edit"
                          title="Edit Vendor"
                          onClick={() => setFormModal({ open: true, vendor: v })}
                        >
                          <Edit2 size={14} />
                        </AdminIconButton>
                        {v.status === 'Approved' && (
                          <AdminIconButton
                            label="Suspend"
                            ariaLabel="Suspend"
                            title="Suspend Vendor"
                            onClick={() => handleSuspend(v)}
                            variant="danger"
                          >
                            <ShieldAlert size={14} />
                          </AdminIconButton>
                        )}
                        {v.status === 'Suspended' && (
                          <AdminIconButton
                            label="Reactivate"
                            ariaLabel="Reactivate"
                            title="Reactivate Vendor"
                            onClick={() => updateVendorStatus(v, 'Approved', 'Reactivated by admin')}
                            className="text-[#059669] hover:bg-[#E6F4EE] hover:border-[#A3D9B8]"
                          >
                            <RotateCcw size={14} />
                          </AdminIconButton>
                        )}
                        {v.status === 'Banned' ? (
                          <AdminIconButton
                            label="Unban"
                            ariaLabel="Unban"
                            title="Unban Vendor"
                            onClick={() => handleUnban(v)}
                            className="text-[#059669] hover:bg-[#E6F4EE] hover:border-[#A3D9B8]"
                          >
                            <ShieldCheck size={14} />
                          </AdminIconButton>
                        ) : (
                          <AdminIconButton
                            label="Ban"
                            ariaLabel="Ban"
                            title="Ban Vendor"
                            onClick={() => handleBan(v)}
                            variant="danger"
                          >
                            <Ban size={14} />
                          </AdminIconButton>
                        )}
                        <AdminIconButton
                          label="Delete"
                          ariaLabel="Delete"
                          title="Delete Vendor"
                          onClick={() => setDeleteTarget(v)}
                          variant="danger"
                        >
                          <Trash2 size={14} />
                        </AdminIconButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination */}
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemName="vendors"
        />
      </AdminTableCard>

      {/* Add New Vendor — 4-step registration wizard */}
      {isAddOpen && (
        <div
          id="add-vendor-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}
        >
          <div
            className="relative w-full max-w-2xl h-[90vh] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#F1E5EC] flex flex-col overflow-hidden min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <AddVendorWizard
              onClose={() => setIsAddOpen(false)}
              onSuccess={() => { setIsAddOpen(false); fetchVendors(); }}
            />
          </div>
        </div>
      )}

      {/* Edit Vendor modal (unchanged) */}
      {formModal.open && (
        <VendorFormModal
          vendor={formModal.vendor}
          onClose={() => setFormModal({ open: false, vendor: null })}
          onSave={handleSaveVendor}
          onImageRemoved={fetchVendors}
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


