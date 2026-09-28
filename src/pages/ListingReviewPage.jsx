import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Download, Eye, ToggleLeft, ToggleRight, X,
  MapPin, Mail, Phone, Star, Image, Tag,
  DollarSign, Store, CheckCircle2, AlertCircle, Calendar,
  ThumbsUp, ThumbsDown, Loader2, RefreshCw, Clock, Filter,
} from "lucide-react";
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
} from "../components/common/AdminTableComponents";

const API_BASE = "http://localhost:5131";
const PAGE_SIZE = 7;

const AVATAR_COLORS = ["#8E406F","#4A7C6B","#3B6EA5","#7C5CBF","#C8612F","#2E7D8C","#A05C3C"];
const CATEGORY_COLORS = {
  "Hotel / Venue": { bg:"#EDE9FE", text:"#6D28D9" },
  Photography:    { bg:"#DBEAFE", text:"#1E40AF" },
  Music:          { bg:"#FEF3C7", text:"#92400E" },
  Decorations:    { bg:"#FCE7F3", text:"#9D174D" },
  Catering:       { bg:"#D1FAE5", text:"#065F46" },
};

// ─────────────────────────────────────────────────────
// Utility: get auth header
// ─────────────────────────────────────────────────────
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────
function Avatar({ initials, index, size = "md" }) {
  const bg  = AVATAR_COLORS[(index ?? 0) % AVATAR_COLORS.length];
  const cls = size === "lg" ? "h-14 w-14 text-base" : "h-9 w-9 text-xs";
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center shrink-0 font-bold shadow-sm text-white`}
      style={{ backgroundColor: bg }}
    >
      {initials || "??"}
    </div>
  );
}

function CategoryPill({ category }) {
  const s = CATEGORY_COLORS[category] ?? { bg:"#F3F4F6", text:"#374151" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {category}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    Active:   { dot:"bg-[#1A7F4B]", pill:"bg-[#E6F4EE] text-[#1A7F4B] border-[#A3D9B8]" },
    Inactive: { dot:"bg-[#9CA3AF]", pill:"bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]" },
    Pending:  { dot:"bg-[#D97706]", pill:"bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]" },
    Draft:    { dot:"bg-[#9CA3AF]", pill:"bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]" },
  };
  const c = cfg[status] ?? cfg.Draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-xs text-[#aaa]">-</span>;
  return (
    <div className="flex items-center gap-1">
      <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
      <span className="text-xs font-semibold text-[#333]">{Number(rating).toFixed(1)}</span>
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
        <p className="text-2xl font-bold text-[#1E293B] leading-tight">{value ?? "—"}</p>
        <p className="text-xs text-[#737373] mt-0.5 leading-snug">{label}</p>
        {delta && <p className="text-xs text-[#8E406F] font-medium mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  if (!message) return null;
  const ok = type !== "error";
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
      ok ? "bg-white border-[#A3D9B8] text-[#1A7F4B]" : "bg-white border-[#FECDCA] text-[#D92D20]"}`}>
      {ok ? <CheckCircle2 size={16} className="text-[#1A7F4B] shrink-0" />
          : <AlertCircle   size={16} className="text-[#D92D20] shrink-0" />}
      {message}
      <button onClick={onDismiss} className="ml-2 text-[#999] hover:text-[#555]" aria-label="Dismiss"><X size={14} /></button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Reject Modal
// ─────────────────────────────────────────────────────
function RejectModal({ listing, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  if (!listing) return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1E293B]">Reject Listing</h3>
            <p className="text-sm text-[#737373] mt-0.5">
              Rejecting <span className="font-semibold text-[#8E406F]">{listing.vendorName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#555]"><X size={18} /></button>
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide block mb-1.5">
            Rejection Reason <span className="text-[#999] font-normal normal-case">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Explain why this listing is being rejected..."
            className="w-full px-3 py-2 text-sm border border-[#F6DCE6] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] resize-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D92D20] text-white text-sm font-medium hover:bg-[#b32519] disabled:opacity-60 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
            Confirm Reject
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#F6DCE6] text-[#737373] text-sm font-medium hover:bg-[#FDF0F4] transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// View / Detail Modal (slide-in from right)
// ─────────────────────────────────────────────────────
function ViewModal({ listing, index, onClose, onApprove, onReject, onToggleStatus, actionLoading }) {
  if (!listing) return null;
  const isActive = listing.status === "Active";
  const isPending = listing.status === "Pending" || listing.status === "Draft";

  const cat = listing.categoryDetails;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#8E406F] to-[#73325A] px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar initials={listing.initials} index={index} size="lg" />
            <div>
              <h2 className="text-white font-bold text-lg leading-snug">{listing.vendorName}</h2>
              <div className="flex items-center gap-1 mt-1 text-white/70 text-xs">
                <MapPin size={10} /><span>{listing.city || listing.location || "—"}</span>
              </div>
              <div className="mt-2"><CategoryPill category={listing.category} /></div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">

          {/* Status */}
          <div className="flex items-center justify-between bg-[#FDF0F4] rounded-xl px-4 py-3 border border-[#F6DCE6]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Listing Status</span>
            <StatusBadge status={listing.status} />
          </div>

          {/* Service info */}
          {listing.serviceName && (
            <div>
              <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide mb-1.5">Service Name</p>
              <p className="text-sm font-semibold text-[#1E293B]">{listing.serviceName}</p>
            </div>
          )}

          {/* Description */}
          {(listing.serviceDescription || listing.description) && (
            <div>
              <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide mb-1.5">About This Listing</p>
              <p className="text-sm text-[#555] leading-relaxed">{listing.serviceDescription || listing.description}</p>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Contact Information</p>
            {listing.vendorEmail && (
              <div className="flex items-center gap-3 text-sm text-[#333]">
                <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-[#8E406F]" />
                </div>
                <span className="truncate">{listing.vendorEmail}</span>
              </div>
            )}
            {listing.vendorPhone && (
              <div className="flex items-center gap-3 text-sm text-[#333]">
                <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-[#8E406F]" />
                </div>
                <span>{listing.vendorPhone}</span>
              </div>
            )}
            {listing.address && (
              <div className="flex items-start gap-3 text-sm text-[#333]">
                <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-[#8E406F]" />
                </div>
                <span className="leading-snug">{[listing.address, listing.city, listing.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Price",   value: listing.priceDisplay,         icon: DollarSign },
              { label:"Rating",  value: listing.rating ? `${listing.rating} / 5.0` : "No rating", icon: Star },
              { label:"Listed",  value: listing.listedDate,           icon: Calendar   },
              { label:"Images",  value: `${listing.galleryImages?.length ?? 0} photos`, icon: Image },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-[#8E406F]" />
                  <p className="text-[10px] font-semibold text-[#8E406F] uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">{value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Category-specific details */}
          {cat && (
            <div>
              <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide mb-2">Category Details</p>
              <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl px-4 py-3 space-y-1.5 text-sm">
                {cat.venueType       && <p><span className="font-medium text-[#555]">Venue Type:</span> {cat.venueType}</p>}
                {cat.venueSetting    && <p><span className="font-medium text-[#555]">Setting:</span> {cat.venueSetting}</p>}
                {cat.indoorOutdoor   && <p><span className="font-medium text-[#555]">Indoor/Outdoor:</span> {cat.indoorOutdoor}</p>}
                {cat.minimumGuestCount != null && <p><span className="font-medium text-[#555]">Min Guests:</span> {cat.minimumGuestCount}</p>}
                {cat.cancellationPolicy && <p><span className="font-medium text-[#555]">Cancellation:</span> {cat.cancellationPolicy}</p>}
                {cat.photographyStyle && <p><span className="font-medium text-[#555]">Style:</span> {cat.photographyStyle}</p>}
                {cat.packageHours    != null && <p><span className="font-medium text-[#555]">Coverage:</span> {cat.packageHours}h</p>}
                {cat.musicGenres     && <p><span className="font-medium text-[#555]">Genres:</span> {cat.musicGenres}</p>}
                {cat.performanceType && <p><span className="font-medium text-[#555]">Performance:</span> {cat.performanceType}</p>}
                {cat.decorationStyles && <p><span className="font-medium text-[#555]">Styles:</span> {cat.decorationStyles}</p>}
                {cat.setupTime       && <p><span className="font-medium text-[#555]">Setup Time:</span> {cat.setupTime}</p>}
                {cat.cuisineType     && <p><span className="font-medium text-[#555]">Cuisine:</span> {cat.cuisineType}</p>}
                {cat.guestCapacity   != null && <p><span className="font-medium text-[#555]">Max Guests:</span> {cat.guestCapacity}</p>}
              </div>
            </div>
          )}

          {/* Gallery preview */}
          {listing.galleryImages?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide mb-2">Gallery Preview</p>
              <div className="grid grid-cols-3 gap-1.5">
                {listing.galleryImages.slice(0, 6).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="h-20 w-full object-cover rounded-lg border border-[#F6DCE6]"
                    onError={e => { e.currentTarget.src = ""; e.currentTarget.className += " hidden"; }}
                  />
                ))}
              </div>
              {listing.galleryImages.length > 6 && (
                <p className="text-xs text-[#999] mt-1 text-right">+{listing.galleryImages.length - 6} more</p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#F6DCE6] px-6 py-4 space-y-2.5">
          {/* Approve / Reject — show for Pending/Draft listings */}
          {isPending && (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#059669] text-white text-sm font-medium hover:bg-[#047857] disabled:opacity-60 transition-all active:scale-95"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                Approve
              </button>
              <button
                onClick={onReject}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#D92D20] text-white text-sm font-medium hover:bg-[#b32519] disabled:opacity-60 transition-all active:scale-95"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                Reject
              </button>
            </div>
          )}

          {/* Toggle visibility */}
          <div className="flex gap-2">
            <button
              onClick={onToggleStatus}
              disabled={actionLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-60 ${
                isActive
                  ? "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  : "bg-[#8E406F] text-white hover:bg-[#73325A]"}`}
            >
              {actionLoading
                ? <Loader2 size={15} className="animate-spin" />
                : isActive
                  ? <><ToggleRight size={15} />Set Inactive</>
                  : <><ToggleLeft  size={15} />Set Active</>}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────
const CATEGORIES = ["All", "Hotel / Venue", "Photography", "Music", "Decorations", "Catering"];

export default function ListingReviewPage() {
  // ── State ──────────────────────────────────────────
  const [listings,     setListings]     = useState([]);
  const [metrics,      setMetrics]      = useState({ totalListings: 0, activeListings: 0, pendingReviews: 0, inactiveListings: 0 });
  const [loading,      setLoading]      = useState(true);
  const [metricsLoad,  setMetricsLoad]  = useState(true);
  const [error,        setError]        = useState(null);

  const [searchQuery,  setSearchQuery]  = useState("");
  const [categoryTab,  setCategoryTab]  = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);

  const [viewTarget,   setViewTarget]   = useState(null);      // { listing: ListingDetailDto, index }
  const [detailLoad,   setDetailLoad]   = useState(false);
  const [actionLoad,   setActionLoad]   = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);       // listing for reject modal
  const [toast,        setToast]        = useState({ message:"", type:"success" });

  const searchRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message:"", type:"success" }), 3500);
  }, []);

  const resetPage = () => setCurrentPage(1);

  // ── API: Fetch listings ───────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryTab  !== "All") params.set("category", categoryTab);
      if (searchQuery.trim())     params.set("search",   searchQuery.trim());

      const res = await fetch(`${API_BASE}/api/admin/listing-reviews?${params}`, {
        headers: { ...authHeader(), "Content-Type":"application/json" },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryTab, searchQuery]);

  // ── API: Fetch metrics ────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    setMetricsLoad(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/listing-reviews/metrics`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMetrics({
        totalListings: data.totalListings ?? data.total ?? 0,
        activeListings: data.activeListings ?? data.active ?? 0,
        pendingReviews: data.pendingReviews ?? data.pending ?? 0,
        inactiveListings: data.inactiveListings ?? data.inactive ?? 0,
      });
    } catch {
      // non-critical — keep previous metrics
    } finally {
      setMetricsLoad(false);
    }
  }, []);

  // Mount
  useEffect(() => {
    fetchListings();
    fetchMetrics();
  }, [fetchListings, fetchMetrics]);

  // ── API: View detail ──────────────────────────────────
  const handleViewListing = useCallback(async (listing, idx) => {
    setDetailLoad(true);
    setViewTarget({ listing, index: idx }); // Show modal immediately with summary data
    try {
      const res = await fetch(`${API_BASE}/api/admin/listing-reviews/${listing.listingId}`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const full = await res.json();
        setViewTarget({ listing: full, index: idx });
      }
    } catch {
      // Keep showing summary if detail fetch fails
    } finally {
      setDetailLoad(false);
    }
  }, []);

  // ── API: Approve ──────────────────────────────────────
  const handleApprove = useCallback(async (listingId) => {
    setActionLoad(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/listing-reviews/${listingId}/approve`, {
        method: "PUT",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to approve listing");
      showToast("Listing approved and set to Active ✓");
      // Update local state
      setListings(prev => prev.map(l => l.listingId === listingId ? { ...l, status:"Active" } : l));
      setViewTarget(v => v ? { ...v, listing: { ...v.listing, status:"Active", isVendorApproved:true } } : v);
      fetchMetrics();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoad(false);
    }
  }, [showToast, fetchMetrics]);

  // ── API: Reject ───────────────────────────────────────
  const handleRejectConfirm = useCallback(async (reason) => {
    if (!rejectTarget) return;
    setActionLoad(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/listing-reviews/${rejectTarget.listingId}/reject`, {
        method: "PUT",
        headers: { ...authHeader(), "Content-Type":"application/json" },
        body: JSON.stringify({ status:"Inactive", rejectionReason: reason || null }),
      });
      if (!res.ok) throw new Error("Failed to reject listing");
      showToast("Listing rejected and set to Inactive.");
      setListings(prev => prev.map(l => l.listingId === rejectTarget.listingId ? { ...l, status:"Inactive" } : l));
      setViewTarget(v => v && v.listing.listingId === rejectTarget.listingId
        ? { ...v, listing: { ...v.listing, status:"Inactive" } }
        : v);
      fetchMetrics();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoad(false);
      setRejectTarget(null);
    }
  }, [rejectTarget, showToast, fetchMetrics]);

  // ── API: Toggle status ────────────────────────────────
  const handleToggleStatus = useCallback(async (listing) => {
    setActionLoad(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/listing-reviews/${listing.listingId}/toggle-status`, {
        method: "PUT",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to toggle listing status");
      const data = await res.json();
      const next = data.status;
      showToast(`"${listing.vendorName}" set to ${next}.`);
      setListings(prev => prev.map(l => l.listingId === listing.listingId ? { ...l, status: next } : l));
      setViewTarget(v => v && v.listing.listingId === listing.listingId
        ? { ...v, listing: { ...v.listing, status: next } }
        : v);
      fetchMetrics();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoad(false);
    }
  }, [showToast, fetchMetrics]);

  // ── Pagination (client-side on already-filtered server results) ───────────
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const paginated  = listings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── CSV export ────────────────────────────────────────
  const handleExport = () => {
    const headers = ["ID","Vendor","Category","Location","Price","Status","Listed Date"];
    const rows = listings.map(l =>
      [l.listingId, `"${l.vendorName}"`, l.category, `"${l.location ?? ""}"`, l.priceDisplay, l.status, l.listedDate].join(",")
    );
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "listings.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <AdminPageHeader
        title="Listing Review"
        subtitle="Review, approve, or reject vendor listings across all service categories."
        action={
          <button
            onClick={() => { fetchListings(); fetchMetrics(); }}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#F1E5EC] bg-white text-xs font-semibold text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F] transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Listings"
          value={metricsLoad ? "…" : metrics.totalListings}
          icon={Store}
        />
        <AdminStatCard
          label="Active Listings"
          value={metricsLoad ? "…" : metrics.activeListings}
          subtext="Visible to couples"
          icon={CheckCircle2}
          iconBg="bg-[#D1FAE5]"
          iconColor="text-[#059669]"
        />
        <AdminStatCard
          label="Pending Review"
          value={metricsLoad ? "…" : metrics.pendingReviews}
          subtext="Awaiting approval"
          icon={Clock}
          iconBg="bg-[#FEF3C7]"
          iconColor="text-[#D97706]"
        />
        <AdminStatCard
          label="Inactive Listings"
          value={metricsLoad ? "…" : metrics.inactiveListings}
          subtext="Hidden from couples"
          icon={AlertCircle}
          iconBg="bg-[#FEF3F2]"
          iconColor="text-[#D92D20]"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategoryTab(cat); resetPage(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
              categoryTab === cat
                ? "bg-[#8E406F] text-white border-[#8E406F] shadow-sm"
                : "bg-white text-[#737373] border-[#F1E5EC] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table card */}
      <AdminTableCard>
        {/* Toolbar */}
        <AdminTableToolbar>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            <input
              ref={searchRef}
              id="listing-search"
              type="search"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
              placeholder="Search vendor or location..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAFBFC] border border-[#F1E5EC] rounded-lg text-[#333] placeholder:text-[#aaa] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                id="listing-status-filter"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-[#FAFBFC] border border-[#F1E5EC] rounded-lg text-[#555] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all cursor-pointer font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            </div>

            <button
              id="export-listings-btn"
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#F1E5EC] text-xs font-semibold text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F] transition-all whitespace-nowrap"
            >
              <Download size={14} />Export CSV
            </button>
          </div>
        </AdminTableToolbar>

        {/* Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHead>Vendor</AdminTableHead>
            <AdminTableHead>Category</AdminTableHead>
            <AdminTableHead>Location</AdminTableHead>
            <AdminTableHead>Price</AdminTableHead>
            <AdminTableHead>Rating</AdminTableHead>
            <AdminTableHead>Listed</AdminTableHead>
            <AdminTableHead>Status</AdminTableHead>
            <AdminTableHead align="right">Actions</AdminTableHead>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-[#aaa] text-sm">
                  <Loader2 size={28} className="mx-auto mb-3 text-[#8E406F] animate-spin" />
                  Loading listings…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#D92D20] text-sm">
                  <AlertCircle size={28} className="mx-auto mb-3 text-[#D92D20]" />
                  Failed to load listings: {error}
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                  <Store size={36} className="mx-auto mb-3 text-gray-300" />
                  No vendor listings found in the database.
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                  <Store size={36} className="mx-auto mb-3 text-gray-300" />
                  No listings match your filters.
                </td>
              </tr>
            ) : paginated.map((listing, idx) => {
              const absIdx   = (currentPage - 1) * PAGE_SIZE + idx;
              const isActive = listing.status === "Active";
              return (
                <AdminTableRow key={listing.listingId}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar initials={listing.initials} index={absIdx} />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#333] text-sm truncate">{listing.vendorName}</p>
                        {listing.location && (
                          <div className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell><CategoryPill category={listing.category} /></AdminTableCell>
                  <AdminTableCell className="text-[#555] text-xs">{listing.location || "—"}</AdminTableCell>
                  <AdminTableCell>
                    <span className="flex items-center gap-1 text-[#333] font-medium text-xs">
                      <Tag size={11} className="text-[#8E406F]" />
                      {listing.price ? `Rs. ${Number(listing.price).toLocaleString()}` : (listing.priceDisplay || "Contact for pricing")}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell><StarRating rating={listing.rating} /></AdminTableCell>
                  <AdminTableCell className="text-xs text-[#737373]">{listing.listedDate}</AdminTableCell>
                  <AdminTableCell><StatusBadge status={listing.status} /></AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <AdminIconButton
                        label="View"
                        aria-label={`View ${listing.vendorName}`}
                        onClick={() => handleViewListing(listing, absIdx)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </AdminIconButton>

                      {(listing.status === "Pending" || listing.status === "Draft") && (
                        <AdminIconButton
                          label="Approve"
                          aria-label={`Approve ${listing.vendorName}`}
                          onClick={() => handleApprove(listing.listingId)}
                          title="Approve Listing"
                          className="text-[#059669] hover:bg-[#E6F4EE] hover:border-[#A3D9B8]"
                        >
                          <ThumbsUp size={14} />
                        </AdminIconButton>
                      )}

                      {(listing.status === "Pending" || listing.status === "Draft") && (
                        <AdminIconButton
                          label="Reject"
                          aria-label={`Reject ${listing.vendorName}`}
                          onClick={() => setRejectTarget(listing)}
                          title="Reject Listing"
                          variant="danger"
                        >
                          <ThumbsDown size={14} />
                        </AdminIconButton>
                      )}

                      <AdminIconButton
                        label={isActive ? "Deactivate" : "Activate"}
                        aria-label={`Toggle status for ${listing.vendorName}`}
                        onClick={() => handleToggleStatus(listing)}
                        title={isActive ? "Set Inactive" : "Set Active"}
                        className={isActive ? "text-[#6B7280] hover:bg-[#F3F4F6]" : "text-[#1A7F4B] hover:bg-[#E6F4EE] hover:border-[#6DC49A]"}
                      >
                        {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </AdminIconButton>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination */}
        <AdminTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={listings.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="listings"
        />
      </AdminTableCard>

      {/* View/Detail Modal */}
      {viewTarget && (
        <ViewModal
          listing={viewTarget.listing}
          index={viewTarget.index}
          onClose={() => setViewTarget(null)}
          onApprove={() => handleApprove(viewTarget.listing.listingId)}
          onReject={() => { setRejectTarget(viewTarget.listing); }}
          onToggleStatus={() => handleToggleStatus(viewTarget.listing)}
          actionLoading={actionLoad || detailLoad}
        />
      )}

      {/* Reject confirmation modal */}
      {rejectTarget && (
        <RejectModal
          listing={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
          loading={actionLoad}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message:"", type:"success" })}
      />
    </div>
  );
}
