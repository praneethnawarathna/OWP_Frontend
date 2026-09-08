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
  { id: 'dashboard',       label: 'Dashboard',           icon: 'LayoutDashboard', active: true  },
  { id: 'listing-review',  label: 'Listing Review',      icon: 'ClipboardList',   active: false },
  { id: 'all-vendors',     label: 'All Vendors',         icon: 'Store',           active: false },
  { id: 'customers',       label: 'Customer Management', icon: 'Users',           active: false },
  { id: 'analytics',       label: 'Report Analytics',    icon: 'BarChart3',       active: false },
  { id: 'flagged',         label: 'Flagged Content',     icon: 'Flag',            active: false },
  { id: 'notifications',   label: 'Notifications',       icon: 'Bell',            active: false },
  { id: 'activity-log',    label: 'Activity Log',        icon: 'Activity',        active: false },
  { id: 'category-manager',label: 'Category Manager',   icon: 'Tag',             active: false },
];


// ── Listing Review mock data ─────────────────────────────────────────────────

export const listingCategories = ['All', 'Hotels', 'DJ', 'Catering', 'Photography', 'Decoration'];

export const allListings = [
  // ── Hotels ──
  {
    id: 101, vendor: 'The Grand Plaza', initials: 'GP', location: 'Chicago, IL',
    category: 'Hotels', submittedDate: 'Oct 23, 2023', status: 'Active',
    price: '$2,500 / night', rating: 4.8,
    description: 'Luxury hotel with grand ballroom, rooftop terrace, and full-service catering for up to 500 guests.',
    images: 3, contact: 'reservations@grandplaza.com', phone: '+1 (312) 555-0101',
  },
  {
    id: 102, vendor: 'Serene Garden Resort', initials: 'SG', location: 'Miami, FL',
    category: 'Hotels', submittedDate: 'Oct 20, 2023', status: 'Active',
    price: '$1,800 / night', rating: 4.5,
    description: 'Tropical garden venue with indoor and outdoor ceremony spaces, pool area, and bridal suite.',
    images: 5, contact: 'events@serenegarden.com', phone: '+1 (305) 555-0202',
  },
  {
    id: 103, vendor: 'Hilltop Manor', initials: 'HM', location: 'Nashville, TN',
    category: 'Hotels', submittedDate: 'Oct 18, 2023', status: 'Inactive',
    price: '$3,200 / night', rating: 4.2,
    description: 'Historic manor house with vineyard views, chapel, and exclusive-use bookings for weddings.',
    images: 7, contact: 'weddings@hilltopmanor.com', phone: '+1 (615) 555-0303',
  },
  // ── DJ ──
  {
    id: 201, vendor: 'Sonic Beats Entertainment', initials: 'SB', location: 'Los Angeles, CA',
    category: 'DJ', submittedDate: 'Oct 22, 2023', status: 'Active',
    price: '$800 / event', rating: 4.9,
    description: 'Professional DJ and MC services with state-of-the-art sound system, lighting rig, and 15+ years experience.',
    images: 2, contact: 'booking@sonicbeats.com', phone: '+1 (213) 555-0401',
  },
  {
    id: 202, vendor: 'Bass Drop Weddings', initials: 'BD', location: 'New York, NY',
    category: 'DJ', submittedDate: 'Oct 19, 2023', status: 'Active',
    price: '$1,200 / event', rating: 4.6,
    description: 'Curated wedding playlists, live mixing, wireless microphone setup, and full AV coordination.',
    images: 4, contact: 'hello@bassdropweddings.com', phone: '+1 (212) 555-0402',
  },
  {
    id: 203, vendor: 'Rhythm and Vows', initials: 'RV', location: 'Austin, TX',
    category: 'DJ', submittedDate: 'Oct 16, 2023', status: 'Inactive',
    price: '$650 / event', rating: 3.8,
    description: 'Specializes in fusion music sets blending classical, Bollywood, and contemporary hits.',
    images: 1, contact: 'dj@rhythmandvows.com', phone: '+1 (512) 555-0403',
  },
  // ── Catering ──
  {
    id: 301, vendor: 'Golden Fork Catering', initials: 'GF', location: 'San Francisco, CA',
    category: 'Catering', submittedDate: 'Oct 21, 2023', status: 'Active',
    price: '$85 / person', rating: 4.7,
    description: 'Farm-to-table menus, custom wedding cakes, full bar service, and professional wait staff.',
    images: 6, contact: 'info@goldenforkcatering.com', phone: '+1 (415) 555-0501',
  },
  {
    id: 302, vendor: 'Spice and Elegance', initials: 'SE', location: 'Houston, TX',
    category: 'Catering', submittedDate: 'Oct 17, 2023', status: 'Inactive',
    price: '$70 / person', rating: 4.1,
    description: 'South Asian and Mediterranean fusion menus. Live stations, dessert bars, and dietary accommodations.',
    images: 4, contact: 'events@spiceelegance.com', phone: '+1 (713) 555-0502',
  },
  {
    id: 303, vendor: 'Prestige Plates', initials: 'PP', location: 'Boston, MA',
    category: 'Catering', submittedDate: 'Oct 14, 2023', status: 'Active',
    price: '$110 / person', rating: 4.9,
    description: 'Fine-dining experience catering. Butler-style service, champagne towers, and multi-course menus.',
    images: 3, contact: 'luxury@prestigeplates.com', phone: '+1 (617) 555-0503',
  },
  // ── Photography ──
  {
    id: 401, vendor: 'Lumina Photography', initials: 'LP', location: 'New York, NY',
    category: 'Photography', submittedDate: 'Oct 24, 2023', status: 'Active',
    price: '$2,000 / package', rating: 5.0,
    description: 'Documentary and fine-art wedding photography. Includes engagement shoot, 10hr coverage, and album.',
    images: 10, contact: 'hello@luminaphoto.com', phone: '+1 (646) 555-0601',
  },
  {
    id: 402, vendor: 'Forever Frame Studios', initials: 'FF', location: 'Seattle, WA',
    category: 'Photography', submittedDate: 'Oct 15, 2023', status: 'Active',
    price: '$1,500 / package', rating: 4.4,
    description: 'Candid lifestyle photography with drone coverage and same-day highlight reel delivery.',
    images: 8, contact: 'book@foreverframe.com', phone: '+1 (206) 555-0602',
  },
  // ── Decoration ──
  {
    id: 501, vendor: 'Bloom and Bliss Decor', initials: 'BB', location: 'Dallas, TX',
    category: 'Decoration', submittedDate: 'Oct 20, 2023', status: 'Active',
    price: '$3,500 / event', rating: 4.8,
    description: 'Full venue transformation. Floral arches, drapery, table centrepieces, lighting design and day-of coordination.',
    images: 9, contact: 'design@bloombliss.com', phone: '+1 (972) 555-0701',
  },
  {
    id: 502, vendor: 'Enchanted Aisle', initials: 'EA', location: 'Orlando, FL',
    category: 'Decoration', submittedDate: 'Oct 12, 2023', status: 'Inactive',
    price: '$2,200 / event', rating: 3.9,
    description: 'Fairy-light canopies, rustic boho setups, and custom backdrop installations.',
    images: 5, contact: 'hello@enchantedaisle.com', phone: '+1 (407) 555-0702',
  },
];
