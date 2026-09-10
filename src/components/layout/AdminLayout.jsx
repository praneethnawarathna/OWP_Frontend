import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
  userRole,
  onRoleToggle,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ── Sidebar: fixed left column ── */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentPage={currentPage}
        onNavigate={(id) => {
          onNavigate?.(id);
          setMobileOpen(false);
        }}
        userRole={userRole}
        onLogout={onLogout}
      />

      {/* ── Right side: header + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileOpen(true)}
          userRole={userRole}
          onRoleToggle={onRoleToggle}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]"
        >
          {children}
        </main>
      </div>

    </div>
  );
}
