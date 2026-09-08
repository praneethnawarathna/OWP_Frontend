import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  Flag,
  LayoutDashboard,
  Settings,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { sidebarNav } from '../../mock/dashboardData';

const iconMap = {
  LayoutDashboard,
  ClipboardList,
  Store,
  Users,
  BarChart3,
  Flag,
  Bell,
  Activity,
  Tag,
  Settings,
};

// IDs that map to real pages; others are future nav items
const ROUTABLE_IDS = new Set(['dashboard', 'customers', 'listing-review']);

function NavItem({ item, isActive, onNavigate }) {
  const Icon = iconMap[item.icon] ?? LayoutDashboard;
  const routable = ROUTABLE_IDS.has(item.id);
  return (
    <li>
      <button
        onClick={() => routable && onNavigate?.(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          transition-colors duration-150
          ${isActive
            ? 'bg-[#FDF0F4] text-[#8E406F] font-semibold'
            : routable
              ? 'text-[#555] font-normal hover:bg-[#FDF0F4] hover:text-[#8E406F]'
              : 'text-[#bbb] font-normal cursor-not-allowed'}
        `}
      >
        <Icon
          size={16}
          className={`shrink-0 ${isActive ? 'text-[#8E406F]' : routable ? 'text-[#999]' : 'text-[#ccc]'}`}
          aria-hidden="true"
        />
        <span className="text-left whitespace-nowrap">{item.label}</span>
      </button>
    </li>
  );
}

export default function Sidebar({ mobileOpen = false, onClose, currentPage = 'dashboard', onNavigate }) {
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
        aria-label="Sidebar navigation"
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
            Wedding Directory
          </p>
          <p className="text-[#aaa] text-xs mt-0.5">Admin Dashboard</p>
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
            {sidebarNav.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </nav>

        {/* ── Admin Roles — view-only ── */}
        <div className="px-3 pb-1">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#bbb] cursor-not-allowed">
            <Users size={16} className="text-[#ccc] shrink-0" aria-hidden="true" />
            <span className="text-left whitespace-nowrap">Admin Roles</span>
          </div>
        </div>

        {/* ── Settings ── */}
        <div className="px-3 pb-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors">
            <Settings size={16} className="text-[#999] shrink-0" aria-hidden="true" />
            <span className="text-left whitespace-nowrap">Settings</span>
          </button>
        </div>

        {/* ── User Profile ── */}
        <div className="border-t border-[#F1E5EC] px-4 py-3 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center shrink-0">
            <span className="text-[#8E406F] text-xs font-bold">PN</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#333] text-xs font-semibold leading-tight truncate">Praneeth N</p>
            <p className="text-[#999] text-[10px] leading-tight">Admin</p>
          </div>
        </div>

      </aside>
    </>
  );
}
