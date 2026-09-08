import { Bell, Menu, Plus, Search } from 'lucide-react';

export default function Header({ onMenuClick }) {
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
        <label htmlFor="global-search" className="sr-only">Search</label>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
        <input
          id="global-search"
          type="search"
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#F8FAFC] border border-[#F1E5EC] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">

        {/* Add New Vendor — solid mauve primary */}
        <button
          aria-label="Add new vendor"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#8E406F] text-white text-sm font-medium hover:bg-[#73325A] active:scale-95 transition-all shadow-sm"
        >
          <Plus size={14} />
          Add New Vendor
        </button>

        {/* Bell */}
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#F8FAFC] border border-[#F1E5EC] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors"
        >
          <Bell size={16} />
        </button>

        {/* Avatar */}
        <button
          aria-label="Profile"
          className="h-8 w-8 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center hover:bg-[#FDF0F4] transition-colors"
        >
          <span className="text-[#8E406F] text-xs font-bold">PN</span>
        </button>

      </div>
    </header>
  );
}
