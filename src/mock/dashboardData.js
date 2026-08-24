// ============================================================
// OWP – Wedding Planner Admin Dashboard
// Mock data — updated to match Stitch reference screenshot
// ============================================================

export const pendingListings = [
  {
    id: 1,
    vendor: 'Lumina Photography',
    location: 'New York, NY',
    vendorInitials: 'LP',
    category: 'Photography',
    submittedDate: 'Oct 24, 2023',
    status: 'Pending',
    badgeColor: 'photography',
  },
  {
    id: 2,
    vendor: 'The Grand Plaza',
    location: 'Chicago, IL',
    vendorInitials: 'GP',
    category: 'Hotels',
    submittedDate: 'Oct 23, 2023',
    status: 'Pending',
    badgeColor: 'hotels',
  },
  {
    id: 3,
    vendor: 'Sonic Beats Entertainment',
    location: 'Los Angeles, CA',
    vendorInitials: 'SB',
    category: 'DJ',
    submittedDate: 'Oct 22, 2023',
    status: 'Pending',
    badgeColor: 'dj',
  },
];

export const categoryBreakdown = [
  { label: 'Hotels', value: 45, color: '#8E406F' },
  { label: 'DJs', value: 20, color: '#C5A3B8' },
  { label: 'Catering', value: 20, color: '#D4B8C8' },
  { label: 'Others', value: 15, color: '#EDD9E5' },
];

export const recentInquiries = [
  {
    id: 1,
    couple: 'Sarah & Michael',
    coupleInitials: 'SM',
    inquiryFor: 'Lumina Photography',
    eventDate: 'Jun 15, 2024',
    avatarBg: '#8E406F',
    avatarText: '#fff',
  },
  {
    id: 2,
    couple: 'Gayan & Minoli',
    coupleInitials: 'EJ',
    inquiryFor: 'The Grand Plaza',
    eventDate: 'Sep 28, 2024',
    avatarBg: '#4A7C6B',
    avatarText: '#fff',
  },
];

export const adminTeam = [
  {
    id: 1,
    name: 'Thimidu Pahesara',
    initials: 'AC',
    role: 'Editor',
    status: 'online',
    avatarBg: '#8E406F',
  },
  {
    id: 2,
    name: 'Kasun Bandara',
    initials: 'SR',
    role: 'Moderator',
    status: 'online',
    avatarBg: '#4A7C6B',
  },
];

export const sidebarNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', active: true },
  { id: 'review-queue', label: 'Review Queue', icon: 'ClipboardList', active: false },
  { id: 'all-vendors', label: 'All Vendors', icon: 'Store', active: false },
  { id: 'customers', label: 'Customer Management', icon: 'Users', active: false },
  { id: 'analytics', label: 'Report Analytics', icon: 'BarChart3', active: false },
  { id: 'flagged', label: 'Flagged Content', icon: 'Flag', active: false },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', active: false },
  { id: 'activity-log', label: 'Activity Log', icon: 'Activity', active: false },
  { id: 'category-manager', label: 'Category Manager', icon: 'Tag', active: false },
];
