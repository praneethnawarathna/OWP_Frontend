import { useEffect, useState, useRef } from 'react';
import { Bell, Menu, Search, CheckCheck, ChevronRight, Inbox, Clock, Sparkles } from 'lucide-react';

const NOTIFICATIONS_API_URL = 'http://localhost:5131/api/notifications';

/**
 * VendorHeader – top bar for the vendor portal with interactive
 * notifications dropdown and unread badge indicator.
 */
export default function VendorHeader({ onMenuClick, onNavigate, currentPage }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(NOTIFICATIONS_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications for bell badge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchNotifications();
      }
      return next;
    });
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === item.notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const token = localStorage.getItem('token');
      try {
        await fetch(`${NOTIFICATIONS_API_URL}/${item.notificationId}/read`, {
          method: 'PATCH',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
      } catch (err) {
        console.error('Failed to mark read from dropdown:', err);
      }
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    const token = localStorage.getItem('token');
    try {
      await fetch(`${NOTIFICATIONS_API_URL}/read-all`, {
        method: 'PATCH',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
    } catch (err) {
      console.error('Failed to mark all read from dropdown:', err);
    }
  };

  const handleViewAll = () => {
    setDropdownOpen(false);
    onNavigate?.('vendor-notifications');
  };

  const formatShortTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <header className="h-14 shrink-0 w-full bg-white border-b border-[#F1E5EC] flex items-center px-6 gap-4 relative z-30">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden text-[#999] hover:text-[#8E406F]"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <label htmlFor="vendor-global-search" className="sr-only">Search</label>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
        <input
          id="vendor-global-search"
          type="search"
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#F8FAFC] border border-[#F1E5EC] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification Bell & Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleToggleDropdown}
          aria-expanded={dropdownOpen}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-all cursor-pointer ${
            dropdownOpen
              ? 'bg-[#FDF0F4] border border-[#8E406F] text-[#8E406F] shadow-sm'
              : 'bg-[#F8FAFC] border border-[#F1E5EC] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
          }`}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8E406F] px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ── */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#F1E5EC] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Dropdown Header */}
            <div className="px-4 py-3 border-b border-[#F1E5EC] flex items-center justify-between bg-[#FDFCFD]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-[#FDF0F4] px-2 py-0.5 text-[10px] font-bold text-[#8E406F]">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="text-[11px] text-[#94A3B8]">All caught up</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E406F] hover:text-[#73325A] hover:underline"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Dropdown Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#F1E5EC]/60">
              {loading && notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#8E406F] border-t-transparent mb-2" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="mx-auto h-10 w-10 rounded-2xl bg-[#FDF0F4] text-[#8E406F] flex items-center justify-center mb-2">
                    <Inbox size={18} />
                  </div>
                  <p className="text-xs font-semibold text-[#1E293B]">No notifications</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">We'll alert you about listings, credentials, and activity here.</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((item) => {
                  const isUnread = !item.isRead;
                  return (
                    <div
                      key={item.notificationId}
                      onClick={() => handleItemClick(item)}
                      className={`px-4 py-3 flex items-start gap-3 transition cursor-pointer ${
                        isUnread
                          ? 'bg-[#FDF0F4]/30 hover:bg-[#FDF0F4]/60'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="pt-1 shrink-0">
                        <span
                          className={`block h-2 w-2 rounded-full ${
                            isUnread ? 'bg-[#8E406F]' : 'bg-slate-200'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-xs truncate ${isUnread ? 'font-bold text-[#1E293B]' : 'font-medium text-[#475569]'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-[#94A3B8] shrink-0">
                            {formatShortTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-2 border-t border-[#F1E5EC] bg-[#FDFCFD]">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#8E406F] bg-white border border-[#F1E5EC] hover:bg-[#FDF0F4] hover:border-[#8E406F]/30 transition shadow-sm"
              >
                <span>View All Notifications</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
