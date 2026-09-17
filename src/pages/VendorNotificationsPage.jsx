import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Inbox,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

import { fetchNotificationsApi } from '../services/notificationsApi';

function PageShell({ title, description, icon: Icon, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] shadow-sm border border-[#F1E5EC]">
          <Icon size={22} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          <p className="text-sm text-[#737373] mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
        disabled
          ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
          : danger
            ? 'border-rose-200 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-300 active:scale-95'
            : 'border-[#E8DDE4] text-[#8E406F] bg-white hover:bg-[#FDF0F4] hover:border-[#8E406F]/40 active:scale-95 shadow-sm'
      }`}
    >
      {children}
    </button>
  );
}

const getTypeIcon = (type) => {
  switch (type) {
    case 'ListingPublished':
    case 'ListingCreated':
    case 'ListingApproved':
      return <Sparkles size={14} className="text-[#8E406F]" />;
    case 'CredentialVerified':
      return <FileCheck size={14} className="text-emerald-600" />;
    case 'ListingFlagged':
    case 'CredentialRejected':
    case 'CredentialExpired':
      return <AlertTriangle size={14} className="text-amber-600" />;
    case 'SecurityChange':
      return <ShieldAlert size={14} className="text-blue-600" />;
    default:
      return <Bell size={14} className="text-[#8E406F]" />;
  }
};

export default function VendorNotificationsPage({ onNavigate }) {
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotificationsApi();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Unable to load notifications (status: ${res.status}).`);
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetchNotificationsApi(`/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetchNotificationsApi('/read-all', { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    try {
      await fetchNotificationsApi(`/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <PageShell
      title="Notifications"
      description="Stay updated with listing status changes, profile activity, and platform notices."
      icon={Bell}
    >
      <div className="space-y-4">

        {/* ── Action & Filter Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#F1E5EC] bg-white p-4 shadow-sm">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-[#8E406F] text-white shadow-sm'
                  : 'text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-[#8E406F] text-white shadow-sm'
                  : 'text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filter === 'unread'
                      ? 'bg-white text-[#8E406F]'
                      : 'bg-[#FDF0F4] text-[#8E406F]'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter('read')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === 'read'
                  ? 'bg-[#8E406F] text-white shadow-sm'
                  : 'text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <ActionButton onClick={handleMarkAllAsRead}>
                <CheckCheck size={14} />
                Mark all as read
              </ActionButton>
            )}
            <ActionButton onClick={loadNotifications}>
              <Clock size={14} />
              Refresh
            </ActionButton>
          </div>
        </div>

        {/* ── Content Area ── */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            <p className="font-semibold">Unable to load notifications</p>
            <p className="mt-1 text-xs text-rose-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-[#F1E5EC] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-[#8E406F] border-t-transparent" />
            <p className="mt-3 text-sm font-medium text-[#737373]">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8DDE4] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] mb-3">
              <Inbox size={24} />
            </div>
            <h3
              className="text-base font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="mt-1 text-xs text-[#737373] max-w-xs mx-auto">
              {filter === 'unread'
                ? 'You have caught up with all activity updates.'
                : 'Activity notices, listing approvals, and status alerts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const isUnread = !item.isRead;
              return (
                <article
                  key={item.notificationId}
                  onClick={() => handleMarkAsRead(item.notificationId, item.isRead)}
                  className={`group relative flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm transition cursor-pointer ${
                    isUnread
                      ? 'border-[#E8DDE4] border-l-4 border-l-[#8E406F] bg-[#FDF0F4]/25 hover:bg-[#FDF0F4]/40 hover:shadow-md'
                      : 'border-[#F1E5EC] border-l-4 border-l-transparent bg-white hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Unread indicator / Icon bubble */}
                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                          isUnread
                            ? 'bg-[#8E406F] text-white shadow-sm'
                            : 'bg-[#F8FAFC] text-[#94A3B8] border border-[#F1E5EC]'
                        }`}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={`text-sm ${
                            isUnread ? 'font-bold text-[#1E293B]' : 'font-medium text-[#475569]'
                          }`}
                        >
                          {item.title}
                        </h2>
                        {item.type && (
                          <span className="rounded-lg bg-[#FDF0F4] border border-[#F1E5EC] px-2 py-0.5 text-[10px] font-semibold text-[#8E406F]">
                            {item.type}
                          </span>
                        )}
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            New
                          </span>
                        )}
                        <span className="ml-auto text-[11px] text-[#94A3B8]">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#555] leading-relaxed break-words">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Dismiss / Delete button */}
                  <div className="shrink-0 pt-0.5">
                    <button
                      type="button"
                      title="Dismiss notification"
                      onClick={(e) => handleDelete(e, item.notificationId)}
                      className="rounded-xl p-2 text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </PageShell>
  );
}
