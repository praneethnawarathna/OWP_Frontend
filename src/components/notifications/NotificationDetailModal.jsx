import { useState } from 'react';
import { X, Trash2, CheckCheck, Check, Clock, Bell, Loader2 } from 'lucide-react';

export default function NotificationDetailModal({
  notification,
  onClose,
  onMarkAsRead,
  onDelete,
  getTypeIcon,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  if (!notification) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const notifId = notification.notificationId ?? notification.id ?? notification.NotificationId;

  const handleMarkRead = async () => {
    if (notification.isRead || isMarkingRead || notifId == null) return;
    try {
      setIsMarkingRead(true);
      await onMarkAsRead?.(notifId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      if (onDelete && notifId != null) {
        await onDelete(notifId);
      }
      onClose?.();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      onClose?.();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const notifType = notification.type || notification.Type;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-detail-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#F1E5EC] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F] border border-[#F1E5EC]">
              {getTypeIcon ? getTypeIcon(notifType) : <Bell size={16} />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {notifType && (
                <span className="rounded-lg bg-[#FDF0F4] border border-[#F1E5EC] px-2.5 py-0.5 text-xs font-semibold text-[#8E406F]">
                  {notifType}
                </span>
              )}
              {notification.isRead ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  Read
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  New / Unread
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <h3
              id="notification-detail-title"
              className="text-lg font-bold text-[#1E293B] leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {notification.title || 'Notification'}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1.5">
              <Clock size={13} className="shrink-0" />
              {formatTimestamp(notification.createdAt)}
            </p>
          </div>

          {/* Description / Message */}
          <div className="rounded-xl bg-[#FAF7F9] border border-[#F1E5EC] p-4 text-sm text-[#475569] leading-relaxed break-words whitespace-pre-line">
            {notification.message || notification.description || 'No additional details provided.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#F1E5EC] bg-white flex items-center justify-between gap-3 shrink-0">
          {/* Delete Action */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {!notification.isRead ? (
              <button
                type="button"
                disabled={isMarkingRead}
                onClick={handleMarkRead}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8E406F] text-white text-xs font-semibold hover:bg-[#7a3560] transition-colors shadow-sm disabled:opacity-50"
              >
                {isMarkingRead ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark as Read
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Check size={13} />
                Read
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E8DDE4] text-[#555] text-xs font-semibold hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]/40 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
