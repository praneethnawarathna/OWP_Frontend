// Mock data for the Directory Report Analytics page (Pulathis's "Directory Report
// Analytics" module — Read only, no CRUD).
//
// The vendor counts, categories and statuses shown on this page are computed live
// from src/mock/vendorDirectoryData.js — this file only holds the extra
// time-series and categorization data a real aggregation endpoint would return,
// which the small vendor list alone can't demonstrate meaningfully.

// Last 6 months of directory application volume.
export const monthlyApplications = [
  { month: 'Apr', applications: 9, approved: 6, rejected: 2 },
  { month: 'May', applications: 14, approved: 10, rejected: 3 },
  { month: 'Jun', applications: 11, approved: 8, rejected: 2 },
  { month: 'Jul', applications: 17, approved: 12, rejected: 4 },
  { month: 'Aug', applications: 21, approved: 15, rejected: 5 },
  { month: 'Sep', applications: 13, approved: 9, rejected: 3 },
];

// Categorized reasons behind bans/suspensions, for the reasons-breakdown chart.
// A real backend would derive these by classifying the free-text banReason /
// suspendReason fields; this mock represents that aggregation.
export const banSuspensionReasons = [
  { reason: 'Fake or misleading documents', count: 5 },
  { reason: 'Customer complaints', count: 4 },
  { reason: 'Payment / fraud concerns', count: 3 },
  { reason: 'Policy violation', count: 2 },
  { reason: 'Unresponsive vendor', count: 1 },
];
