import { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Download,
  Users,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  MapPin,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { customers as initialCustomers } from '../mock/customerData';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers / sub-components
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Active:   'bg-[#E6F4EE] text-[#1A7F4B] border border-[#A3D9B8]',
  Inactive: 'bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]',
  Flagged:  'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? ''}`}>
      {status}
    </span>
  );
}

const AVATAR_COLORS = [
  '#8E406F', '#4A7C6B', '#3B6EA5', '#7C5CBF', '#C8612F', '#2E7D8C',
];

function Avatar({ initials, index, size = 'md' }) {
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const cls = size === 'lg'
    ? 'h-14 w-14 text-base'
    : 'h-9 w-9 text-xs';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center shrink-0 font-bold shadow-sm text-white`}
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, delta }) {
  return (
    <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1E293B] leading-tight">{value.toLocaleString()}</p>
        <p className="text-xs text-[#737373] mt-0.5 leading-snug">{label}</p>
        {delta && <p className="text-xs text-[#8E406F] font-medium mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// Modal: View Details (read-only slide-over)
// ─────────────────────────────────────────────────────────────────────────────
function ViewModal({ customer, index, onClose, onToggleStatus }) {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#8E406F] to-[#73325A] px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar initials={customer.avatarInitials} index={index} size="lg" />
            <div>
              <h2 className="text-white font-bold text-lg leading-snug">{customer.coupleNames}</h2>
              <div className="flex items-center gap-1 mt-1 text-white/70 text-xs">
                <MapPin size={10} />
                <span>{customer.location}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between bg-[#FDF0F4] rounded-xl px-4 py-3 border border-[#F6DCE6]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Account Status</span>
            <StatusBadge status={customer.status} />
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Contact Information</p>
            <div className="flex items-center gap-3 text-sm text-[#333]">
              <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#8E406F]" />
              </div>
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#333]">
              <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                <Phone size={14} className="text-[#8E406F]" />
              </div>
              <span>{customer.phone}</span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Wedding Date', value: customer.weddingDate, icon: Calendar },
              { label: 'Inquiries Sent', value: customer.inquiriesCount, icon: MessageSquare },
              { label: 'Member Since', value: customer.joinDate, icon: Users },
              { label: 'Location', value: customer.location, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-[#8E406F]" />
                  <p className="text-[10px] font-semibold text-[#8E406F] uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#F6DCE6] px-6 py-4 flex gap-3">
          <button
            onClick={onToggleStatus}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
              customer.status === 'Active'
                ? 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                : 'bg-[#8E406F] text-white hover:bg-[#73325A]'
            }`}
          >
            {customer.status === 'Active'
              ? <><ToggleRight size={15} />Set Inactive</>
              : <><ToggleLeft size={15} />Set Active</>}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#F6DCE6] text-[#737373] text-sm font-medium hover:bg-[#FDF0F4] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({ customer, onConfirm, onClose }) {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="h-14 w-14 rounded-full bg-[#FEF3F2] border-2 border-[#FECDCA] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-[#D92D20]" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-1">Delete Customer?</h3>
          <p className="text-sm text-[#737373]">
            You're about to permanently delete the record for{' '}
            <span className="font-semibold text-[#1E293B]">{customer.coupleNames}</span>.
            This action cannot be undone.
          </p>
        </div>
        <div className="border-t border-[#F6DCE6] px-6 py-4 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#D92D20] text-white text-sm font-medium hover:bg-[#B91C1C] transition-all active:scale-95"
          >
            <Trash2 size={14} />
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#F6DCE6] text-[#737373] text-sm font-medium hover:bg-[#FDF0F4] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
        isSuccess
          ? 'bg-white border-[#A3D9B8] text-[#1A7F4B]'
          : 'bg-white border-[#FECDCA] text-[#D92D20]'
      }`}
    >
      {isSuccess
        ? <CheckCircle2 size={16} className="text-[#1A7F4B] shrink-0" />
        : <AlertCircle size={16} className="text-[#D92D20] shrink-0" />}
      {message}
      <button onClick={onDismiss} className="ml-2 text-[#999] hover:text-[#555]">
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 7;

export default function CustomerManagementPage() {
  // ── Data state ──────────────────────────────────────────────
  const [customerList, setCustomerList] = useState(initialCustomers);

  // ── Filtering / pagination state ─────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Modal state ──────────────────────────────────────────────
  const [viewTarget,   setViewTarget]   = useState(null); // { customer, index }
  const [deleteTarget, setDeleteTarget] = useState(null); // customer

  // ── Toast state ──────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  };

  // ── Toggle Status ──────────────────────────────────────────
  const handleToggleStatus = (customer) => {
    const next = customer.status === 'Active' ? 'Inactive' : 'Active';
    setCustomerList(prev =>
      prev.map(c => c.id === customer.id ? { ...c, status: next } : c)
    );
    if (viewTarget?.customer?.id === customer.id) {
      setViewTarget(v => ({ ...v, customer: { ...v.customer, status: next } }));
    }
    showToast(`${customer.coupleNames} set to ${next}.`);
  };

  // ── Derived metrics ──────────────────────────────────────────
  const liveMetrics = useMemo(() => ({
    totalCouples:      customerList.length,
    activeInquiries:   customerList.reduce((s, c) => s + c.inquiriesCount, 0),
    inactiveOrFlagged: customerList.filter(c => c.status === 'Inactive' || c.status === 'Flagged').length,
  }), [customerList]);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customerList.filter((c) => {
      const matchesSearch =
        c.coupleNames.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customerList, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => setCurrentPage(1);

  // ── CSV export ────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['ID','Couple Names','Email','Phone','Wedding Date','Location','Inquiries','Status','Join Date'];
    const rows = filtered.map(c =>
      [c.id, `"${c.coupleNames}"`, c.email, c.phone, c.weddingDate, `"${c.location}"`, c.inquiriesCount, c.status, c.joinDate].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── CRUD handlers ─────────────────────────────────────────────

  // Open Add modal
  const openAdd = () => {
    setEditForm({ ...BLANK_FORM });
    setFormErrors({});
    setEditId(null);
    setEditMode('add');
  };

  // Open Edit modal
  const openEdit = (customer) => {
    setViewTarget(null);
    setEditForm({ ...customer });
    setFormErrors({});
    setEditId(customer.id);
    setEditMode('edit');
  };

  // Save (Add or Edit)
  const handleSave = () => {
    const errors = validate(editForm);
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    if (editMode === 'add') {
      const newCustomer = { ...editForm, id: nextId++ };
      setCustomerList(prev => [newCustomer, ...prev]);
      showToast(`${editForm.coupleNames} has been added.`);
    } else {
      setCustomerList(prev => prev.map(c => c.id === editId ? { ...editForm, id: editId } : c));
      showToast(`${editForm.coupleNames} has been updated.`);
    }
    setEditMode(null);
  };

  // Delete
  const handleDelete = () => {
    setCustomerList(prev => prev.filter(c => c.id !== deleteTarget.id));
    showToast(`${deleteTarget.coupleNames} has been deleted.`, 'error');
    setDeleteTarget(null);
    // Clamp page if last item on page removed
    setCurrentPage(p => {
      const newTotal = Math.max(1, Math.ceil((filtered.length - 1) / PAGE_SIZE));
      return p > newTotal ? newTotal : p;
    });
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1
          className="text-2xl font-bold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Customer Management
        </h1>
        <p className="text-sm text-[#8E406F] mt-0.5">
          Monitor registered couples, manage customer profiles, and review inquiry activity.
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          iconBg="#F6DCE6"
          iconColor="#8E406F"
          label="Total Registered Couples"
          value={liveMetrics.totalCouples}
          delta={`${customerList.length} in system`}
        />
        <MetricCard
          icon={MessageSquare}
          iconBg="#E6F4EE"
          iconColor="#1A7F4B"
          label="Total Inquiries Sent"
          value={liveMetrics.activeInquiries}
          delta="Across all couples"
        />
        <MetricCard
          icon={AlertTriangle}
          iconBg="#FEF3F2"
          iconColor="#D92D20"
          label="Inactive / Flagged Accounts"
          value={liveMetrics.inactiveOrFlagged}
          delta="Require attention"
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
            <input
              id="customer-search"
              type="search"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
              placeholder="Search by name or email…"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            />
          </div>

          <div className="relative">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Flagged">Flagged</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
          </div>

          <div className="flex-1 hidden sm:block" />

          <button
            id="export-csv-btn"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#8E406F] text-[#8E406F] text-sm font-medium hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all whitespace-nowrap"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F6DCE6] bg-[#FAE8F0]">
                {['Couple Name', 'Contact Info', 'Wedding Date', 'Inquiries Sent', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6DCE6]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-[#aaa] text-sm">
                    <Users size={32} className="mx-auto mb-3 text-[#e8c4d8]" />
                    No customers match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((customer, idx) => {
                  const absIdx = (currentPage - 1) * PAGE_SIZE + idx;
                  return (
                    <tr key={customer.id} className="bg-white hover:bg-[#FDF0F4] transition-colors">
                      {/* Couple Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={customer.avatarInitials} index={absIdx} />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1E293B] truncate">{customer.coupleNames}</p>
                            <div className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
                              <MapPin size={10} className="shrink-0" />
                              <span>{customer.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <p className="text-[#333] truncate">{customer.email}</p>
                        <p className="text-xs text-[#737373] mt-0.5">{customer.phone}</p>
                      </td>

                      {/* Wedding Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[#333]">
                          <Calendar size={13} className="text-[#8E406F] shrink-0" />
                          <span>{customer.weddingDate}</span>
                        </div>
                      </td>

                      {/* Inquiries */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#F6DCE6] text-[#8E406F] text-xs font-bold">
                          {customer.inquiriesCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={customer.status} />
                      </td>

                      {/* Actions — View / Toggle Status / Delete */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            aria-label={`View ${customer.coupleNames}`}
                            onClick={() => setViewTarget({ customer, index: absIdx })}
                            title="View Details"
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F] transition-all"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Toggle Status */}
                          <button
                            aria-label={`Toggle status for ${customer.coupleNames}`}
                            onClick={() => handleToggleStatus(customer)}
                            title={customer.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${
                              customer.status === 'Active'
                                ? 'border-[#D1D5DB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] hover:border-[#9CA3AF]'
                                : 'border-[#A3D9B8] text-[#1A7F4B] hover:bg-[#E6F4EE] hover:text-[#15653B] hover:border-[#6DC49A]'
                            }`}
                          >
                            {customer.status === 'Active'
                              ? <ToggleRight size={14} />
                              : <ToggleLeft size={14} />}
                          </button>

                          {/* Delete */}
                          <button
                            aria-label={`Delete ${customer.coupleNames}`}
                            onClick={() => setDeleteTarget(customer)}
                            title="Delete"
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FEF3F2] hover:text-[#D92D20] hover:border-[#FECDCA] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
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
        <div className="px-5 py-3 border-t border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white">
          <p className="text-xs text-[#737373]">
            Showing{' '}
            <span className="font-semibold text-[#1E293B]">
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            </span>
            {' '}–{' '}
            <span className="font-semibold text-[#1E293B]">
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-[#1E293B]">{filtered.length}</span> results
          </p>

          <div className="flex items-center gap-1">
            <button
              id="prev-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center h-7 w-7 rounded-lg text-xs font-medium transition-colors border ${
                  page === currentPage
                    ? 'bg-[#8E406F] text-white border-[#8E406F]'
                    : 'border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              id="next-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {viewTarget && (
        <ViewModal
          customer={viewTarget.customer}
          index={viewTarget.index}
          onClose={() => setViewTarget(null)}
          onToggleStatus={() => handleToggleStatus(viewTarget.customer)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
