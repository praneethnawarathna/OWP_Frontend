import { useState } from 'react';
import VendorHeader from './VendorHeader';
import VendorSidebar from './VendorSidebar';

/**
 * VendorLayout – layout shell for the vendor portal.
 * Mirrors AdminLayout structure but uses VendorSidebar + VendorHeader
 * so that all admin-exclusive UI is cleanly separated.
 */
export default function VendorLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ── Sidebar: fixed left column ── */}
      <VendorSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentPage={currentPage}
        onNavigate={(id) => {
          onNavigate?.(id);
          setMobileOpen(false);
        }}
        onLogout={onLogout}
      />

      {/* ── Right side: header + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <VendorHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main
          id="vendor-main-content"
          role="main"
          className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]"
        >
          {children}
        </main>
      </div>

    </div>
  );
}
