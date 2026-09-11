import { useState, useEffect, useRef, useCallback } from 'react';
import { UserPlus, Shield, Mail, Lock, User, Eye, EyeOff, RefreshCw, X, Check, AlertCircle, Copy, CheckCheck } from 'lucide-react';

// ============================================================
// AdminManagementPage.jsx — Oleena Wedding Planner
// Super Admin-only page to:
//   1. View all registered admins (fetched from database)
//   2. Register new admins with auto-generated secure PIN
//   3. Slot machine PIN reveal animation on successful creation
// ============================================================

const API_BASE = 'http://localhost:5131/api/admin-management';

// Helper to get JWT token for authenticated requests
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

// ─── Slot Machine Digit Component ────────────────────────────────────────
// Each digit "spins" through random numbers before landing on the final value
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
    <div className="relative w-16 h-20 bg-gradient-to-b from-[#1a0a12] to-[#2d1520] rounded-xl border-2 border-[#8E406F]/40 flex items-center justify-center overflow-hidden shadow-lg">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl pointer-events-none" />
      <span
        className="text-3xl font-bold tabular-nums transition-all duration-150"
        style={{
          color: spinning ? '#C5A3B8' : '#F0C0D8',
          textShadow: spinning ? 'none' : '0 0 20px rgba(240,192,216,0.6)',
          transform: spinning ? 'scaleY(0.95)' : 'scaleY(1)',
        }}
      >
        {display}
      </span>
    </div>
  );
}

// ─── Slot Machine PIN Reveal Modal ───────────────────────────────────────
function PinRevealModal({ pin, adminName, onClose }) {
  const [spinning, setSpinning] = useState(true);
  const [copied, setCopied] = useState(false);
  const pinStr = String(pin || '');
  const digits = pinStr.split('');

  useEffect(() => {
    // After all digits have landed (last digit delay + buffer), mark as done
    const totalDuration = 800 + digits.length * 400 + 300;
    const timer = setTimeout(() => setSpinning(false), totalDuration);
    return () => clearTimeout(timer);
  }, [digits.length]);

  const handleCopy = () => {
    if (pinStr) {
      navigator.clipboard.writeText(pinStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8E406F] to-[#6B2F54] px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-3">
            <Shield size={28} className="text-white" />
          </div>
          <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Created Successfully
          </h3>
          <p className="text-white/70 text-sm mt-1">{adminName}</p>
        </div>

        {/* Slot Machine */}
        <div className="px-6 py-8">
          <p className="text-center text-xs text-[#737373] mb-4 font-semibold tracking-wider uppercase">
            Auto-Generated Secure Admin PIN
          </p>
          <div className="flex items-center justify-center gap-3">
            {digits.map((digit, i) => (
              <SlotDigit
                key={i}
                finalDigit={digit}
                delay={800 + i * 400}
                spinning={spinning}
              />
            ))}
          </div>

          <p className="text-center text-xs text-[#999] mt-4">
            {spinning
              ? 'Generating secure PIN with slot machine...'
              : '✓ Secure PIN generated — please save or share this with the admin'}
          </p>

          {!spinning && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#F1E5EC] bg-[#FDF0F4] text-xs font-semibold text-[#8E406F] hover:bg-[#8E406F] hover:text-white transition-all shadow-sm"
              >
                {copied ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy PIN'}
              </button>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="px-6 pb-6 flex justify-center">
          <button
            onClick={onClose}
            disabled={spinning}
            className={`
              flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${spinning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#8E406F] text-white hover:bg-[#73325A] active:scale-95 shadow-md'}
            `}
          >
            <Check size={16} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Admin Modal ────────────────────────────────────────────────
function RegisterAdminModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.title || 'Failed to create admin.');
        return;
      }

      // Success — pass the created admin back (includes PIN)
      onCreated(data);
    } catch {
      setError('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#8E406F]/10 flex items-center justify-center">
              <UserPlus size={20} className="text-[#8E406F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#333]">Register New Admin</h3>
              <p className="text-xs text-[#999]">A secure PIN will be auto-generated</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. John Smith"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. admin@oleena.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#8E406F]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#8E406F] text-white hover:bg-[#73325A] active:scale-[0.98] shadow-md'}
            `}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Creating Admin...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Register Admin
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [copiedPinId, setCopiedPinId] = useState(null);

  // Fetch admins from the backend
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data?.detail || 'Failed to load admins.');
        return;
      }
      const data = await res.json();
      setAdmins(data);
    } catch {
      setFetchError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Called when a new admin is successfully created
  const handleAdminCreated = (admin) => {
    setShowRegisterModal(false);
    setCreatedAdmin(admin);
    setShowPinModal(true);
    // Refresh admin list in the background
    fetchAdmins();
  };

  const handlePinModalClose = () => {
    setShowPinModal(false);
    setCreatedAdmin(null);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Get initials from a name
  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#333]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Admin Management
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Manage administrator accounts and access credentials.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-md"
        >
          <UserPlus size={16} />
          Register Admin
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5">
          <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Total Admins</p>
          <p className="text-2xl font-bold text-[#333] mt-1">{admins.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5">
          <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {admins.filter((a) => a.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5">
          <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Super Admins</p>
          <p className="text-2xl font-bold text-[#8E406F] mt-1">
            {admins.filter((a) => a.accessLevel === 'SuperAdmin').length}
          </p>
        </div>
      </div>

      {/* ── Admin Table ── */}
      <div className="bg-white rounded-xl border border-[#F1E5EC] overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#F1E5EC] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#333]">All Administrators</h2>
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-1.5 text-xs text-[#8E406F] hover:text-[#73325A] font-medium transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Loading / Error / Empty / Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-[#8E406F]" />
            <span className="ml-3 text-sm text-[#999]">Loading admins...</span>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-16 px-6">
            <div className="text-center">
              <AlertCircle size={32} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-500">{fetchError}</p>
              <button
                onClick={fetchAdmins}
                className="mt-3 text-xs text-[#8E406F] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Shield size={32} className="mx-auto text-[#ddd] mb-2" />
              <p className="text-sm text-[#999]">No administrators found.</p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-3 text-xs text-[#8E406F] font-medium hover:underline"
              >
                Register the first admin
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFBFC] text-[#999] text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-semibold">Admin</th>
                  <th className="text-left px-6 py-3 font-semibold">Email</th>
                  <th className="text-left px-6 py-3 font-semibold">Access Level</th>
                  <th className="text-left px-6 py-3 font-semibold">Secure PIN</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5EC]">
                {admins.map((admin) => (
                  <tr key={admin.adminId} className="hover:bg-[#FDF0F4]/50 transition-colors">
                    {/* Name + Avatar */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center shrink-0">
                          <span className="text-[#8E406F] text-xs font-bold">
                            {getInitials(admin.fullName)}
                          </span>
                        </div>
                        <span className="font-medium text-[#333]">{admin.fullName}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-3 text-[#555]">{admin.email}</td>
                    {/* Access Level */}
                    <td className="px-6 py-3">
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${admin.accessLevel === 'SuperAdmin'
                            ? 'bg-[#8E406F]/10 text-[#8E406F]'
                            : 'bg-blue-50 text-blue-600'}
                        `}
                      >
                        <Shield size={11} />
                        {admin.accessLevel}
                      </span>
                    </td>
                    {/* PIN */}
                    <td className="px-6 py-3">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-[#8E406F] bg-[#FDF0F4] px-2 py-0.5 rounded text-xs font-bold tracking-widest">
                          {admin.securePin}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(admin.securePin);
                            setCopiedPinId(admin.adminId);
                            setTimeout(() => setCopiedPinId(null), 1800);
                          }}
                          title={copiedPinId === admin.adminId ? 'Copied!' : 'Copy PIN'}
                          className="p-1 text-[#aaa] hover:text-[#8E406F] rounded transition-colors"
                        >
                          {copiedPinId === admin.adminId ? (
                            <CheckCheck size={13} className="text-emerald-500" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-3">
                      <span
                        className={`
                          inline-flex items-center gap-1 text-xs font-medium
                          ${admin.isActive ? 'text-emerald-600' : 'text-red-400'}
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Created */}
                    <td className="px-6 py-3 text-[#999] text-xs">{formatDate(admin.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showRegisterModal && (
        <RegisterAdminModal
          onClose={() => setShowRegisterModal(false)}
          onCreated={handleAdminCreated}
        />
      )}
      {showPinModal && createdAdmin && (
        <PinRevealModal
          pin={createdAdmin.securePin}
          adminName={createdAdmin.fullName}
          onClose={handlePinModalClose}
        />
      )}
    </div>
  );
}
