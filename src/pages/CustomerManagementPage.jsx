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
} from 'lucide-react';

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
    <div className="max-w-[1400px] w-full mx-auto space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Customer Management
          </h1>
          <p className="text-sm text-[#8E406F] mt-1 font-medium">
            Mobile-registered couples from Neon PostgreSQL database. View activity and manage access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            title="Refresh List"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#F6DCE6] bg-[#FDF0F4] text-[#8E406F] text-xs font-semibold hover:bg-[#F6DCE6] active:scale-95 transition-all shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#8E406F] text-[#8E406F] text-xs font-semibold hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          iconBg="#F6DCE6"
          iconColor="#8E406F"
          label="Registered Mobile Couples"
          value={liveMetrics.totalCouples}
          delta={loading ? 'Loading...' : `${liveMetrics.totalCouples} couples in DB`}
        />
        <MetricCard
          icon={MessageSquare}
          iconBg="#E6F4EE"
          iconColor="#1A7F4B"
          label="Total Inquiries Submitted"
          value={liveMetrics.totalInquiries}
          delta="Across all vendors"
        />
        <MetricCard
          icon={AlertTriangle}
          iconBg="#FEF3F2"
          iconColor="#D92D20"
          label="Inactive Customer Accounts"
          value={liveMetrics.inactiveCount}
          delta="Deactivated couples"
        />
      </div>

      {/* ── Error Banner if API Call Failed ── */}
      {error && (
        <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-2xl p-4 flex items-center justify-between gap-4 text-sm text-[#B42318]">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-[#D92D20]" />
            <div>
              <p className="font-semibold">Unable to fetch customers from backend API</p>
              <p className="text-xs text-[#737373] mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchCustomers}
            className="px-3.5 py-1.5 rounded-xl bg-[#D92D20] text-white text-xs font-semibold hover:bg-[#B91C1C] transition-all shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ── Data Table Card ── */}
      <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl shadow-sm overflow-hidden">
        {/* Table Controls (Search & Status Filter) */}
        <div className="px-5 py-4 border-b border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              <input
                id="customer-search-input"
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by couple name, email, phone..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#F6DCE6] rounded-xl text-[#1E293B] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/25 focus:border-[#8E406F] transition-all"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                id="customer-status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full appearance-none pl-3.5 pr-8 py-2 text-sm bg-white border border-[#F6DCE6] rounded-xl text-[#333] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E406F]/25 focus:border-[#8E406F] transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-[#737373] self-end sm:self-center font-medium">
            Showing <strong className="text-[#1E293B]">{filteredCustomers.length}</strong> of{' '}
            <strong className="text-[#1E293B]">{customers.length}</strong> registered couples
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F6DCE6] bg-[#FAE8F0]">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider">
                  COUPLE NAME
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider">
                  CONTACT INFO
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider whitespace-nowrap">
                  WEDDING DATE
                </th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider whitespace-nowrap">
                  INQUIRIES SENT
                </th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-[#8E406F] uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F6DCE6] bg-white">
              {loading ? (
                // Elegant Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-200" />
                        <div className="space-y-1.5 flex-1 max-w-[160px]">
                          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5 max-w-[140px]">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="h-6 w-8 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-7 w-28 bg-gray-200 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#737373]">
                    <Users size={36} className="mx-auto mb-2 text-[#e8c4d8]" />
                    <p className="text-base font-semibold text-[#1E293B]">No customer records found</p>
                    <p className="text-xs text-[#888] mt-1 max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No couples match your search filter.'
                        : 'No registered couples found in the database. When mobile app users sign up, they will appear here.'}
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

                  const email = cust.email || 'N/A';
                  const phone = cust.phone || cust.phoneNumber || 'N/A';
                  const weddingDate = cust.weddingDate || 'N/A';
                  const inquiriesSent = cust.inquiriesSent ?? cust.inquiriesCount ?? 0;
                  const status = cust.status || 'Active';

                  return (
                    <tr
                      key={customerId}
                      className="hover:bg-[#FDF0F4]/60 transition-colors"
                    >
                      {/* 1. COUPLE NAME */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={cust.avatarInitials}
                            name={coupleDisplayName}
                            index={idx}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1E293B] text-sm leading-snug truncate">
                              {coupleDisplayName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
                              <MapPin size={11} className="shrink-0 text-[#8E406F]" />
                              <span className="truncate">{cust.location || 'Mobile App User'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CONTACT INFO */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-[#1E293B] font-medium">
                            <Mail size={12} className="text-[#8E406F] shrink-0" />
                            <span className="truncate max-w-[200px]">{email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                            <Phone size={12} className="text-[#8E406F] shrink-0" />
                            <span>{phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. WEDDING DATE */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E293B]">
                          <Calendar size={13} className="text-[#8E406F] shrink-0" />
                          <span>{weddingDate}</span>
                        </div>
                      </td>

                      {/* 4. INQUIRIES SENT */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#F6DCE6] text-[#8E406F] text-xs font-bold">
                          {inquiriesSent}
                        </span>
                      </td>

                      {/* 5. STATUS */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* 6. ACTIONS (Tied to real customerId) */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenView(cust, idx)}
                            title={`View Details for ${coupleDisplayName} (#${customerId})`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F6DCE6] bg-[#FDF0F4] text-[#8E406F] text-xs font-semibold hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all shadow-xs"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* Remove Button (Red / Warning Style) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cust)}
                            title={`Remove ${coupleDisplayName} (#${customerId})`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20] text-xs font-semibold hover:bg-[#D92D20] hover:text-white active:scale-95 transition-all shadow-xs"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
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

        {/* Pagination Controls */}
        <div className="px-5 py-3.5 border-t border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <p className="text-xs text-[#737373]">
            Showing{' '}
            <span className="font-semibold text-[#1E293B]">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#1E293B]">
              {Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)}
            </span>{' '}
            of <span className="font-semibold text-[#1E293B]">{filteredCustomers.length}</span> couples
          </p>

          <div className="flex items-center gap-1 self-end sm:self-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center h-8 w-8 rounded-lg text-xs font-bold transition-all border ${
                  page === currentPage
                    ? 'bg-[#8E406F] text-white border-[#8E406F] shadow-xs'
                    : 'border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

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
