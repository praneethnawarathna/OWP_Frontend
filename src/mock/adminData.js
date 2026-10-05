// ============================================================
// OWP – Wedding Planner Admin Dashboard
// Mock data for Admin Management page
// ============================================================

export const admins = [
  {
    id: 1,
    name: 'Alex Chen',
    email: 'alex.chen@owp.admin',
    initials: 'AC',
    role: 'Super Admin',
    permission: 'Full System',
    lastActive: 'Aug 30, 2026',
    status: 'Active',
    avatarBg: '#8E406F',
  },
  {
    id: 2,
    name: 'Sam Rivera',
    email: 'sam.rivera@owp.admin',
    initials: 'SR',
    role: 'Super Admin',
    permission: 'Full System',
    lastActive: 'Aug 29, 2026',
    status: 'Active',
    avatarBg: '#4A7C6B',
  },
  {
    id: 3,
    name: 'Mia Patel',
    email: 'mia.patel@owp.admin',
    initials: 'MP',
    role: 'Moderator',
    permission: 'Listing Approvals Only',
    lastActive: 'Aug 28, 2026',
    status: 'Active',
    avatarBg: '#C07D3A',
  },
  {
    id: 4,
    name: 'Jane Doe',
    email: 'jane.doe@owp.admin',
    initials: 'JD',
    role: 'Moderator',
    permission: 'Listing Approvals Only',
    lastActive: 'Aug 27, 2026',
    status: 'Active',
    avatarBg: '#5A6FA8',
  },
  {
    id: 5,
    name: 'Marcus Webb',
    email: 'marcus.webb@owp.admin',
    initials: 'MW',
    role: 'Editor',
    permission: 'Content & Categories',
    lastActive: 'Aug 25, 2026',
    status: 'Active',
    avatarBg: '#7A5C8E',
  },
  {
    id: 6,
    name: 'Priya Nair',
    email: 'priya.nair@owp.admin',
    initials: 'PN',
    role: 'Editor',
    permission: 'Content & Categories',
    lastActive: 'Aug 20, 2026',
    status: 'Inactive',
    avatarBg: '#3B7A8E',
  },
];

export const adminMetrics = {
  totalAdministrators: 6,
  activeSuperAdmins: 2,
  moderatorReviewerRoles: 4,
};

export const adminRoles = ['Super Admin', 'Moderator', 'Editor'];

export const adminPermissions = {
  'Super Admin': 'Full System',
  'Moderator': 'Listing Approvals Only',
  'Editor': 'Content & Categories',
};
