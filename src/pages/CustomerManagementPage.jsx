import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  X,
  MapPin,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  DollarSign,
  ShieldAlert,
  Filter,
} from 'lucide-react';
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

// ============================================================
// API Configuration
// ============================================================
const API_BASE = 'http://localhost:5131/api/customers';
const API_FALLBACK = 'http://localhost:5131/api/customer-management';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// Helper for making API calls with fallback route support
async function fetchWithFallback(endpointPath, options = {}) {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  
  // Try primary /api/customers endpoint first
  let res = await fetch(`${API_BASE}${endpointPath}`, { ...options, headers });
  if (res.status === 404) {
    // If not found, try fallback /api/customer-management
    res = await fetch(`${API_FALLBACK}${endpointPath}`, { ...options, headers });
  }
  return res;
}

// ============================================================
// Helpers & Sub-components
// ============================================================

const STATUS_STYLES = {
  Active:   'bg-[#E6F4EE] text-[#1A7F4B] border border-[#A3D9B8]',
  Inactive: 'bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]',
  Flagged:  'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]',
  Pending:  'bg-[#FFF8E6] text-[#B54708] border border-[#FEDF89]',
};

function StatusBadge({ status }) {
  const norm = status || 'Active';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[norm] || STATUS_STYLES.Active}`}>
      {norm}
    </span>
  );
}

const AVATAR_COLORS = [
  '#8E406F', '#4A7C6B', '#3B6EA5', '#7C5CBF', '#C8612F', '#2E7D8C',
];

function getInitials(name) {
  if (!name || name === 'N/A') return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function Avatar({ initials, name, index = 0, size = 'md' }) {
  const letters = initials || getInitials(name);
  const bg = AVATAR_COLORS[Math.abs(index) % AVATAR_COLORS.length];
  const cls = size === 'lg'
    ? 'h-14 w-14 text-base font-bold'
    : 'h-9 w-9 text-xs font-bold';

  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center shrink-0 shadow-sm text-white`}
      style={{ backgroundColor: bg }}
    >
      {letters}
    </div>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, delta }) {
  return (
    <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1E293B] leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-[#737373] mt-0.5 leading-snug">{label}</p>
        {delta && <p className="text-xs text-[#8E406F] font-medium mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}

// ============================================================
// Modal: View Details & Inquiry Activity
// ============================================================
function ViewModal({ data, onClose }) {
  if (!data) return null;
  const { customer, details, loadingDetails, index } = data;
  const current = details || customer;
  const inquiries = details?.inquiries || customer?.inquiries || [];

  const coupleDisplayName =
    current.coupleName ||
    current.coupleNames ||
    `${current.firstName || ''} ${current.lastName || ''}`.trim() ||
    'Registered Couple';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8E406F] to-[#73325A] px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={current.avatarInitials}
              name={coupleDisplayName}
              index={index}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif leading-snug">
                  {coupleDisplayName}
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-white/20 text-white border border-white/30">
                  {current.status || 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                <MapPin size={12} />
                <span>{current.location || 'Mobile App Registered Couple'}</span>
                <span>•</span>
                <span>Customer ID: #{current.customerId || current.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Overview Grid */}
          <div>
            <h3 className="text-xs font-bold text-[#8E406F] uppercase tracking-wider mb-3">
              Couple & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#8E406F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#737373]">Email Address</p>
                  <p className="text-sm font-semibold text-[#1E293B] truncate">{current.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-[#8E406F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#737373]">Phone Number</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{current.phone || current.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-[#8E406F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#737373]">Wedding Date</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{current.weddingDate || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-[#8E406F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#737373]">Registered On</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{current.joinDate || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Inquiry Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#8E406F]" />
                <h3 className="text-xs font-bold text-[#8E406F] uppercase tracking-wider">
                  Recent Inquiry Activity
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F6DCE6] text-[#8E406F]">
                {inquiries.length || current.inquiriesSent || current.inquiriesCount || 0} Total Inquiries
              </span>
            </div>

            {loadingDetails ? (
              <div className="py-8 text-center text-sm text-[#737373] flex flex-col items-center justify-center gap-2 bg-[#FDF0F4] rounded-xl border border-[#F6DCE6]">
                <RefreshCw size={20} className="animate-spin text-[#8E406F]" />
                <span>Loading recent inquiries from server...</span>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-8 px-4 text-center bg-[#FDF0F4]/60 border border-[#F6DCE6] rounded-xl">
                <MessageSquare size={28} className="mx-auto mb-2 text-[#8E406F]/40" />
                <p className="text-sm font-medium text-[#1E293B]">No inquiries sent yet</p>
                <p className="text-xs text-[#737373] mt-0.5">
                  This couple has not submitted any vendor inquiries through the mobile app yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq, idx) => (
                  <div
                    key={inq.inquiryId || idx}
                    className="p-4 rounded-xl border border-[#F6DCE6] bg-white hover:bg-[#FDF0F4]/40 transition-colors shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-semibold text-sm text-[#1E293B]">
                          {inq.vendorName || 'Vendor Inquiry'}
                        </h4>
                        <p className="text-xs text-[#8E406F] font-medium">
                          {inq.serviceName || 'Wedding Service'}
                        </p>
                      </div>
                      <StatusBadge status={inq.status} />
                    </div>

                    {inq.message && (
                      <p className="text-xs text-[#555] bg-[#FDF0F4] p-2.5 rounded-lg border border-[#F6DCE6] mt-2 mb-2 line-clamp-2 italic">
                        "{inq.message}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#737373] pt-1 border-t border-[#F6DCE6]/60">
                      {inq.eventDate && inq.eventDate !== 'N/A' && inq.eventDate !== 'Not specified' && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-[#8E406F]" />
                          Event: <strong className="text-[#333] font-semibold">{inq.eventDate}</strong>
                        </span>
                      )}
                      {inq.guestCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={11} className="text-[#8E406F]" />
                          Guests: <strong className="text-[#333] font-semibold">{inq.guestCount}</strong>
                        </span>
                      )}
                      {inq.budget > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} className="text-[#8E406F]" />
                          Budget: <strong className="text-[#333] font-semibold">LKR {Number(inq.budget).toLocaleString()}</strong>
                        </span>
                      )}
                      {inq.createdAt && (
                        <span className="ml-auto text-[#999]">
                          Sent: {inq.createdAt}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#F6DCE6] px-6 py-4 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Modal: Delete Customer Confirmation
// ============================================================
function DeleteModal({ customer, onConfirm, onClose, isDeleting }) {
  if (!customer) return null;

  const targetName =
    customer.coupleName ||
    customer.coupleNames ||
    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
    'this customer';

  const customerId = customer.customerId || customer.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#FECDCA]">
        {/* Warning Icon & Header */}
        <div className="p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-[#FEF3F2] border-2 border-[#FECDCA] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-[#D92D20]" />
          </div>
          <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-serif">
            Remove Customer Account?
          </h3>
          <p className="text-sm text-[#737373] leading-relaxed mb-4">
            Are you sure you want to permanently remove{' '}
            <strong className="text-[#1E293B] font-semibold">{targetName}</strong> (ID #{customerId})?
            This action cannot be undone and will delete their account and all inquiry records from the database.
          </p>
          <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-xl p-3 text-xs text-[#B42318] text-left flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>This couple registered via the Flutter mobile app. Removing them will revoke their mobile access immediately.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-[#F6DCE6] px-6 py-4 bg-[#FAFAFA] flex gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#D1D5DB] text-[#4B5563] text-sm font-semibold hover:bg-white active:scale-95 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D92D20] text-white text-sm font-semibold hover:bg-[#B91C1C] active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Yes, Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Toast Notification
// ============================================================
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
      {isSuccess ? (
        <CheckCircle2 size={16} className="text-[#1A7F4B] shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-[#D92D20] shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 text-[#999] hover:text-[#555]">
        <X size={14} />
      </button>
    </div>
  );
}

// ============================================================
// Main CustomerManagement Component
// ============================================================
const PAGE_SIZE = 8;

export function CustomerManagement() {
  // ── 1. Fetching Real Data (No hardcoded dummy array) ─────────
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Search & Filter State ────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modals State ─────────────────────────────────────────────
  const [viewTarget, setViewTarget] = useState(null); // { customer, details, loadingDetails, index }
  const [deleteTarget, setDeleteTarget] = useState(null); // customer object
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Toast State ──────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  }, []);

  // ── Fetch Registered Mobile Customers from .NET Backend ──────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithFallback('');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to fetch customers from .NET backend:', err);
      setError(err.message || 'Unable to connect to customer API. Please ensure the backend is running.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── View Details Handler (Uses actual customerId) ────────────
  const handleOpenView = async (customer, index) => {
    const customerId = customer.customerId || customer.id;
    setViewTarget({
      customer,
      details: null,
      loadingDetails: true,
      index,
    });

    try {
      const res = await fetchWithFallback(`/${customerId}`);
      if (res.ok) {
        const details = await res.json();
        setViewTarget(prev => (prev ? { ...prev, details, loadingDetails: false } : null));
      } else {
        setViewTarget(prev => (prev ? { ...prev, details: customer, loadingDetails: false } : null));
      }
    } catch (err) {
      console.warn('Could not fetch single customer details; showing current row data:', err);
      setViewTarget(prev => (prev ? { ...prev, details: customer, loadingDetails: false } : null));
    }
  };

  // ── Remove Customer Handler (Passes actual customerId) ────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const customerId = deleteTarget.customerId || deleteTarget.id;
    const targetName =
      deleteTarget.coupleName ||
      deleteTarget.coupleNames ||
      `${deleteTarget.firstName || ''} ${deleteTarget.lastName || ''}`.trim() ||
      'Customer';

    setIsDeleting(true);

    try {
      const res = await fetchWithFallback(`/${customerId}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Delete failed with HTTP ${res.status}`);
      }

      // Instant local state update removing user from table without full page refresh
      setCustomers(prev => prev.filter(c => (c.customerId || c.id) !== customerId));
      showToast(`Customer "${targetName}" was successfully removed.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to remove customer: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Toggle Customer Status (Active / Inactive) ───────────────
  const handleToggleStatus = async (customer) => {
    const customerId = customer.customerId || customer.id;
    const isCurrentlyActive = (customer.status || 'Active').toLowerCase() === 'active';
    const nextActive = !isCurrentlyActive;
    try {
      const res = await fetchWithFallback(`/${customerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          isActive: nextActive,
          reason: `Admin toggled status to ${nextActive ? 'Active' : 'Inactive'}`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status (HTTP ${res.status})`);
      }

      setCustomers(prev =>
        prev.map(c => {
          if ((c.customerId || c.id) === customerId) {
            return { ...c, status: nextActive ? 'Active' : 'Inactive' };
          }
          return c;
        })
      );
      showToast(`Customer status set to ${nextActive ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      console.error('Status toggle error:', err);
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  // ── Metric Calculations from Real Database Data ──────────────
  const liveMetrics = useMemo(() => {
    return {
      totalCouples: customers.length,
      totalInquiries: customers.reduce((acc, c) => acc + (Number(c.inquiriesSent ?? c.inquiriesCount) || 0), 0),
      inactiveCount: customers.filter(c => c.status === 'Inactive').length,
    };
  }, [customers]);

  // ── Dynamic Search & Filtering on Real Data ──────────────────
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(c => {
      const name = (
        c.coupleName ||
        c.coupleNames ||
        `${c.firstName || ''} ${c.lastName || ''}`
      ).toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || c.phoneNumber || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q);

      const status = c.status || 'Active';
      const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = e => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // ── CSV Export ───────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Couple Name', 'Email', 'Phone', 'Wedding Date', 'Inquiries Sent', 'Status', 'Registered Date'];
    const rows = filteredCustomers.map(c => [
      c.customerId || c.id,
      `"${c.coupleName || c.coupleNames || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A'}"`,
      `"${c.email || 'N/A'}"`,
      `"${c.phone || c.phoneNumber || 'N/A'}"`,
      `"${c.weddingDate || 'N/A'}"`,
      c.inquiriesSent ?? c.inquiriesCount ?? 0,
      c.status || 'Active',
      `"${c.joinDate || 'N/A'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_real_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <AdminPageHeader
        title="Customer Management"
        subtitle="Mobile-registered couples from Neon PostgreSQL database. View activity and manage access."
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCustomers}
              disabled={loading}
              title="Refresh List"
              className="p-2 text-[#8E406F] hover:bg-[#FDF0F4] rounded-lg transition-colors border border-[#F1E5EC] flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredCustomers.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          label="Registered Mobile Couples"
          value={liveMetrics.totalCouples}
          icon={Users}
          iconBg="bg-[#8E406F]/10"
          iconColor="#8E406F"
          valueColor="text-[#333]"
          delta={loading ? 'Loading...' : `${liveMetrics.totalCouples} couples in DB`}
        />
        <AdminStatCard
          label="Total Inquiries Submitted"
          value={liveMetrics.totalInquiries}
          icon={MessageSquare}
          iconBg="bg-emerald-50"
          iconColor="#059669"
          valueColor="text-emerald-600"
          delta="Across all vendors"
          deltaColor="text-emerald-700"
        />
        <AdminStatCard
          label="Inactive Customer Accounts"
          value={liveMetrics.inactiveCount}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="#DC2626"
          valueColor="text-red-500"
          delta="Deactivated couples"
          deltaColor="text-red-600"
        />
      </div>

      {/* ── Error Banner if API Call Failed ── */}
      {error && (
        <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-xl p-4 flex items-center justify-between gap-4 text-sm text-[#B42318]">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-[#D92D20]" />
            <div>
              <p className="font-semibold">Unable to fetch customers from backend API</p>
              <p className="text-xs text-[#737373] mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchCustomers}
            className="px-3.5 py-1.5 rounded-lg bg-[#D92D20] text-white text-xs font-semibold hover:bg-[#B91C1C] transition-all shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ── Data Table Card ── */}
      <AdminTableCard>
        {/* Table Controls (Search & Status Filter) */}
        <AdminTableToolbar
          searchProps={{
            id: 'customer-search-input',
            type: 'search',
            value: searchQuery,
            onChange: handleSearchChange,
            placeholder: 'Search by couple name, email, phone...',
          }}
          filters={
            <div className="flex items-center gap-1.5 text-xs text-[#666]">
              <Filter size={13} className="text-[#8E406F]" />
              <select
                id="customer-status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="py-1.5 px-2.5 text-xs border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:border-[#8E406F]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          }
          actions={
            <span className="text-xs text-[#737373]">
              Showing <strong className="font-semibold text-[#333]">{filteredCustomers.length}</strong> of{' '}
              <strong className="font-semibold text-[#333]">{customers.length}</strong> couples
            </span>
          }
        />

        {/* Data Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHead>Couple Name</AdminTableHead>
            <AdminTableHead>Contact Info</AdminTableHead>
            <AdminTableHead>Wedding Date</AdminTableHead>
            <AdminTableHead align="center">Inquiries Sent</AdminTableHead>
            <AdminTableHead align="center">Status</AdminTableHead>
            <AdminTableHead align="right">Actions</AdminTableHead>
          </AdminTableHeader>

          <AdminTableBody>
            {loading ? (
              // Loading Skeleton Rows matching Admin Management
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200" />
                      <div className="space-y-1.5 flex-1 max-w-[160px]">
                        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="space-y-1.5 max-w-[140px]">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="h-6 w-8 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="h-7 w-20 bg-gray-200 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#737373]">
                  <Users size={32} className="mx-auto mb-2 text-[#ccc]" />
                  <p className="text-sm font-semibold text-[#333]">No customer records found</p>
                  <p className="text-xs text-[#888] mt-1 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'All'
                      ? 'No couples match your search filter.'
                      : 'No registered couples found in the database.'}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((cust, idx) => {
                const customerId = cust.customerId || cust.id;
                const coupleDisplayName =
                  cust.coupleName ||
                  cust.coupleNames ||
                  `${cust.firstName || ''} ${cust.lastName || ''}`.trim() ||
                  'N/A';

                const email = cust.email || '—';
                const phone = cust.phone || cust.phoneNumber || '';
                const weddingDate = cust.weddingDate || '—';
                const inquiriesSent = cust.inquiriesSent ?? cust.inquiriesCount ?? 0;
                const status = cust.status || 'Active';

                const initials = (coupleDisplayName || 'CU')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <AdminTableRow key={customerId}>
                    {/* 1. COUPLE NAME */}
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center shrink-0">
                          <span className="text-[#8E406F] text-xs font-bold">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-[#333] block truncate">
                            {coupleDisplayName}
                          </span>
                          <span className="text-[11px] text-[#888] block truncate">
                            {cust.location || 'Mobile Registered'}
                          </span>
                        </div>
                      </div>
                    </AdminTableCell>

                    {/* 2. CONTACT INFO */}
                    <AdminTableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm text-[#555] truncate max-w-[220px]">
                          {email}
                        </div>
                        {phone && (
                          <div className="font-mono text-xs text-[#888]">
                            {phone}
                          </div>
                        )}
                      </div>
                    </AdminTableCell>

                    {/* 3. WEDDING DATE */}
                    <AdminTableCell className="whitespace-nowrap text-xs text-[#888]">
                      {weddingDate}
                    </AdminTableCell>

                    {/* 4. INQUIRIES SENT */}
                    <AdminTableCell align="center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#8E406F]/10 text-[#8E406F] text-xs font-semibold">
                        {inquiriesSent}
                      </span>
                    </AdminTableCell>

                    {/* 5. STATUS */}
                    <AdminTableCell align="center" className="whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cust)}
                        title={`Click to switch to ${status === 'Active' ? 'Inactive' : 'Active'}`}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all hover:opacity-80 ${
                          status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {status}
                      </button>
                    </AdminTableCell>

                    {/* 6. ACTIONS */}
                    <AdminTableCell align="right" className="whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminIconButton
                          icon={Eye}
                          label="View"
                          title={`View Details for ${coupleDisplayName}`}
                          onClick={() => handleOpenView(cust, idx)}
                        />
                        <AdminIconButton
                          icon={Trash2}
                          label="Remove"
                          variant="danger"
                          title={`Remove ${coupleDisplayName}`}
                          onClick={() => setDeleteTarget(cust)}
                        />
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Standard Pagination Controls */}
        <AdminTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          showingLabel="couples"
        />
      </AdminTableCard>

      {/* ── Modals ── */}
      {viewTarget && (
        <ViewModal
          data={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* ── Toast Notification ── */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default CustomerManagement;
