import AdminTeamWidget from '../components/dashboard/AdminTeamWidget';
import CategoryChart from '../components/dashboard/CategoryChart';
import MetricCards from '../components/dashboard/MetricCards';
import PendingListingsTable from '../components/dashboard/PendingListingsTable';
import RecentInquiries from '../components/dashboard/RecentInquiries';
import VendorDashboardPage from './VendorDashboardPage';

export default function DashboardPage({ onNavigate }) {
  // If the logged-in user is a vendor, render the Vendor Dashboard
  const isVendor = (() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = String(storedUser.role || storedUser.Role || storedUser.userRole || '').toUpperCase();
      if (role === 'VENDOR' || role.includes('VENDOR')) return true;

      const email = String(storedUser.email || '').toLowerCase();
      if (email.includes('vendor') || email.includes('lumina')) return true;

      const fullName = String(storedUser.fullName || '').toLowerCase();
      if (fullName.includes('lumina') || fullName.includes('photography')) return true;

      // Check JWT token payload
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenRole = String(
          payload.role ||
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          payload.Role ||
          ''
        ).toUpperCase();
        if (tokenRole === 'VENDOR' || tokenRole.includes('VENDOR')) return true;
        if (tokenRole && !tokenRole.includes('ADMIN')) return true;
      }

      // If a role is explicitly defined and is not ADMIN or SUPER_ADMIN, it's a vendor
      if (role && !role.includes('ADMIN')) return true;
    } catch {
      // ignore
    }
    return false;
  })();

  if (isVendor) {
    return <VendorDashboardPage />;
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">

      {/* ── Page title ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#8E406F] mt-0.5">
            Monitor directory health and pending actions.
          </p>
        </div>
        <span className="text-xs text-[#999] border border-[#F1E5EC] rounded-lg px-3 py-1.5 bg-white mt-1">
          Last 30 Days
        </span>
      </div>

      {/* ── Row 1: 4 Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCards />
      </div>

      {/* ── Row 2: Pending Listings (65%) + Category Chart (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        {/* Pending Listings */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
          <PendingListingsTable />
        </div>
        {/* Category Chart */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
          <CategoryChart />
        </div>
      </div>

      {/* ── Row 3: Recent Inquiries (65%) + Admin Team (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
          <RecentInquiries />
        </div>
        {/* Admin Team */}
        <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
          <AdminTeamWidget onNavigate={onNavigate} />
        </div>
      </div>

    </div>
  );
}