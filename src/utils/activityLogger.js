export const ACTION_TYPES = {
  VENDOR_APPROVED: 'VendorApproved',
  VENDOR_REJECTED: 'VendorRejected',
  VENDOR_SUSPENDED: 'VendorSuspended',
  VENDOR_BANNED: 'VendorBanned',
  SETTINGS_CHANGED: 'SettingsChanged',
  LISTING_REVIEWED: 'ListingReviewed',
  GENERAL_UPDATE: 'GeneralUpdate',
};

const STORAGE_KEY = 'owp_admin_activity_logs_v2';

const MOCK_SEED = [];

export function getLogs() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SEED));
    return MOCK_SEED;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse activity logs from localStorage', e);
    return [];
  }
}

export function logActivity(actionType, targetType, targetId, description, actorName = 'System Admin') {
  const logs = getLogs();
  const newLog = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    actionType,
    targetType,
    targetId,
    description,
    actorName,
  };
  
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  
  // Dispatch custom event for cross-tab or same-window reactivity if needed
  window.dispatchEvent(new Event('activityLogUpdated'));
  return newLog;
}

export function clearLogs() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('activityLogUpdated'));
}
