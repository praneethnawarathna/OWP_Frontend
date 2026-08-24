import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ── Sidebar: fixed left column ── */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Right side: header + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />

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
