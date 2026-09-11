// AdminSettingsPage.jsx — Oleena Wedding Planner Admin Portal
//
// Settings page for the Regular Admin role.
// Renders at path: /settings  (page key: 'settings')
//
// Sections (in order):
//   1. My Profile
//   2. Change Password
//   3. Secure PIN Management
//   4. Notification Preferences
//   5. Session & Device Management
//   6. My Activity (PIN Verification History)
//
// Does NOT include SuperAdmin-only settings (platform config, commission rates,
// AI governance, admin management). Those belong to a separate page.
//
// Auth: reads logged-in admin identity from localStorage ('user' key),
//       which is set by LoginPage.jsx on successful authentication.
//
// API: raw fetch() with JWT bearer token, matching the pattern used by
//      AdminManagementPage.jsx and LoginPage.jsx in this codebase.
//
// ⚠️  All backend endpoints are marked // TODO where not yet confirmed.
//     See the "Assumed Backend Endpoints" comment block at the bottom of this file.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Lock,
  Bell,
  Monitor,
  Activity,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  Shield,
  AlertCircle,
  ChevronRight,
  Clock,
  LogOut,
  Upload,
  KeyRound,
  RefreshCw,
  Copy,
  CheckCheck,
} from 'lucide-react';
import PinInput from '../components/common/PinInput';

// ─── API ─────────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5131/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// TODO: confirm endpoint exists on backend — PUT /api/admin/me
const updateAdminProfile = (payload) =>
  fetch(`${API_BASE}/admin/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// TODO: confirm endpoint exists on backend — POST /api/admin/me/change-password
const changeAdminPassword = (payload) =>
  fetch(`${API_BASE}/admin/me/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// POST /api/admin/me/pin/verify
// Verifies the current PIN without changing it. Returns 200 OK if correct, 400 if wrong.
const verifyAdminPin = (payload) =>
  fetch(`${API_BASE}/admin/me/pin/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// POST /api/admin/me/pin/generate
// Generates a candidate 4-digit PIN (does NOT save to DB yet).
// Body: { currentPin: string }
// Response: { pin: string, alreadyInUse: bool }
const generateCandidateAdminPin = (payload) =>
  fetch(`${API_BASE}/admin/me/pin/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// POST /api/admin/me/pin/save
// Commits the verified new PIN to the DB.
// Body: { currentPin: string, newPin: string }
const saveAdminPin = (payload) =>
  fetch(`${API_BASE}/admin/me/pin/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// TODO: confirm endpoint exists on backend — PUT /api/admin/me/notifications
const updateNotificationPrefs = (payload) =>
  fetch(`${API_BASE}/admin/me/notifications`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

// TODO: confirm endpoint exists on backend — POST /api/admin/me/sessions/revoke-others
const revokeOtherSessions = () =>
  fetch(`${API_BASE}/admin/me/sessions/revoke-others`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

// TODO: confirm endpoint exists on backend — GET /api/admin/me/activity
// This should be the same audit log the Activity Log sidebar page uses,
// filtered to actions performed by the currently logged-in admin (adminId=self).
// If the Activity Log page doesn't support filtering yet, flag as a backend gap.
const getMyRecentActivity = () =>
  fetch(`${API_BASE}/admin/me/activity`, {
    headers: getAuthHeaders(),
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function getUserInitials(fullName) {
  return (fullName || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'A';
}

// Parse browser/device info from navigator.userAgent (best-effort, client-side only)
function parseBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Apple Safari';
  else if (/Opera|OPR\//.test(ua)) browser = 'Opera';

  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';

  return { browser, os };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Consistent card wrapper matching the rest of the dashboard
function SettingsCard({ title, description, children, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#F1E5EC] flex items-center gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-[#FDF0F4] flex items-center justify-center shrink-0">
            <Icon size={17} className="text-[#8E406F]" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
          {description && <p className="text-xs text-[#737373] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// Labelled input field matching AdminManagementPage style
function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider"
    >
      {children}
    </label>
  );
}

// Standard text input matching codebase input style
function TextInput({ id, icon: Icon, readOnly, disabled, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none"
        />
      )}
      <input
        id={id}
        readOnly={readOnly}
        disabled={disabled}
        className={`
          w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 text-sm
          border border-[#e2e8f0] rounded-lg bg-[#F8FAFC]
          text-[#333] placeholder:text-[#bbb]
          focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F]
          transition-all
          ${readOnly || disabled ? 'opacity-60 cursor-not-allowed bg-[#F3F4F6]' : ''}
        `}
        {...props}
      />
    </div>
  );
}

// Password field with show/hide toggle
function PasswordInput({ id, value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="new-password"
        className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#8E406F] transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// Primary mauve action button
function PrimaryButton({ children, disabled, loading, onClick, type = 'button', id }) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}

// Danger (rose) button — matching sidebar Sign Out style
function DangerButton({ children, onClick, disabled, id }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// Toast notification — success or error
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isError = type === 'error';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3
        px-4 py-3 rounded-xl shadow-lg text-sm font-medium
        animate-[fadeInUp_0.25s_ease-out]
        ${isError
          ? 'bg-rose-50 border border-rose-200 text-rose-700'
          : 'bg-[#F0FBF5] border border-emerald-200 text-emerald-700'}
      `}
    >
      {isError
        ? <AlertCircle size={16} className="shrink-0" />
        : <Check size={16} className="shrink-0" />
      }
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 text-current opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// Inline error banner (used in password / PIN sections where errors need to persist)
function InlineError({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
      <AlertCircle size={15} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Toggle switch — optimistic, with "Saved ✓" flash
function NotificationToggle({ id, label, description, checked, onChange, saving, saved }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-[#F1E5EC] last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1E293B]">{label}</p>
        {description && <p className="text-xs text-[#737373] mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {saved && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-[fadeInUp_0.2s_ease-out]">
            <Check size={12} /> Saved
          </span>
        )}
        <button
          id={`notif-toggle-${id}`}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          disabled={saving}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8E406F]/30
            ${checked ? 'bg-[#8E406F]' : 'bg-[#e2e8f0]'}
            ${saving ? 'opacity-60' : ''}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
}

// Confirmation dialog modal
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-bold text-[#1E293B]">{title}</h3>
          <p className="text-sm text-[#737373] mt-2">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F1E5EC] bg-[#FAFAFA]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#555] border border-[#e2e8f0] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          {danger ? (
            <DangerButton onClick={onConfirm}>{confirmLabel}</DangerButton>
          ) : (
            <PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: My Profile ──────────────────────────────────────────────────────

function ProfileSection({ user, onShowToast }) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [saving, setSaving] = useState(false);
  const isDirty = fullName.trim() !== (user.fullName || '').trim();

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const res = await updateAdminProfile({ fullName: fullName.trim() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onShowToast(data?.detail || data?.title || 'Failed to update profile.', 'error');
        return;
      }
      // Update localStorage so sidebar name refreshes on next render
      const stored = getStoredUser();
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName: fullName.trim() }));
      onShowToast('Profile updated successfully.', 'success');
    } catch {
      onShowToast('Unable to connect to the server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = getUserInitials(fullName || user.fullName);

  return (
    <SettingsCard
      title="My Profile"
      description="Update your display name shown across the admin portal."
      icon={User}
    >
      <div className="space-y-5">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#8E406F]/10 border-2 border-[#e8c4d8] flex items-center justify-center shrink-0">
            <span className="text-[#8E406F] text-lg font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-[#1E293B]">{user.fullName || 'Admin'}</p>
            <p className="text-xs text-[#737373]">{user.email || '—'}</p>
            <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDF0F4] text-[#8E406F] border border-[#e8c4d8]">
              Admin
            </span>
          </div>
        </div>

        <div className="h-px bg-[#F1E5EC]" />

        {/* Editable: Full Name */}
        <div>
          <FieldLabel htmlFor="profile-fullname">Full Name</FieldLabel>
          <TextInput
            id="profile-fullname"
            type="text"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        {/* Read-only: Email */}
        <div>
          <FieldLabel htmlFor="profile-email">Email Address</FieldLabel>
          <TextInput
            id="profile-email"
            type="email"
            icon={User}
            value={user.email || ''}
            readOnly
          />
          <p className="text-xs text-[#999] mt-1.5 flex items-center gap-1">
            <AlertCircle size={11} className="shrink-0 text-[#bbb]" />
            Contact your Super Admin to change your login email address.
          </p>
        </div>

        {/* Photo upload — stubbed, no upload backend exists yet */}
        <div>
          <FieldLabel>Profile Photo</FieldLabel>
          <div className="relative inline-block">
            <button
              type="button"
              disabled
              title="Photo upload coming soon"
              aria-label="Upload profile photo — coming soon"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e8c4d8] bg-[#FDF0F4] text-sm text-[#aaa] cursor-not-allowed opacity-60"
            >
              <Upload size={15} />
              Upload Photo
            </button>
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#8E406F] text-white text-[9px] font-bold rounded-full leading-none">
              Soon
            </span>
          </div>
          <p className="text-xs text-[#bbb] mt-1.5">
            Photo upload will be available in a future update.
          </p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <PrimaryButton
            id="profile-save-btn"
            onClick={handleSave}
            disabled={!isDirty}
            loading={saving}
          >
            <Save size={14} />
            Save Changes
          </PrimaryButton>
          {!isDirty && (
            <p className="text-xs text-[#bbb]">Make a change to enable save.</p>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── Section: Change Password ─────────────────────────────────────────────────

function PasswordSection() {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.current) return 'Please enter your current password.';
    if (form.newPass.length < 8) return 'New password must be at least 8 characters.';
    if (form.newPass === form.current) return 'New password must differ from your current password.';
    if (form.newPass !== form.confirm) return 'New password and confirmation do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await changeAdminPassword({
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail || data?.title || 'Password change failed. Please try again.');
        return;
      }
      setSuccess('Password changed successfully. Please use your new password next time you log in.');
      setForm({ current: '', newPass: '', confirm: '' });
    } catch {
      setError('Unable to connect to the server. Please ensure the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      title="Change Password"
      description="Choose a strong password of at least 8 characters."
      icon={Lock}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <FieldLabel htmlFor="pw-current">Current Password</FieldLabel>
          <PasswordInput
            id="pw-current"
            value={form.current}
            onChange={handleChange('current')}
            placeholder="Enter current password"
            disabled={saving}
          />
        </div>
        <div>
          <FieldLabel htmlFor="pw-new">New Password</FieldLabel>
          <PasswordInput
            id="pw-new"
            value={form.newPass}
            onChange={handleChange('newPass')}
            placeholder="Min. 8 characters"
            disabled={saving}
          />
        </div>
        <div>
          <FieldLabel htmlFor="pw-confirm">Confirm New Password</FieldLabel>
          <PasswordInput
            id="pw-confirm"
            value={form.confirm}
            onChange={handleChange('confirm')}
            placeholder="Re-enter new password"
            disabled={saving}
          />
        </div>

        {/* Inline error — stays visible until user corrects fields */}
        <InlineError message={error} />

        {/* Inline success */}
        {success && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <Check size={15} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="pt-1">
          <PrimaryButton type="submit" loading={saving} id="pw-save-btn">
            <Lock size={14} />
            Update Password
          </PrimaryButton>
        </div>
      </form>
    </SettingsCard>
  );
}

// ─── Slot Machine Digit — with clear highlighted state ───────────────────────
// Each digit "spins" through random numbers before landing on the final value.
function SlotDigit({ finalDigit, delay, spinning }) {
  const [display, setDisplay] = useState('0');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!spinning) {
      setDisplay(finalDigit);
      return;
    }
    // Start spinning immediately
    intervalRef.current = setInterval(() => {
      setDisplay(String(Math.floor(Math.random() * 10)));
    }, 60);
    // After the delay, stop and show the real digit
    const timeout = setTimeout(() => {
      clearInterval(intervalRef.current);
      setDisplay(finalDigit);
    }, delay);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [finalDigit, delay, spinning]);

  return (
    <div
      className={`relative w-16 h-20 bg-gradient-to-b from-[#1a0a12] to-[#2d1520] rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
        spinning
          ? 'border-2 border-[#8E406F]/40 shadow-md'
          : 'border-2 border-[#f3a8ce] shadow-[0_0_20px_rgba(243,168,206,0.5)] ring-1 ring-[#f3a8ce]/30'
      }`}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent rounded-xl pointer-events-none" />
      <span
        className="text-3xl font-extrabold tabular-nums transition-all duration-200"
        style={{
          color: spinning ? '#C5A3B8' : '#FFFFFF',
          textShadow: spinning
            ? 'none'
            : '0 0 10px #FFC1DE, 0 0 22px #F080B8, 0 0 35px #8E406F',
          transform: spinning ? 'scale(0.95)' : 'scale(1.08)',
        }}
      >
        {display}
      </span>
    </div>
  );
}

// ─── Section: Secure PIN Management ──────────────────────────────────────────
//
// Flow:
//   'idle'      → shows PIN status + "Change PIN" button
//   'verify'    → enter current PIN → click "Generate New PIN"
//   'spinning'  → slot machine animation runs while candidate PIN is generated (NOT saved)
//   'revealed'  → new PIN candidate shown; Copy / Try Again / Save & Done
//   'success'   → confirmation banner after user clicks "Save & Done"
//   'inuse'     → PIN collision — "Pin is in use" error, Try Again visible

function PinSection() {
  const [step, setStep] = useState('idle');
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [verifiedCurrentPin, setVerifiedCurrentPin] = useState('');
  const [currentPinError, setCurrentPinError] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  // Slot machine state
  const [generatedPin, setGeneratedPin] = useState(''); // 4-char string, e.g. '7392'
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Total time for all 4 digits to land (matches slot machine timing)
  const SPIN_TOTAL_MS = 800 + 4 * 400 + 300;

  const resetToIdle = () => {
    setStep('idle');
    setCurrentPin(['', '', '', '']);
    setVerifiedCurrentPin('');
    setCurrentPinError(false);
    setError('');
    setGeneratedPin('');
    setSlotSpinning(false);
    setCopied(false);
    setSavingPin(false);
  };

  // Step 1: verify current PIN, then trigger generation of candidate PIN
  const handleGenerate = async () => {
    const cur = currentPin.join('');
    if (cur.length < 4) {
      setCurrentPinError(true);
      setError('Please enter your full 4-digit current PIN.');
      return;
    }
    setError('');
    setCurrentPinError(false);
    setVerifying(true);

    try {
      const verifyRes = await verifyAdminPin({ currentPin: cur });
      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        setCurrentPinError(true);
        if (verifyRes.status === 404) {
          setError('The PIN verify endpoint was not found on the server (HTTP 404). Please ensure the backend is up to date.');
        } else {
          setError(data?.detail || data?.title || 'Incorrect current PIN. Please try again.');
        }
        return;
      }

      // Store verified PIN so subsequent "Try Again" and "Save & Done" can use it
      setVerifiedCurrentPin(cur);

      // PIN verified — start spinning animation, then call generate candidate endpoint
      setStep('spinning');
      setSlotSpinning(true);
      setGeneratedPin('????'); // placeholder while spinning

      const genRes = await generateCandidateAdminPin({ currentPin: cur });
      const genData = await genRes.json().catch(() => ({}));

      if (!genRes.ok) {
        setStep('verify');
        setSlotSpinning(false);
        if (genRes.status === 404) {
          setError('The PIN generate endpoint was not found on the server (HTTP 404). Please ensure the backend is up to date.');
        } else {
          setError(genData?.detail || genData?.title || 'PIN generation failed. Please try again.');
        }
        return;
      }

      // Check uniqueness collision flag from backend
      if (genData?.alreadyInUse) {
        setGeneratedPin(String(genData.pin || '????'));
        setTimeout(() => {
          setSlotSpinning(false);
          setTimeout(() => setStep('inuse'), 400);
        }, SPIN_TOTAL_MS);
        return;
      }

      // Success candidate — let the slot animation complete, then reveal
      const pinStr = String(genData.pin || '');
      setGeneratedPin(pinStr);
      setTimeout(() => {
        setSlotSpinning(false);
        setTimeout(() => setStep('revealed'), 400);
      }, SPIN_TOTAL_MS);
    } catch {
      setStep('verify');
      setSlotSpinning(false);
      setError('Unable to connect to the server. Please ensure the backend is running.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = () => {
    if (generatedPin && generatedPin !== '????') {
      navigator.clipboard.writeText(generatedPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // "Try Again" — generate a new candidate PIN without committing to the DB
  const handleTryAgain = async () => {
    setStep('spinning');
    setSlotSpinning(true);
    setGeneratedPin('????');
    setCopied(false);
    setError('');

    const cur = verifiedCurrentPin || currentPin.join('');
    try {
      const genRes = await generateCandidateAdminPin({ currentPin: cur });
      const genData = await genRes.json().catch(() => ({}));

      if (!genRes.ok) {
        setStep('verify');
        setSlotSpinning(false);
        setError(genData?.detail || genData?.title || 'PIN generation failed. Please try again.');
        return;
      }

      if (genData?.alreadyInUse) {
        setGeneratedPin(String(genData.pin || '????'));
        setTimeout(() => {
          setSlotSpinning(false);
          setTimeout(() => setStep('inuse'), 400);
        }, SPIN_TOTAL_MS);
        return;
      }

      const pinStr = String(genData.pin || '');
      setGeneratedPin(pinStr);
      setTimeout(() => {
        setSlotSpinning(false);
        setTimeout(() => setStep('revealed'), 400);
      }, SPIN_TOTAL_MS);
    } catch {
      setStep('verify');
      setSlotSpinning(false);
      setError('Unable to connect to the server.');
    }
  };

  // Save the new PIN to database when user clicks "Save & Done"
  const handleSaveNewPin = async () => {
    if (!generatedPin || generatedPin === '????') return;
    setSavingPin(true);
    setError('');

    const cur = verifiedCurrentPin || currentPin.join('');
    try {
      const saveRes = await saveAdminPin({
        currentPin: cur,
        newPin: generatedPin,
      });
      const data = await saveRes.json().catch(() => ({}));

      if (!saveRes.ok) {
        setError(data?.detail || data?.title || 'Failed to save new PIN. Please try again.');
        return;
      }

      setStep('success');
    } catch {
      setError('Unable to connect to the server to save your new PIN.');
    } finally {
      setSavingPin(false);
    }
  };

  // Digits for the slot machine — pad/fallback to 4 chars
  const digits = (generatedPin || '????').split('');

  return (
    <SettingsCard
      title="Secure PIN Management"
      description="Your 4-digit PIN is used to confirm high-impact actions such as approving vendors."
      icon={KeyRound}
    >
      {/* ── IDLE ── */}
      {step === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FDF0F4] border border-[#e8c4d8]">
            <Shield size={16} className="text-[#8E406F] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#1E293B]">PIN is set</p>
              <p className="text-xs text-[#737373]">
                Your 4-digit PIN secures critical administrative actions.
              </p>
            </div>
          </div>
          <PrimaryButton id="change-pin-btn" onClick={() => setStep('verify')}>
            <KeyRound size={14} />
            Change PIN
          </PrimaryButton>
        </div>
      )}

      {/* ── VERIFY CURRENT PIN ── */}
      {step === 'verify' && (
        <div className="space-y-5">
          <div>
            <FieldLabel>Current PIN</FieldLabel>
            <p className="text-xs text-[#737373] mb-3">
              Enter your current PIN to verify your identity, then we'll generate a secure new PIN for you.
            </p>
            <PinInput
              id="pin-current-verify"
              value={currentPin}
              onChange={(v) => { setCurrentPin(v); setCurrentPinError(false); setError(''); }}
              hasError={currentPinError}
              disabled={verifying}
              size="lg"
            />
          </div>

          <InlineError message={error} />

          <div className="flex items-center gap-3">
            <PrimaryButton
              id="generate-pin-btn"
              onClick={handleGenerate}
              loading={verifying}
              disabled={verifying}
            >
              <RefreshCw size={14} />
              Generate New PIN
            </PrimaryButton>
            <button
              type="button"
              onClick={resetToIdle}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#555] border border-[#e2e8f0] hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SPINNING + REVEALED ── shared slot machine UI */}
      {(step === 'spinning' || step === 'revealed' || step === 'inuse') && (
        <div className="space-y-6">
          {/* Dark slot machine panel */}
          <div className="rounded-2xl bg-gradient-to-b from-[#1a0a12] to-[#2d1520] px-6 py-8 text-center shadow-xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C5A3B8] mb-5">
              {slotSpinning ? 'Generating Secure PIN…' : 'Your New Secure PIN Candidate'}
            </p>

            {/* Slot digits */}
            <div className="flex items-center justify-center gap-3">
              {digits.map((digit, i) => (
                <SlotDigit
                  key={i}
                  finalDigit={digit === '?' ? String(Math.floor(Math.random() * 10)) : digit}
                  delay={800 + i * 400}
                  spinning={slotSpinning}
                />
              ))}
            </div>

            <p className="text-xs text-[#C5A3B8]/80 mt-5">
              {slotSpinning
                ? 'Please wait...'
                : step === 'inuse'
                  ? '⚠ This PIN is already in use by another admin'
                  : '✓ Candidate generated — click "Save & Done" to confirm and apply it.'}
            </p>
          </div>

          <InlineError message={error} />

          {/* ── PIN in use error ── */}
          {step === 'inuse' && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">PIN is in use</p>
                <p className="text-xs mt-0.5">
                  This PIN is already assigned to another admin. Click <strong>Try Again</strong> below to generate a different one.
                </p>
              </div>
            </div>
          )}

          {/* Actions — only visible after animation finishes */}
          {!slotSpinning && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Copy */}
              <button
                id="copy-pin-btn"
                type="button"
                onClick={handleCopy}
                disabled={step === 'inuse' || savingPin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#F1E5EC] bg-[#FDF0F4] text-sm font-semibold text-[#8E406F] hover:bg-[#8E406F] hover:text-white transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                {copied
                  ? <><CheckCheck size={15} className="text-emerald-500" /> Copied!</>
                  : <><Copy size={15} /> Copy PIN</>}
              </button>

              {/* Try Again — generates a fresh candidate PIN */}
              <button
                id="try-again-pin-btn"
                type="button"
                onClick={handleTryAgain}
                disabled={savingPin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm font-semibold text-[#555] hover:bg-[#F3F4F6] transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Try Again
              </button>

              {/* Save & Done — commits candidate PIN to DB */}
              {step === 'revealed' && (
                <button
                  id="save-pin-btn"
                  type="button"
                  onClick={handleSaveNewPin}
                  disabled={savingPin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm disabled:opacity-50"
                >
                  {savingPin ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Save & Done
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">PIN changed successfully</p>
              <p className="text-xs text-emerald-600">Your new PIN is saved and active. Keep it safe — it confirms high-impact actions.</p>
            </div>
          </div>
          <PrimaryButton id="change-pin-again-btn" onClick={resetToIdle}>
            <KeyRound size={14} />
            Change PIN Again
          </PrimaryButton>
        </div>
      )}
    </SettingsCard>

  );
}

// ─── Section: Notification Preferences ───────────────────────────────────────

const DEFAULT_NOTIFICATIONS = {
  newVendorPending: true,
  flaggedContent: true,
  customerComplaint: true,
  // TODO: This toggle depends on a backend `hasApprovalPermissions` field in the
  // admin profile. Until that field exists on GET /api/admin/me, the toggle is
  // shown to all admins unconditionally as a best-effort placeholder.
  aiWorkflowApproval: false,
  weeklySummary: true,
};

const NOTIFICATION_DEFS = [
  { id: 'newVendorPending',   label: 'New vendor pending review',          description: 'Notify me when a new vendor listing is submitted for approval.' },
  { id: 'flaggedContent',     label: 'Flagged content reported',           description: 'Notify me when content is flagged by users or automated systems.' },
  { id: 'customerComplaint',  label: 'Customer complaint submitted',       description: 'Notify me when a customer files a complaint through the portal.' },
  { id: 'aiWorkflowApproval', label: 'AI workflow requires my approval',   description: 'Notify me when an AI-moderated action needs human confirmation. (Depends on approval permission — see code comment).' },
  { id: 'weeklySummary',      label: 'Weekly summary email',               description: 'Receive a weekly digest of key metrics and activity on Mondays.' },
];

function NotificationsSection({ onShowToast }) {
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATIONS);
  // Per-toggle saving & saved flash state
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  const handleToggle = useCallback(async (id, value) => {
    // Optimistic update
    setPrefs((p) => ({ ...p, [id]: value }));
    setSaving((s) => ({ ...s, [id]: true }));

    try {
      const res = await updateNotificationPrefs({ [id]: value });
      if (!res.ok) {
        // Revert on failure
        setPrefs((p) => ({ ...p, [id]: !value }));
        onShowToast('Failed to save notification preference.', 'error');
        return;
      }
      // Show "Saved ✓" flash for 2s
      setSaved((s) => ({ ...s, [id]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000);
    } catch {
      setPrefs((p) => ({ ...p, [id]: !value }));
      onShowToast('Unable to connect to the server.', 'error');
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }, [onShowToast]);

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Control which events send you personal notifications. These are your preferences only and do not affect other admins."
      icon={Bell}
    >
      <div className="-mt-1">
        {NOTIFICATION_DEFS.map((def) => (
          <NotificationToggle
            key={def.id}
            id={def.id}
            label={def.label}
            description={def.description}
            checked={prefs[def.id]}
            onChange={(val) => handleToggle(def.id, val)}
            saving={saving[def.id]}
            saved={saved[def.id]}
          />
        ))}
      </div>
    </SettingsCard>
  );
}

// ─── Section: Session & Device Management ────────────────────────────────────

function SessionSection({ onShowToast }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { browser, os } = parseBrowserInfo();
  const loginTime = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleRevoke = async () => {
    setShowConfirm(false);
    setRevoking(true);
    try {
      const res = await revokeOtherSessions();
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onShowToast(data?.detail || 'Failed to revoke sessions.', 'error');
        return;
      }
      onShowToast('All other sessions have been revoked.', 'success');
    } catch {
      onShowToast('Unable to connect to the server.', 'error');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          title="Log out all other sessions?"
          message="This will immediately invalidate all active sessions on other devices or browsers. You will remain logged in here."
          confirmLabel="Yes, revoke all"
          danger
          onConfirm={handleRevoke}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <SettingsCard
        title="Session & Device Management"
        description="Your current active session. Real-time session data requires the sessions API endpoint."
        icon={Monitor}
      >
        <div className="space-y-4">
          {/* Current session card */}
          <div className="border border-[#F1E5EC] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FDF0F4] border-b border-[#F1E5EC]">
              <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wider">Current Session</p>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active now
              </span>
            </div>
            <div className="px-4 py-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-[#333]">
                <Monitor size={14} className="text-[#aaa] shrink-0" />
                <span className="font-medium">{browser}</span>
                <span className="text-[#bbb]">·</span>
                <span className="text-[#737373]">{os}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#737373]">
                <Clock size={13} className="text-[#aaa] shrink-0" />
                <span>Signed in: {loginTime}</span>
              </div>
              <p className="text-[10px] text-[#bbb] pt-1">
                ⓘ Device info is best-effort browser detection and is not server-verified.
              </p>
            </div>
          </div>

          {/* Other sessions — not rendered because no real backend sessions list is available.
              Rendering fake sessions would misrepresent real security data. */}
          <p className="text-xs text-[#999] italic">
            Only your current session is shown. A full session history requires
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#666] font-mono text-[10px]">GET /api/admin/me/sessions</code>
            to be implemented on the backend.
          </p>

          <DangerButton
            id="revoke-sessions-btn"
            onClick={() => setShowConfirm(true)}
            disabled={revoking}
          >
            <LogOut size={14} />
            {revoking ? 'Revoking…' : 'Log out of all other sessions'}
          </DangerButton>
        </div>
      </SettingsCard>
    </>
  );
}

// ─── Section: My Activity ─────────────────────────────────────────────────────

function ActivitySection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: This queries GET /api/admin/me/activity — the same endpoint the Activity Log
    // sidebar page should use, filtered to the currently logged-in admin (adminId=self).
    // If the Activity Log page doesn't yet support per-admin filtering,
    // flag this as a backend gap rather than returning an unfiltered log.
    let cancelled = false;
    setLoading(true);
    getMyRecentActivity()
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message.includes('fetch')
              ? 'Unable to connect to the server. Is the backend running?'
              : `Activity log unavailable (${err.message}). The backend endpoint GET /api/admin/me/activity may not be implemented yet.`,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <SettingsCard
      title="My Activity"
      description="High-impact actions you have personally authorized, in reverse chronological order."
      icon={Activity}
    >
      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#999] py-4">
          <span className="h-4 w-4 border-2 border-[#e2e8f0] border-t-[#8E406F] rounded-full animate-spin" />
          Loading activity…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <p className="text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-12 w-12 rounded-full bg-[#FDF0F4] flex items-center justify-center mb-3">
            <Activity size={22} className="text-[#e8c4d8]" />
          </div>
          <p className="text-sm font-medium text-[#555]">No high-impact actions yet</p>
          <p className="text-xs text-[#999] mt-1">
            Actions you authorize (vendor approvals, rejections, etc.) will appear here.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="divide-y divide-[#F1E5EC]">
          {items.map((item, i) => (
            <li key={item.id ?? i} className="py-3.5 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#FDF0F4] border border-[#e8c4d8] flex items-center justify-center shrink-0 mt-0.5">
                <Activity size={14} className="text-[#8E406F]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#1E293B] font-medium leading-snug">
                  {item.action || item.description || 'Action performed'}
                </p>
                <p className="text-xs text-[#999] mt-0.5">
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}

// ─── Navigation Tab Definition ────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'My Profile',               icon: User },
  { id: 'password',      label: 'Change Password',           icon: Lock },
  { id: 'pin',           label: 'Secure PIN',                icon: KeyRound },
  { id: 'notifications', label: 'Notifications',             icon: Bell },
  { id: 'sessions',      label: 'Sessions',                  icon: Monitor },
  { id: 'activity',      label: 'My Activity',               icon: Activity },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null); // { message, type }

  const user = getStoredUser();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Settings
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Manage your profile, security, and notification preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left sub-navigation ── */}
          <nav
            aria-label="Settings sections"
            className="w-full lg:w-52 shrink-0 bg-white rounded-2xl border border-[#F1E5EC] shadow-sm overflow-hidden"
          >
            <ul className="py-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      id={`settings-tab-${tab.id}`}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${isActive
                          ? 'bg-[#FDF0F4] text-[#8E406F] font-semibold border-r-2 border-[#8E406F]'
                          : 'text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F]'}
                      `}
                    >
                      <Icon size={15} className={`shrink-0 ${isActive ? 'text-[#8E406F]' : 'text-[#999]'}`} />
                      <span className="text-left">{tab.label}</span>
                      {isActive && <ChevronRight size={13} className="ml-auto text-[#8E406F]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Active section content ── */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile'       && <ProfileSection user={user} onShowToast={showToast} />}
            {activeTab === 'password'      && <PasswordSection />}
            {activeTab === 'pin'           && <PinSection />}
            {activeTab === 'notifications' && <NotificationsSection onShowToast={showToast} />}
            {activeTab === 'sessions'      && <SessionSection onShowToast={showToast} />}
            {activeTab === 'activity'      && <ActivitySection />}
          </div>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMED BACKEND ENDPOINTS (unverified — hand this list to the ASP.NET Core owner)
//
// 1. PUT  /api/admin/me
//    Body: { fullName: string }
//    Updates the currently logged-in admin's profile fields.
//    Should return 200 OK on success; 400/409 with ProblemDetails on error.
//
// 2. POST /api/admin/me/change-password
//    Body: { currentPassword: string, newPassword: string }
//    Changes the admin's login password.
//    Should return 200 OK; 400 if currentPassword is wrong.
//
// 3. POST /api/admin/me/pin
//    Body: { currentPin: string (4 digits), newPin: string (4 digits) }
//    Changes the admin's secure PIN.
//    Should return 200 OK; 400 if currentPin is wrong.
//    Never expose the PIN value in any response body.
//
// 4. PUT  /api/admin/me/notifications
//    Body: { newVendorPending: bool, flaggedContent: bool, customerComplaint: bool,
//            aiWorkflowApproval: bool, weeklySummary: bool }
//    Persists this admin's notification preferences.
//    Should also expose GET /api/admin/me/notifications to load existing prefs on mount.
//
// 5. POST /api/admin/me/sessions/revoke-others
//    No body required (token identifies the caller).
//    Invalidates all active JWT tokens for this admin except the one making the request.
//
// 6. GET  /api/admin/me/activity
//    Returns reverse-chronological list of high-impact actions by this admin.
//    Expected shape: [{ id, action, timestamp, details? }, ...]
//    This should reuse / filter the existing audit log that the "Activity Log"
//    sidebar page already uses. If that page doesn't support per-admin filtering,
//    add an optional ?adminId=me query param to the audit log endpoint.
//
// 7. (Nice to have) GET /api/admin/me
//    Should include a `pinLastChangedAt` ISO date field so the PIN section
//    can display "PIN last changed: [date]". Currently stubbed as null.
// ─────────────────────────────────────────────────────────────────────────────
