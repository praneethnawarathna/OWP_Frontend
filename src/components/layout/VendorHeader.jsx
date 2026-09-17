import { useEffect, useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';

const NOTIFICATIONS_API_URL = 'http://localhost:5131/api/notifications';

/**
 * VendorHeader – stripped-down top bar for the vendor portal.
 * Only shows: mobile hamburger | search bar | notification bell.
 * All admin-specific items (role switcher, Add New Vendor, profile icon,
 * duplicate sign-out) are intentionally omitted.
 */
export default function VendorHeader({ onMenuClick, onNavigate, currentPage }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(NOTIFICATIONS_API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch notifications for bell badge:', err);
      });
  }, [currentPage]);

  const handleNotificationsClick = () => {
    onNavigate?.('vendor-notifications');
  };

  return (
    <header className="h-14 shrink-0 w-full bg-white border-b border-[#F1E5EC] flex items-center px-6 gap-4">

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

      {/* Notification Bell */}
      <button
        onClick={handleNotificationsClick}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#F8FAFC] border border-[#F1E5EC] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors cursor-pointer"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8E406F] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

    </header>
  );
}
