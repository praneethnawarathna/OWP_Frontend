import React, { useState, useEffect, useMemo } from 'react';
import { getAssetUrl } from '../config/apiConfig';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Mail,
  Phone,
  ExternalLink,
  FileText,
  X,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Paperclip,
  Inbox,
  User,
  HeartHandshake,
} from 'lucide-react';
import { getVendorInquiries, replyToInquiry, updateInquiryStatus } from '../services/inquiryService';

// Format currency
function formatCurrency(amount) {
  if (amount == null || amount === '') return 'Flexible';
  const num = Number(amount);
  if (isNaN(num)) return 'Flexible';
  return `LKR ${num.toLocaleString()}`;
}

// Format date nicely
function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Format relative/full timestamp
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// Generate customer initials
function getInitials(name) {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function VendorInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, REPLIED
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, weddingDate, budgetDesc

  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null); // For details modal
  const [replyInquiry, setReplyInquiry] = useState(null); // For reply modal
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch inquiries from API
  const fetchInquiriesData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await getVendorInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load inquiries. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiriesData();
  }, []);

  // Filtered and sorted inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((inq) => {
        // Status filter
        if (statusFilter === 'PENDING') {
          if (inq.status?.toLowerCase() === 'replied') return false;
        } else if (statusFilter === 'REPLIED') {
          if (inq.status?.toLowerCase() !== 'replied') return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const customer = (inq.customerName || '').toLowerCase();
        const email = (inq.customerEmail || '').toLowerCase();
        const service = (inq.serviceName || '').toLowerCase();
        const message = (inq.message || '').toLowerCase();
        return customer.includes(q) || email.includes(q) || service.includes(q) || message.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'weddingDate') {
          if (!a.weddingDate) return 1;
          if (!b.weddingDate) return -1;
          return new Date(a.weddingDate) - new Date(b.weddingDate);
        }
        if (sortBy === 'budgetDesc') {
          return (Number(b.budget) || 0) - (Number(a.budget) || 0);
        }
        return 0;
      });
  }, [inquiries, statusFilter, searchQuery, sortBy]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status?.toLowerCase() !== 'replied').length;
    const replied = inquiries.filter((i) => i.status?.toLowerCase() === 'replied').length;
    const totalBudget = inquiries.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
    return { total, pending, replied, totalBudget };
  }, [inquiries]);

  // Open Reply Modal
  const handleOpenReplyModal = (inq) => {
    setReplyInquiry(inq);
    setReplyMessage(inq.vendorReply || '');
    setReplyError(null);
  };

  // Submit Reply
  const handleSubmitReply = async (e) => {
    e?.preventDefault();
    if (!replyInquiry) return;
    if (!replyMessage.trim()) {
      setReplyError('Please write a message before sending your response.');
      return;
    }

    try {
      setSubmittingReply(true);
      setReplyError(null);

      const result = await replyToInquiry(replyInquiry.inquiryId, {
        replyMessage: replyMessage.trim(),
      });

      // Update local state
      setInquiries((prev) =>
        prev.map((item) =>
          item.inquiryId === replyInquiry.inquiryId
            ? {
                ...item,
                status: 'Replied',
                vendorReply: replyMessage.trim(),
                repliedAt: result.repliedAt || new Date().toISOString(),
              }
            : item
        )
      );

      // If details modal is open for this inquiry, update it as well
      if (selectedInquiry && selectedInquiry.inquiryId === replyInquiry.inquiryId) {
        setSelectedInquiry((prev) => ({
          ...prev,
          status: 'Replied',
          vendorReply: replyMessage.trim(),
          repliedAt: result.repliedAt || new Date().toISOString(),
        }));
      }

      showToast(`Reply sent successfully to ${replyInquiry.customerName}!`);
      setReplyInquiry(null);
      setReplyMessage('');
    } catch (err) {
      setReplyError(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Quick canned template inserters
  const applyTemplate = (templateType) => {
    if (!replyInquiry) return;
    const clientName = replyInquiry.customerName?.split(' ')[0] || 'Client';
    const serviceName = replyInquiry.serviceName || 'our services';
    const dateStr = formatDate(replyInquiry.weddingDate);
    const guests = replyInquiry.guestCount ? `for ${replyInquiry.guestCount} guests` : '';

    if (templateType === 'AVAILABLE') {
      setReplyMessage(
        `Hi ${clientName},\n\nThank you for reaching out to us! We are thrilled to confirm that we currently have availability for your wedding date on ${dateStr}.\n\nWe would love to tailor our ${serviceName} ${guests} to match your vision perfectly. Would you be available for a brief call or video consultation this week to discuss your requirements in detail?\n\nWarm regards,\nOleena Vendor Team`
      );
    } else if (templateType === 'QUOTE') {
      setReplyMessage(
        `Dear ${clientName},\n\nThank you for considering us for your wedding! Based on your requested date (${dateStr}) and estimated guest count, we have packages starting from ${formatCurrency(replyInquiry.budget)} that include full setup and bespoke coordination.\n\nPlease let us know if you'd like us to share our detailed brochure and pricing breakdown.\n\nBest wishes,\nOleena Vendor Team`
      );
    } else if (templateType === 'MORE_INFO') {
      setReplyMessage(
        `Hi ${clientName},\n\nThank you for your inquiry regarding ${serviceName}! To ensure we put together the most accurate quote and schedule for your special day on ${dateStr}, could you please share a few more details regarding your preferred venue and timeline?\n\nLooking forward to creating something magical for your celebration!\n\nBest regards,\nOleena Vendor Team`
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 pb-16 px-1">
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-[#FDF0F4] text-[#8E406F] border-[#F1E5EC]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-[#8E406F] shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] border border-[#F1E5EC] shadow-sm">
            <MessageSquare size={22} className="text-[#8E406F]" aria-hidden="true" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Client Inquiries
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage prospective couple requests, inspect wedding details, and send personalized replies.
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInquiriesData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F1E5EC] bg-white text-sm font-medium text-[#475569] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]/30 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#8E406F]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Summary Metrics Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] p-5 shadow-sm hover:border-[#8E406F]/40 transition">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold uppercase tracking-wider">
            <span>Total Inquiries</span>
            <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#F1E5EC] text-[#64748B]">
              <Inbox size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1E293B] mt-3">
            {loading ? '—' : metrics.total}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">Direct inquiries received</p>
        </div>

        {/* Pending Action */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold uppercase tracking-wider">
            <span>Awaiting Reply</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-700 mt-3">
            {loading ? '—' : metrics.pending}
          </p>
          <p className="text-xs text-amber-600/80 mt-1">Requires your prompt attention</p>
        </div>

        {/* Replied / Responded */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <span>Replied</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-3">
            {loading ? '—' : metrics.replied}
          </p>
          <p className="text-xs text-emerald-600/80 mt-1">Answers sent to prospective couples</p>
        </div>

        {/* Total Inquired Budget */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] p-5 shadow-sm hover:border-[#8E406F]/40 transition">
          <div className="flex items-center justify-between text-[#8E406F] text-xs font-semibold uppercase tracking-wider">
            <span>Total Value</span>
            <div className="p-2 rounded-xl bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#1E293B] mt-3">
            {loading ? '—' : formatCurrency(metrics.totalBudget)}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">Estimated customer budgets</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl border border-[#F1E5EC] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-[#F8FAFC] border border-[#F1E5EC] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#8E406F] font-bold shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              All Inquiries ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-amber-700 font-bold shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>Pending</span>
              {metrics.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  {metrics.pending}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REPLIED')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'REPLIED'
                  ? 'bg-white text-emerald-700 font-bold shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>Replied</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {metrics.replied}
              </span>
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-1 sm:flex-initial flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                placeholder="Search couples, services, messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-[#F8FAFC] border border-[#F1E5EC] rounded-xl text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#F1E5EC] rounded-xl pl-3.5 pr-8 py-2 text-xs font-medium text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="weddingDate">Sort: Wedding Date</option>
                <option value="budgetDesc">Sort: Highest Budget</option>
              </select>
              <ArrowUpDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Inquiries List / Table ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#F1E5EC] p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-[#475569]">Loading your client inquiries...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <AlertCircle size={24} className="text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-800">Failed to load inquiries</h3>
          <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchInquiriesData()}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F1E5EC] p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F]">
            <HeartHandshake size={32} />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchQuery || statusFilter !== 'ALL'
                ? 'No matching inquiries found'
                : 'No inquiries yet'}
            </h3>
            <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or switching to a different status filter.'
                : 'When prospective couples view your listings and submit questions or package requests, they will appear right here.'}
            </p>
          </div>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl border border-[#F1E5EC] text-xs font-semibold text-[#8E406F] bg-[#FDF0F4] hover:bg-[#F9E2EE] transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1E5EC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-5">Client Name</th>
                  <th className="py-3.5 px-5">Requested Service</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Est. Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5EC] text-sm text-[#1E293B]">
                {filteredInquiries.map((inq) => {
                  const isReplied = inq.status?.toLowerCase() === 'replied';
                  return (
                    <tr
                      key={inq.inquiryId}
                      className="hover:bg-[#FDF0F4]/30 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {inq.customerAvatar ? (
                            <img
                              src={getAssetUrl(inq.customerAvatar)}
                              alt={inq.customerName}
                              className="h-10 w-10 rounded-full object-cover border border-[#F1E5EC]"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {getInitials(inq.customerName)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#1E293B] group-hover:text-[#8E406F] transition-colors">
                              {inq.customerName || 'Prospective Couple'}
                            </p>
                            <p className="text-xs text-[#64748B]">{inq.customerEmail || 'No email'}</p>
                            {inq.customerPhone && (
                              <p className="text-[11px] text-[#94A3B8]">{inq.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service / Listing Requested */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          {inq.serviceImage && (
                            <img
                              src={getAssetUrl(inq.serviceImage)}
                              alt={inq.serviceName}
                              className="h-9 w-9 rounded-lg object-cover border border-[#F1E5EC] shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#1E293B] line-clamp-1">
                              {inq.serviceName || 'General Inquiry'}
                            </p>
                            {inq.categoryName && (
                              <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#8E406F] bg-[#FDF0F4] px-2 py-0.2 rounded-md">
                                {inq.categoryName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Event Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                          <Calendar size={13} className="text-[#8E406F] shrink-0" />
                          <span>{formatDate(inq.weddingDate)}</span>
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                          <Users size={13} className="text-[#94A3B8] shrink-0" />
                          <span>{inq.guestCount ? `${inq.guestCount} guests` : '—'}</span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-xs text-[#1E293B]">
                        {formatCurrency(inq.budget)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isReplied ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Replied</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock size={12} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-2 rounded-xl text-[#64748B] hover:text-[#8E406F] hover:bg-[#FDF0F4] border border-transparent hover:border-[#F1E5EC] transition"
                            title="View inquiry details"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReplyModal(inq)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                              isReplied
                                ? 'bg-white border border-[#F1E5EC] text-[#475569] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
                                : 'bg-[#8E406F] text-white hover:bg-[#73325A] active:scale-95'
                            }`}
                          >
                            <Send size={12} />
                            <span>{isReplied ? 'Update' : 'Reply'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail Modal / Drawer ── */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedInquiry(null)}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F1E5EC] z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1E5EC] bg-[#FDF0F4]/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-bold text-[#1E293B]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Inquiry Details
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Received on {formatDateTime(selectedInquiry.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 rounded-xl text-[#94A3B8] hover:text-[#1E293B] hover:bg-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Couple Card & Contact */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC]">
                  <div className="flex items-center gap-3">
                    {selectedInquiry.customerAvatar ? (
                      <img
                        src={getAssetUrl(selectedInquiry.customerAvatar)}
                        alt={selectedInquiry.customerName}
                        className="h-12 w-12 rounded-full object-cover border border-[#F1E5EC]"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F] flex items-center justify-center font-bold text-sm">
                        {getInitials(selectedInquiry.customerName)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#1E293B] text-base">
                        {selectedInquiry.customerName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#64748B]">
                        {selectedInquiry.customerEmail && (
                          <a
                            href={`mailto:${selectedInquiry.customerEmail}`}
                            className="flex items-center gap-1 hover:text-[#8E406F] transition"
                          >
                            <Mail size={12} />
                            <span>{selectedInquiry.customerEmail}</span>
                          </a>
                        )}
                        {selectedInquiry.customerPhone && (
                          <a
                            href={`tel:${selectedInquiry.customerPhone}`}
                            className="flex items-center gap-1 hover:text-[#8E406F] transition"
                          >
                            <Phone size={12} />
                            <span>{selectedInquiry.customerPhone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {selectedInquiry.status?.toLowerCase() === 'replied' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} />
                        <span>Replied</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock size={13} />
                        <span>Pending Response</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Event & Service Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
                      <Calendar size={13} className="text-[#8E406F]" />
                      <span>Wedding Date</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1E293B] mt-1.5">
                      {formatDate(selectedInquiry.weddingDate)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
                      <Users size={13} className="text-[#8E406F]" />
                      <span>Guest Count</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1E293B] mt-1.5">
                      {selectedInquiry.guestCount ? `${selectedInquiry.guestCount} guests` : 'Not specified'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
                      <DollarSign size={13} className="text-[#8E406F]" />
                      <span>Est. Budget</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1E293B] mt-1.5">
                      {formatCurrency(selectedInquiry.budget)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
                      <Sparkles size={13} className="text-[#8E406F]" />
                      <span>Listing</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1E293B] mt-1.5 truncate" title={selectedInquiry.serviceName}>
                      {selectedInquiry.serviceName || 'General Inquiry'}
                    </p>
                  </div>
                </div>

                {/* Customer Message */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                    Client's Message
                  </h4>
                  <div className="p-4 rounded-2xl bg-[#FDF0F4]/40 border border-[#F1E5EC] text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message || 'No specific message was provided with this inquiry.'}
                  </div>
                </div>

                {/* Attachment if any */}
                {selectedInquiry.attachmentUrl && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      Inquiry Attachment
                    </h4>
                    <a
                      href={getAssetUrl(selectedInquiry.attachmentUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F1E5EC] bg-[#F8FAFC] text-xs font-semibold text-[#8E406F] hover:bg-[#FDF0F4] transition"
                    >
                      <Paperclip size={14} />
                      <span>View Attached File / Photo</span>
                      <ExternalLink size={12} className="ml-1 opacity-70" />
                    </a>
                  </div>
                )}

                {/* Existing Vendor Reply Card */}
                {selectedInquiry.vendorReply && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Your Reply</span>
                      </span>
                      <span className="text-emerald-600/80">
                        {formatDateTime(selectedInquiry.repliedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap">
                      {selectedInquiry.vendorReply}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F1E5EC] bg-white rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl border border-[#F1E5EC] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReplyModal(selectedInquiry);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition shadow-sm"
                >
                  <Send size={14} />
                  <span>
                    {selectedInquiry.status?.toLowerCase() === 'replied' ? 'Edit Response' : 'Reply to Couple'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reply Modal Form ── */}
      <AnimatePresence>
        {replyInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => !submittingReply && setReplyInquiry(null)}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#F1E5EC] z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1E5EC] bg-[#FDF0F4]/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] border border-[#F1E5EC] text-[#8E406F]">
                    <Send size={18} />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-bold text-[#1E293B]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Reply to Inquiry
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Responding to <strong className="text-[#1E293B]">{replyInquiry.customerName}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submittingReply}
                  onClick={() => setReplyInquiry(null)}
                  className="p-2 rounded-xl text-[#94A3B8] hover:text-[#1E293B] hover:bg-white transition disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitReply}>
                <div className="p-6 space-y-4">
                  {/* Context Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1E5EC] text-xs text-[#475569] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#1E293B]">Requested:</span>{' '}
                      {replyInquiry.serviceName || 'Wedding Service'}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1E293B]">Date:</span>{' '}
                      {formatDate(replyInquiry.weddingDate)}
                    </div>
                  </div>

                  {/* Canned Template Buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Quick Templates
                      </label>
                      <span className="text-[11px] text-[#94A3B8]">Click to populate</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyTemplate('AVAILABLE')}
                        className="px-3 py-1.5 rounded-xl border border-[#F1E5EC] bg-white hover:bg-[#FDF0F4] text-xs font-medium text-[#8E406F] transition"
                      >
                        ✨ Availability Confirmed
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('QUOTE')}
                        className="px-3 py-1.5 rounded-xl border border-[#F1E5EC] bg-white hover:bg-[#FDF0F4] text-xs font-medium text-[#8E406F] transition"
                      >
                        📄 Custom Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('MORE_INFO')}
                        className="px-3 py-1.5 rounded-xl border border-[#F1E5EC] bg-white hover:bg-[#FDF0F4] text-xs font-medium text-[#8E406F] transition"
                      >
                        💬 Request Consultation
                      </button>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Your Message
                      </label>
                      <span
                        className={`text-xs ${
                          replyMessage.length > 2000 ? 'text-rose-600 font-bold' : 'text-[#94A3B8]'
                        }`}
                      >
                        {replyMessage.length} / 2000
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={replyMessage}
                      maxLength={2000}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your personalized response to the couple..."
                      className="w-full p-4 text-sm text-[#1E293B] bg-white border border-[#F1E5EC] rounded-2xl placeholder-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition"
                      autoFocus
                    />
                  </div>

                  {/* Error banner */}
                  {replyError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{replyError}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F1E5EC] bg-[#F8FAFC]">
                  <button
                    type="button"
                    disabled={submittingReply}
                    onClick={() => setReplyInquiry(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#F1E5EC] text-sm font-semibold text-[#64748B] hover:bg-white transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submittingReply ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Sending Reply...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
