import AdminTeamWidget from '../components/dashboard/AdminTeamWidget';
import CategoryChart from '../components/dashboard/CategoryChart';
import MetricCards from '../components/dashboard/MetricCards';
import PendingListingsTable from '../components/dashboard/PendingListingsTable';
import RecentInquiries from '../components/dashboard/RecentInquiries';

export default function DashboardPage() {
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
          <AdminTeamWidget />
        </div>
      </div>

    </div>
  );
}
