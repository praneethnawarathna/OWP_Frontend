import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Star,
  X,
  Send,
  Paperclip,
  Package,
  Users,
  FileText,
  Sparkles,
  ShieldCheck,
  Layers,
  Store,
  BarChart3,
  Image as ImageIcon,
  Tag,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import { fetchNotificationsApi } from '../services/notificationsApi';

// ============================================================
// HELPERS
// ============================================================
function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Price on request';
  return `Rs. ${Number(price).toLocaleString('en-LK')}`;
}

export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  return `http://localhost:5131${url.startsWith('/') ? '' : '/'}${url}`;
}

function categoryBadgeVariant(cat) {
  const map = {
    'Hotel / Venue': 'bg-purple-50 text-purple-700 border-purple-200',
    Hotel: 'bg-purple-50 text-purple-700 border-purple-200',
    Venue: 'bg-purple-50 text-purple-700 border-purple-200',
    Photography: 'bg-rose-50 text-rose-700 border-rose-200',
    Videography: 'bg-rose-50 text-rose-700 border-rose-200',
    Decorations: 'bg-amber-50 text-amber-700 border-amber-200',
    Catering: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Music: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return map[cat] || 'bg-[#FDF0F4] text-[#8E406F] border-[#E8C4D8]';
}

// ============================================================
// MODAL BACKDROP + CONTAINER
// ============================================================
function Modal({ onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-[#F1E5EC] pointer-events-auto max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-[#F1E5EC]">
      <div>
        <h2
          className="text-base font-bold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[#737373] mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-[#999] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ============================================================
// VIEW INQUIRY MODAL
// ============================================================
function ViewInquiryModal({ inquiry, onClose, onReply }) {
  if (!inquiry) return null;
  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title="Inquiry Details"
        subtitle={`From ${inquiry.customer}`}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <span className="font-semibold shrink-0">Sample Preview:</span>
          <span>Inquiry messaging is under development. This simulates the upcoming inquiry review workflow.</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${inquiry.avatarBg} ${inquiry.avatarText}`}
          >
            {inquiry.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E293B]">{inquiry.customer}</p>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inquiry.statusStyle}`}
            >
              {inquiry.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Service Requested', value: inquiry.service, icon: Package },
            { label: 'Event Date', value: inquiry.eventDate, icon: CalendarDays },
            { label: 'Received', value: inquiry.received, icon: Clock3 },
            { label: 'Guests (est.)', value: inquiry.guests ?? 'Not specified', icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#F1E5EC]">
              <div className="flex items-center gap-1.5 text-[#999] text-[10px] font-semibold uppercase tracking-wide mb-1">
                <Icon size={11} />
                {label}
              </div>
              <p className="text-[#1E293B] text-xs font-medium">{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wider mb-2">
            Inquiry Message
          </p>
          <div className="bg-[#FDF0F4]/50 border border-[#F1E5EC] rounded-xl p-4 text-sm text-[#475569] leading-relaxed">
            {inquiry.message ??
              `Hi! We are ${inquiry.customer} and we're interested in your ${inquiry.service} for our wedding on ${inquiry.eventDate}. Could you please share your packages and availability? Looking forward to hearing from you!`}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-[#F1E5EC] flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-[#F1E5EC] text-[#555] text-sm font-medium hover:border-[#8E406F]/30 transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => { onClose(); onReply(inquiry); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm"
        >
          <MessageCircle size={14} />
          Reply
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// REPLY MODAL
// ============================================================
function ReplyModal({ inquiry, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!inquiry) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      onSend(inquiry.id);
      setSending(false);
      onClose();
    }, 600);
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader
        title="Reply to Inquiry (Preview)"
        subtitle={`Replying to ${inquiry.customer} · ${inquiry.service}`}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <span className="font-semibold shrink-0">Sample Preview:</span>
          <span>Inquiry messaging is under development. This modal demonstrates the upcoming vendor response capability.</span>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#F1E5EC] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#999] font-semibold shrink-0">To:</span>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${inquiry.avatarBg} ${inquiry.avatarText}`}
            >
              {inquiry.initials}
            </div>
            <span className="text-xs font-medium text-[#1E293B]">{inquiry.customer}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#F1E5EC] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#999] font-semibold shrink-0">Re:</span>
          <span className="text-xs text-[#1E293B]">{inquiry.service} — {inquiry.eventDate}</span>
        </div>

        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi ${inquiry.customer.split(' ')[0]}! Thank you for reaching out to us regarding our ${inquiry.service}...`}
          className="w-full border border-[#F1E5EC] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#ccc] resize-none focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition"
        />

        <button
          type="button"
          className="flex items-center gap-2 text-xs text-[#8E406F] font-medium hover:text-[#73325A] transition-colors"
        >
          <Paperclip size={13} />
          Attach a file (brochure, package PDF…)
        </button>
      </div>

      <div className="px-6 py-4 border-t border-[#F1E5EC] flex justify-between items-center">
        <span className="text-[10px] text-[#999]">
          {message.length} / 1000 characters
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#F1E5EC] text-[#555] text-sm font-medium hover:border-[#8E406F]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={13} />
            )}
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================
function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <article
      aria-label={`${stat.label}: ${stat.value}`}
      className="group relative overflow-hidden rounded-2xl border border-[#F1E5EC] bg-[#FDF0F4] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#737373]">{stat.label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8E406F] shadow-sm border border-[#F1E5EC] transition-transform group-hover:scale-110">
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <p
        className="text-3xl sm:text-4xl font-bold text-[#1E293B] leading-none"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {stat.value}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {stat.isRating ? (
          <span className="text-[#737373] font-medium flex items-center gap-1">
            <Star size={12} className="fill-[#8E406F] text-[#8E406F]" aria-hidden="true" />
            {stat.subtext}
          </span>
        ) : stat.trendPositive ? (
          <span className="inline-flex items-center gap-0.5 font-medium text-[#8E406F]">
            <ArrowUpRight size={13} aria-hidden="true" />
            {stat.subtext}
          </span>
        ) : (
          <span className="text-[#737373] font-medium">{stat.subtext}</span>
        )}
      </div>

      <div className="mt-3 h-[2px] w-10 rounded-full bg-[#8E406F]/30 transition-all group-hover:w-16" />
    </article>
  );
}

// ============================================================
// ACTIVE LISTINGS SECTION
// ============================================================
function ActiveListingsSection({ listings = [], onNavigate, onEditListing }) {
  const activeListings = useMemo(() => {
    return listings.filter((l) => {
      const st = (l.status || '').toLowerCase();
      return st === 'active' || st === 'published';
    });
  }, [listings]);

  const draftCount = useMemo(() => {
    return listings.filter((l) => (l.status || '').toLowerCase() === 'draft').length;
  }, [listings]);

  return (
    <section aria-label="Active Listings" className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1E5EC] px-6 py-4 gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Package size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Active Listings
            </h2>
            <p className="text-xs text-[#737373]">Live services visible to couples on Oleena Marketplace</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeListings.length} {activeListings.length === 1 ? 'Live Listing' : 'Live Listings'}
          </span>
          {draftCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              {draftCount} {draftCount === 1 ? 'Draft' : 'Drafts'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                window.history.pushState({}, '', '/vendor-listing-editor');
                onNavigate('vendor-listing-editor');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#8E406F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
          >
            <Plus size={13} />
            <span>Add New Listing</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('vendor-services')}
            className="group flex items-center gap-1 rounded-xl border border-[#F1E5EC] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#8E406F] transition hover:bg-[#FDF0F4]"
          >
            <span>Manage Listings</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      <div className="p-6">
        {activeListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8DDE4] bg-[#FDF0F4]/30 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#F1E5EC] text-[#8E406F] shadow-sm mb-3">
              <Package size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              No Active Listings Found
            </h3>
            <p className="mt-1 text-xs text-[#737373] max-w-md mx-auto">
              {draftCount > 0
                ? `You have ${draftCount} draft ${draftCount === 1 ? 'listing' : 'listings'} waiting to be published. Publish your listings now to make them visible to couples planning their wedding!`
                : 'Publish your wedding service packages to start receiving inquiries and bookings from couples on Oleena.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {draftCount > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate?.('vendor-services')}
                  className="rounded-xl border border-[#8E406F] px-4 py-2 text-xs font-semibold text-[#8E406F] hover:bg-[#FDF0F4] transition"
                >
                  View Drafts ({draftCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    window.history.pushState({}, '', '/vendor-listing-editor');
                    onNavigate('vendor-listing-editor');
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#8E406F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#73325A] transition"
              >
                <Plus size={14} />
                Create New Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeListings.slice(0, 6).map((listing) => {
              const coverUrl = resolveImageUrl(listing.coverImageUrl || listing.images?.[0]?.imageUrl);
              const targetId = listing.serviceId || listing.id;

              return (
                <div
                  key={targetId}
                  className="group relative flex flex-col rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#8E406F]/40"
                >
                  {/* Image Cover */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: coverUrl ? 'none' : 'flex' }}
                      className="h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDF0F4] to-slate-100 text-[#8E406F]/50"
                    >
                      <ImageIcon size={28} />
                      <span className="text-[10px] font-medium text-[#999] mt-1">Oleena Service</span>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border backdrop-blur-xs shadow-xs ${categoryBadgeVariant(listing.category)}`}>
                        <Tag size={10} />
                        {listing.category || 'Wedding Service'}
                      </span>
                    </div>

                    {/* Live Status */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-semibold shadow-xs">
                        <CheckCircle2 size={10} />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-bold text-[#1E293B] text-sm line-clamp-1 group-hover:text-[#8E406F] transition-colors">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[#8E406F]">
                      {formatPrice(listing.price)}
                    </p>
                    <p className="mt-1.5 text-xs text-[#737373] line-clamp-2 leading-relaxed flex-1">
                      {listing.description || 'Verified wedding service package on Oleena Marketplace.'}
                    </p>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-[#F1E5EC] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onEditListing(listing)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E8DDE4] bg-white py-1.5 text-xs font-semibold text-[#8E406F] transition hover:bg-[#FDF0F4] hover:border-[#8E406F]/40 active:scale-95"
                      >
                        <Pencil size={12} />
                        Edit Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate?.('vendor-services')}
                        className="rounded-xl border border-[#F1E5EC] p-2 text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition"
                        title="View in catalog"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// RECENT NOTIFICATIONS WIDGET
// ============================================================
function RecentNotificationsWidget({ notifications = [], onNavigate, onSelectNotification }) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <section aria-label="Recent notifications" className="flex flex-col h-full rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#F1E5EC] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Bell size={17} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Notifications & Notices
            </h2>
            <p className="text-xs text-[#737373]">Listing reviews, approvals, and platform alerts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('vendor-notifications')}
          className="group flex items-center gap-1 text-xs font-semibold text-[#8E406F] hover:text-[#73325A] transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-[#FDF0F4] p-3 space-y-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#999]">
            <p className="font-medium text-[#737373]">No recent notifications</p>
            <p className="mt-1 text-[11px]">System updates and inquiry alerts will appear here.</p>
          </div>
        ) : (
          notifications.slice(0, 4).map((n) => {
            const isUnread = !n.isRead;
            const nid = n.notificationId ?? n.id ?? n.NotificationId;

            return (
              <div
                key={nid}
                onClick={() => onSelectNotification(n)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isUnread ? 'bg-[#FDF0F4]/40 hover:bg-[#FDF0F4]/70' : 'hover:bg-[#FAFAFA]'
                }`}
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isUnread ? 'bg-[#8E406F] text-white shadow-xs' : 'bg-slate-100 text-[#737373]'
                }`}>
                  <Bell size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-[#1E293B]' : 'font-medium text-[#555]'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-[#aaa] shrink-0">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// ============================================================
// PROFILE & VERIFICATION STATUS WIDGET
// ============================================================
function ProfileStatusWidget({
  businessName = 'Oleena Florals',
  businessType = 'Floral & Decor',
  location = 'Colombo, Sri Lanka',
  email = '',
  phone = '',
  isApproved = true,
  averageRating = '4.8',
  reviewCount = 0,
  onNavigate,
}) {
  return (
    <section aria-label="Vendor profile status" className="flex flex-col justify-between h-full rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] border border-[#F1E5EC] shadow-sm">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {businessName}
              </h2>
              <p className="text-xs text-[#737373]">{businessType}</p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            isApproved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>
            <CheckCircle2 size={12} />
            {isApproved ? 'Verified Vendor' : 'Pending Verification'}
          </span>
        </div>

        <div className="space-y-2.5 rounded-xl bg-[#FDF0F4]/40 border border-[#F1E5EC] p-4 text-xs text-[#555]">
          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#8E406F]" /> Location:
            </span>
            <span className="font-medium text-[#1E293B] truncate max-w-[200px]">{location}</span>
          </div>

          {phone && (
            <div className="flex items-center justify-between">
              <span className="text-[#737373] flex items-center gap-1.5">
                <Phone size={13} className="text-[#8E406F]" /> Contact:
              </span>
              <span className="font-medium text-[#1E293B]">{phone}</span>
            </div>
          )}

          {email && (
            <div className="flex items-center justify-between">
              <span className="text-[#737373] flex items-center gap-1.5">
                <Mail size={13} className="text-[#8E406F]" /> Email:
              </span>
              <span className="font-medium text-[#1E293B] truncate max-w-[200px]">{email}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <Star size={13} className="text-[#8E406F] fill-[#8E406F]" /> Reputation:
            </span>
            <span className="font-semibold text-[#1E293B]">{averageRating} ★ ({reviewCount} Reviews)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <HeartHandshake size={13} className="text-[#8E406F]" /> Inquiry Response:
            </span>
            <span className="font-medium text-emerald-700">98% High Response Rate</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate?.('vendor-profile')}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#8E406F] bg-white py-2 text-xs font-semibold text-[#8E406F] shadow-sm transition hover:bg-[#FDF0F4]"
        >
          <Pencil size={12} />
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => onNavigate?.('vendor-services')}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#8E406F] py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A]"
        >
          <Package size={12} />
          My Services
        </button>
      </div>
    </section>
  );
}

// ============================================================
// CUSTOMER INQUIRIES WIDGET
// ============================================================
function InquiriesWidget({ onViewInquiry, onReplyInquiry, onNavigate, inquiries = [] }) {
  return (
    <section
      aria-label="Recent customer inquiries"
      className="flex flex-col h-full rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1E5EC] px-6 py-4 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <MessageCircle size={18} />
          </div>
          <div>
            <h2
              className="text-base font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Recent Customer Inquiries
            </h2>
            <p className="text-xs text-[#737373]">Couples requesting quotes, availability, and consultations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('vendor-inquiries')}
          className="group flex items-center gap-1 text-xs font-semibold text-[#8E406F] transition-all hover:text-[#73325A]"
        >
          <span>View All Inquiries</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-[#F9F0F5]">
        {inquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#999]">
            <p className="font-medium text-[#737373]">No customer inquiries yet</p>
            <p className="mt-1 text-[11px]">Couples who inquire about your packages will appear here.</p>
          </div>
        ) : (
          inquiries.slice(0, 5).map((inq) => (
            <div
              key={inq.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-[#FDF0F4]/40"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${inq.avatarBg || 'bg-[#8E406F]'} ${inq.avatarText || 'text-white'}`}
                  aria-hidden="true"
                >
                  {inq.initials || 'CU'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1E293B] truncate">{inq.customer || inq.customerName}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inq.statusStyle || 'bg-[#FDF0F4] text-[#8E406F] border-[#E8C4D8]'}`}>
                      {inq.status || 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">{inq.service || inq.serviceName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#999]">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} className="text-[#8E406F]" aria-hidden="true" />
                      {inq.eventDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} aria-hidden="true" />
                      {inq.received}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onViewInquiry(inq)}
                  className="rounded-lg border border-[#F1E5EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#555] transition hover:border-[#8E406F] hover:text-[#8E406F] active:scale-95"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onReplyInquiry(inq)}
                  className="flex items-center gap-1 rounded-lg bg-[#8E406F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
                >
                  <MessageCircle size={12} />
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ============================================================
// QUICK ACTIONS SECTION
// ============================================================
const QUICK_ACTIONS = [
  { id: 'inquiries', label: 'Client Inquiries', icon: MessageCircle, desc: 'Review quote requests & send replies', route: 'vendor-inquiries' },
  { id: 'add-listing', label: 'Add New Listing', icon: Plus, desc: 'Create a new package or service hall', route: 'vendor-listing-editor' },
  { id: 'manage-listings', label: 'Manage Listings', icon: Package, desc: 'Review, edit, or publish services', route: 'vendor-services' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts, review notices & updates', route: 'vendor-notifications' },
  { id: 'business-profile', label: 'Business Profile', icon: Store, desc: 'Update profile details & branding', route: 'vendor-profile' },
  { id: 'performance', label: 'Performance Analytics', icon: BarChart3, desc: 'Track traffic & client interest', route: 'vendor-performance' },
];

function QuickActionsSection({ onNavigate }) {
  return (
    <section aria-label="Quick actions" className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Quick Actions
        </h2>
        <span className="text-xs text-[#737373]">Shortcut tools to manage your wedding business</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(({ id, label, icon: Icon, desc, route }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (route === 'vendor-listing-editor') {
                window.history.pushState({}, '', '/vendor-listing-editor');
              }
              onNavigate?.(route);
            }}
            className="group flex items-center justify-between rounded-2xl border border-[#F1E5EC] bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8E406F]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F] transition-transform group-hover:scale-105 shrink-0">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#8E406F] transition-colors">{label}</p>
                <p className="text-[10px] text-[#999]">{desc}</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#bbb] transition-transform group-hover:translate-x-1 group-hover:text-[#8E406F] shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// MAIN VENDOR DASHBOARD PAGE COMPONENT
// ============================================================
const FALLBACK_DASHBOARD = {
  businessName: 'Oleena Florals',
  businessType: 'Floral & Decor',
  location: 'Colombo, Sri Lanka',
  activeListings: 0,
  totalListings: 0,
  pendingListings: 0,
  newInquiries: 0,
  averageRating: 0.0,
  reviewCount: 0,
  ratingCount: 0,
  recentInquiries: [
    {
      id: 1,
      initials: 'SM',
      customer: 'Sarah & Michael',
      service: 'Wedding Photography',
      eventDate: 'June 15, 2026',
      received: '2 hours ago',
      status: 'New',
      statusStyle: 'bg-[#FDF0F4] text-[#8E406F] border-[#E8C4D8]',
      avatarBg: 'bg-[#8E406F]',
      avatarText: 'text-white',
    },
    {
      id: 2,
      initials: 'GM',
      customer: 'Gayan & Minoli',
      service: 'Wedding Photography',
      eventDate: 'September 28, 2026',
      received: 'Yesterday',
      status: 'Responded',
      statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      avatarBg: 'bg-[#E8C4D8]',
      avatarText: 'text-[#8E406F]',
    },
    {
      id: 3,
      initials: 'SD',
      customer: 'Samantha & Daniel',
      service: 'Wedding Photography & Video',
      eventDate: 'November 12, 2026',
      received: '3 days ago',
      status: 'Pending',
      statusStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      avatarBg: 'bg-[#FDF0F4]',
      avatarText: 'text-[#8E406F]',
    },
  ],
  notifications: [],
};

export default function VendorDashboardPage({ onNavigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inquiry modal states
  const [inquiries, setInquiries] = useState(FALLBACK_DASHBOARD.recentInquiries);
  const [viewInquiry, setViewInquiry] = useState(null);
  const [replyInquiry, setReplyInquiry] = useState(null);

  // Notification modal state
  const [selectedNotification, setSelectedNotification] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = Number(storedUser.userId);
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const dashUrl = (userId && Number.isFinite(userId))
        ? `http://localhost:5131/api/vendor-dashboard?userId=${userId}`
        : 'http://localhost:5131/api/vendor-dashboard';

      // Fetch metrics, real listings, and notifications concurrently
      const [dashRes, servicesRes, notifRes] = await Promise.allSettled([
        fetch(dashUrl, { headers }),
        fetch('http://localhost:5131/api/vendor-content/services', { headers }),
        fetch('http://localhost:5131/api/notifications', { headers }),
      ]);

      let loadedDash = null;
      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        loadedDash = await dashRes.value.json();
      }

      let loadedServices = [];
      if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
        loadedServices = await servicesRes.value.json();
      } else if (loadedDash?.activeServices?.length) {
        loadedServices = loadedDash.activeServices;
      }

      let loadedNotifs = [];
      if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
        loadedNotifs = await notifRes.value.json();
      } else if (loadedDash?.recentNotifications?.length) {
        loadedNotifs = loadedDash.recentNotifications;
      }

      setDashboard(loadedDash ? { ...FALLBACK_DASHBOARD, ...loadedDash } : FALLBACK_DASHBOARD);
      setListings(Array.isArray(loadedServices) ? loadedServices : []);
      setNotifications(Array.isArray(loadedNotifs) ? loadedNotifs : []);

      if (loadedDash?.recentInquiries?.length) {
        setInquiries(loadedDash.recentInquiries);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setDashboard(FALLBACK_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Summary Stat cards derived in real time
  const summaryStats = useMemo(() => {
    const source = dashboard || FALLBACK_DASHBOARD;
    const avg = Number(source.averageRating ?? 0);
    const count = Number(source.reviewCount ?? source.ratingCount ?? 0);

    // Compute active listings from real loaded listings array
    const activeFromListings = listings.filter((l) => {
      const st = (l.status || '').toLowerCase();
      return st === 'active' || st === 'published';
    }).length;
    const totalFromListings = listings.length;

    const activeListings = listings.length > 0 ? activeFromListings : Number(source.activeListings ?? 0);
    const totalListings = listings.length > 0 ? totalFromListings : Number(source.totalListings ?? 0);
    const unreadNotifs = notifications.filter((n) => !n.isRead).length;

    return [
      {
        id: 'listings',
        label: 'Active Listings',
        value: String(activeListings),
        subtext: totalListings === 1 ? '1 Total Listing' : `${totalListings} Total Listings`,
        trendPositive: activeListings > 0,
        icon: Package,
      },
      {
        id: 'inquiries',
        label: 'Customer Inquiries',
        value: String(source.newInquiries ?? inquiries.length),
        subtext: `${inquiries.length} Inquiries Logged`,
        trendPositive: inquiries.length > 0,
        icon: MessageCircle,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        value: String(notifications.length),
        subtext: unreadNotifs > 0 ? `${unreadNotifs} Unread Alerts` : 'All Caught Up',
        trendPositive: unreadNotifs === 0,
        icon: Bell,
      },
      {
        id: 'rating',
        label: 'Average Rating',
        value: count > 0 ? `${avg.toFixed(1)} ★` : (Number(source.averageRating) > 0 ? `${Number(source.averageRating).toFixed(1)} ★` : '0.0 ★'),
        subtext: count === 1 ? '1 Rating' : `${count} Ratings`,
        isRating: true,
        icon: Star,
      },
    ];
  }, [dashboard, listings, notifications, inquiries]);

  const handleReplySent = (id) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status: 'Responded',
              statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            }
          : inq
      )
    );
  };

  const handleEditListing = (listing) => {
    const id = listing.serviceId || listing.id;
    if (onNavigate) {
      window.history.pushState({}, '', `/vendor-listing-editor?id=${id}`);
      onNavigate('vendor-listing-editor');
    }
  };

  const handleNotificationDelete = async (notifId) => {
    setNotifications((prev) =>
      prev.filter((n) => (n.notificationId ?? n.id ?? n.NotificationId) != notifId)
    );
    setSelectedNotification(null);
    try {
      await fetchNotificationsApi(`/${notifId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationMarkRead = async (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const nid = n.notificationId ?? n.id ?? n.NotificationId;
        return nid == notifId ? { ...n, isRead: true } : n;
      })
    );
    setSelectedNotification((prev) => (prev ? { ...prev, isRead: true } : null));
    try {
      await fetchNotificationsApi(`/${notifId}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const businessName = dashboard?.businessName || 'Oleena Florals';
  const businessType = dashboard?.businessType || 'Floral & Decor';
  const location = dashboard?.location || 'Colombo, Sri Lanka';
  const email = dashboard?.email || '';
  const phone = dashboard?.phone || '';
  const isApproved = dashboard?.isApproved ?? true;
  const averageRating = Number(dashboard?.averageRating ?? 4.8).toFixed(1);
  const reviewCount = dashboard?.reviewCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#8E406F] mt-0.5">
            Welcome back, <span className="font-semibold">{businessName}</span>! Manage your active listings, customer inquiries, and notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh dashboard data"
            className="flex items-center gap-1.5 rounded-xl border border-[#F1E5EC] bg-white px-3.5 py-2 text-xs font-semibold text-[#737373] shadow-sm transition hover:border-[#8E406F]/40 hover:text-[#8E406F]"
          >
            <RefreshCw size={13} className={`text-[#8E406F] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                window.history.pushState({}, '', '/vendor-listing-editor');
                onNavigate('vendor-listing-editor');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#8E406F] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
          >
            <Plus size={14} />
            <span>+ Create Listing</span>
          </button>
        </div>
      </div>

      {loading && !dashboard && (
        <div className="rounded-2xl border border-[#F1E5EC] bg-white px-6 py-4 text-sm text-[#737373] flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin" />
          Loading dashboard metrics from server...
        </div>
      )}

      {/* ── Stat Cards Grid (4 columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* ── Active Listings Showcase (fixes missing active listings from listings) ── */}
      <ActiveListingsSection
        listings={listings}
        onNavigate={onNavigate}
        onEditListing={handleEditListing}
      />

      {/* ── Middle Row: Profile & Verification Status + Recent Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ProfileStatusWidget
          businessName={businessName}
          businessType={businessType}
          location={location}
          email={email}
          phone={phone}
          isApproved={isApproved}
          averageRating={averageRating}
          reviewCount={reviewCount}
          onNavigate={onNavigate}
        />

        <RecentNotificationsWidget
          notifications={notifications}
          onNavigate={onNavigate}
          onSelectNotification={(n) => setSelectedNotification(n)}
        />
      </div>

      {/* ── Customer Inquiries Widget ── */}
      <InquiriesWidget
        inquiries={inquiries}
        onViewInquiry={(inq) => setViewInquiry(inq)}
        onReplyInquiry={(inq) => setReplyInquiry(inq)}
        onNavigate={onNavigate}
      />

      {/* ── Quick Actions (Notifications replaces Calendar) ── */}
      <QuickActionsSection onNavigate={onNavigate} />

      {/* ── Inquiry Modals ── */}
      <ViewInquiryModal
        inquiry={viewInquiry}
        onClose={() => setViewInquiry(null)}
        onReply={(inq) => setReplyInquiry(inq)}
      />
      <ReplyModal
        inquiry={replyInquiry}
        onClose={() => setReplyInquiry(null)}
        onSend={handleReplySent}
      />

      {/* ── Notification Detail Modal (for dashboard clicks) ── */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onMarkAsRead={handleNotificationMarkRead}
          onDelete={handleNotificationDelete}
        />
      )}
    </div>
  );
}
