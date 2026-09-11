import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  Star,
  Store,
  X,
} from 'lucide-react';
import { vendorSidebarNav } from '../../mock/vendorData';

const iconMap = {
  LayoutDashboard,
  BarChart3,
  Bell,
  Store,
  Star,
};

function NavItem({ item, isActive, onNavigate }) {
  const Icon = iconMap[item.icon] ?? LayoutDashboard;
  return (
    <li>
      <button
        onClick={() => item.routable && onNavigate?.(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          transition-colors duration-150
          ${isActive
            ? 'bg-[#FDF0F4] text-[#8E406F] font-semibold'
            : item.routable
              ? 'text-[#555] font-normal hover:bg-[#FDF0F4] hover:text-[#8E406F]'
              : 'text-[#bbb] font-normal cursor-not-allowed'}
        `}
      >
        <Icon
          size={16}
          className={`shrink-0 ${isActive ? 'text-[#8E406F]' : item.routable ? 'text-[#999]' : 'text-[#ccc]'}`}
          aria-hidden="true"
        />
        <span className="text-left whitespace-nowrap">{item.label}</span>
      </button>
    </li>
  );
}

export default function VendorSidebar({
  mobileOpen = false,
  onClose,
  currentPage = 'vendor-dashboard',
  onNavigate,
  onLogout,
}) {
  // Retrieve authenticated vendor data from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const displayName = storedUser.fullName || 'Vendor';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'VN';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Vendor sidebar navigation"
        className={`
          flex flex-col w-56 shrink-0
          bg-white border-r border-[#F1E5EC]
          h-full overflow-y-auto
          transition-transform duration-300 z-40
          max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:h-full
          ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}
        `}
      >

        {/* ── Brand ── */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F1E5EC]">
          <p
            className="text-[#8E406F] font-bold text-base leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Oleena Wedding Planner
          </p>
          <p className="text-[#aaa] text-xs mt-0.5">Vendor Dashboard</p>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#999] lg:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {vendorSidebarNav.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </nav>

        {/* ── Log Out Button ── */}
        <div className="px-3 pb-2">
          <button
            id="vendor-sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut size={16} className="shrink-0 text-rose-500" aria-hidden="true" />
            <span className="text-left whitespace-nowrap">Sign Out</span>
          </button>
        </div>

        {/* ── Vendor Profile footer ── */}
        <div className="border-t border-[#F1E5EC] px-4 py-3 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center shrink-0">
            <span className="text-[#8E406F] text-xs font-bold">{userInitials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#333] text-xs font-semibold leading-tight truncate">{displayName}</p>
            <p className="text-[#999] text-[10px] leading-tight">Vendor</p>
          </div>
        </div>

      </aside>
    </>
  );
}
