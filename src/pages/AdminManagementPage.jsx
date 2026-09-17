import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  UserPlus,
  Shield,
  Mail,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Copy,
  CheckCheck,
  Pencil,
  Trash2,
  Search,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  KeyRound,
  Phone,
  Lock,
} from 'lucide-react';

// ============================================================
// AdminManagementPage.jsx — Oleena Wedding Planner
// Super Admin CRUD platform (Consolidated Admins Table):
//   1. Consolidated Admins table (No plaintext PIN stored or exposed)
//   2. Register new admin with separate First/Last name & auto-generated PIN
//   3. Slot machine / One-Time PIN reveal modal with security warning
//   4. Strict 10-digit phone number enforcement
//   5. Dedicated Regenerate PIN confirmation modal calling /regenerate-pin
//   6. View Details, Edit Admin, and Deactivate/Delete Admin
//   7. Self-deletion prevention for active Super Admin
//   8. Dynamic Stat Cards bound to /api/admin/metrics
// ============================================================

const API_BASE = 'http://localhost:5131/api/admin';

// Helper to get JWT token for authenticated requests
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// Helper to get currently logged-in user
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

// ─── Slot Machine Digit Component ────────────────────────────────────────
function SlotDigit({ finalDigit, delay, spinning }) {
  const [display, setDisplay] = useState('0');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!spinning) {
      setDisplay(finalDigit);
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplay(String(Math.floor(Math.random() * 10)));
    }, 60);

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

// ─── One-Time PIN Reveal Modal ───────────────────────────────────────────
function OneTimePinModal({ pin, adminName, isRegeneration = false, onClose }) {
  const [spinning, setSpinning] = useState(true);
  const [copied, setCopied] = useState(false);
  const pinStr = String(pin || '');
  const digits = pinStr.split('');

  useEffect(() => {
    const totalDuration = 600 + digits.length * 300 + 200;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-100 max-h-[90vh] overflow-y-auto overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-[#8E406F] to-[#6B2F54] px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-3">
            <KeyRound size={28} className="text-white" />
          </div>
          <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isRegeneration ? 'Secure PIN Regenerated' : 'Admin Created Successfully!'}
          </h3>
          <p className="text-white/80 text-sm mt-1">{adminName}</p>
        </div>

        <div className="px-6 py-6">
          <p className="text-center text-xs text-[#737373] mb-4 font-semibold tracking-wider uppercase">
            {isRegeneration ? 'New 4-Digit Secure PIN' : '4-Digit Secure PIN'}
          </p>

          <div className="flex items-center justify-center gap-3">
            {digits.map((digit, i) => (
              <SlotDigit
                key={i}
                finalDigit={digit}
                delay={600 + i * 300}
                spinning={spinning}
              />
            ))}
          </div>

          {/* Strict Security Warning */}
          <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">One-Time Display Security Notice</span>
              <span>
                This PIN will never be displayed again. Please securely deliver it to the administrator.
              </span>
            </div>
          </div>

          {!spinning && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#F1E5EC] bg-[#FDF0F4] text-xs font-semibold text-[#8E406F] hover:bg-[#8E406F] hover:text-white transition-all shadow-sm active:scale-95"
              >
                {copied ? <CheckCheck size={15} className="text-emerald-500" /> : <Copy size={15} />}
                {copied ? 'Copied to Clipboard!' : 'Copy PIN'}
              </button>
            </div>
          )}
        </div>

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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'Admin',
    department: 'Administration',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhoneChange = (e) => {
    // Strictly accept only numeric digits, max 10 characters
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phoneNumber: numericOnly }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('First name, last name, email, and password are required.');
      return;
    }

    if (!form.phoneNumber || !/^[0-9]{10}$/.test(form.phoneNumber)) {
      setError('Phone number must be exactly 10 digits with no spaces or symbols.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/administrators`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
          role: form.role,
          department: form.department.trim() || 'Administration',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.title || data?.message || 'Failed to create administrator.');
        return;
      }

      onCreated(data);
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-100 max-h-[90vh] overflow-y-auto overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#8E406F]/10 flex items-center justify-center">
              <UserPlus size={20} className="text-[#8E406F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#333]">Register New Administrator</h3>
              <p className="text-xs text-[#999]">A 4-digit Secure PIN will be automatically generated</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Split Name: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  name="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Sarah"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  name="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Jenkins"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. admin@oleena.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
            </div>
          </div>

          {/* Phone Number (Strict 10 Digits) */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Phone Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="phoneNumber"
                type="tel"
                required
                maxLength={10}
                value={form.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0771234567"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-[#888] mt-1">Accepts exactly 10 digits (e.g. 0771234567). No spaces or symbols.</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Password (Min. 8 characters) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#8E406F] p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Role / Access Level
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
                >
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Administration"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="p-3 bg-[#FDF0F4] border border-[#F1E5EC] rounded-lg text-xs text-[#8E406F] flex items-center gap-2">
            <Shield size={16} className="shrink-0 text-[#8E406F]" />
            <span>A 4-digit Secure PIN will be automatically generated upon creation.</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
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
                Generating Credentials & Admin...
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

// ─── View Admin Modal ────────────────────────────────────────────────────
function ViewAdminModal({ admin, onClose }) {
  if (!admin) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const fullName = admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Administrator';
  const email = admin.email || '—';
  const phone = admin.phoneNumber && admin.phoneNumber.trim() ? admin.phoneNumber : 'Not Provided';
  const department = admin.department || 'Administration';
  const accessLevel = admin.accessLevel || 'Admin';
  const isActive = Boolean(admin.isActive);

  const getInitials = (name) =>
    (name || 'Admin')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-100 max-h-[90vh] overflow-y-auto overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC]">
          <h3 className="text-base font-bold text-[#333]">Administrator Details</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#8E406F]/10 border-2 border-[#8E406F]/20 flex items-center justify-center text-[#8E406F] text-xl font-bold">
              {getInitials(fullName)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#333]">{fullName}</h4>
              <p className="text-xs text-[#737373]">{email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${accessLevel === 'SuperAdmin'
                      ? 'bg-[#8E406F]/10 text-[#8E406F]'
                      : 'bg-blue-50 text-blue-600'
                    }`}
                >
                  <Shield size={12} />
                  {accessLevel}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F1E5EC] pt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-[#555]">
              <span className="flex items-center gap-2 text-xs text-[#888]">
                <Phone size={14} /> Phone Number
              </span>
              <span className="font-medium text-[#333] font-mono text-xs">{phone}</span>
            </div>

            <div className="flex items-center justify-between text-[#555]">
              <span className="flex items-center gap-2 text-xs text-[#888]">
                <Building size={14} /> Department
              </span>
              <span className="font-medium text-[#333]">{department}</span>
            </div>

            <div className="flex items-center justify-between text-[#555]">
              <span className="flex items-center gap-2 text-xs text-[#888]">
                <Lock size={14} /> Security Status
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Lock size={11} className="text-emerald-600" />
                <span>•••• (Encrypted Hash)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[#555]">
              <span className="flex items-center gap-2 text-xs text-[#888]">
                <Calendar size={14} /> Created Date
              </span>
              <span className="font-medium text-[#333]">{formatDate(admin?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-[#F1E5EC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white border border-[#e2e8f0] text-sm font-medium text-[#555] hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Admin Modal ────────────────────────────────────────────────────
function EditAdminModal({ admin, onClose, onUpdated, onRegeneratePinClick }) {
  const [form, setForm] = useState({
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    phoneNumber: admin?.phoneNumber || '',
    accessLevel: admin?.accessLevel || 'Admin',
    isActive: admin?.isActive ?? true,
    department: admin?.department || 'Administration',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhoneChange = (e) => {
    // Strictly accept only numeric digits, max 10 characters
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phoneNumber: numericOnly }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    if (!form.phoneNumber || !/^[0-9]{10}$/.test(form.phoneNumber)) {
      setError('Phone number must be exactly 10 digits with no spaces or symbols.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/administrators/${admin.adminId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          accessLevel: form.accessLevel,
          isActive: form.isActive,
          department: form.department.trim() || 'Administration',
          regeneratePin: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || 'Failed to update administrator.');
        return;
      }

      onUpdated(data);
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-100 max-h-[90vh] overflow-y-auto overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Pencil size={18} className="text-[#8E406F]" />
            <h3 className="text-base font-bold text-[#333]">Edit Administrator</h3>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Phone Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                name="phoneNumber"
                type="tel"
                required
                maxLength={10}
                value={form.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0771234567"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-[#888] mt-1">Accepts exactly 10 digits (e.g. 0771234567). No spaces or symbols.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Role / Access Level
              </label>
              <select
                name="accessLevel"
                value={form.accessLevel}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              >
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
                Account Status
              </label>
              <select
                name="isActive"
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === 'true' }))}
                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
              >
                <option value="true">Active</option>
                <option value="false">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wider">
              Department
            </label>
            <input
              name="department"
              type="text"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Administration"
              className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            />
          </div>

          {/* Regenerate PIN action banner */}
          <div className="p-3.5 bg-[#FDF0F4] border border-[#F1E5EC] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#8E406F] block">Secondary 4-Digit PIN</span>
              <span className="text-[11px] text-[#737373]">
                Hashed in database. You can issue a new PIN anytime.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRegeneratePinClick(admin)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8E406F]/30 bg-white text-xs font-semibold text-[#8E406F] hover:bg-[#8E406F] hover:text-white transition-all shadow-sm active:scale-95"
            >
              <KeyRound size={13} />
              Regenerate PIN
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#8E406F] hover:bg-[#73325A] active:scale-95 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Regenerate PIN Confirmation Modal ──────────────────────────────────
function RegeneratePinConfirmModal({ admin, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!admin) return null;

  const adminName = admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Administrator';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(admin);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <KeyRound size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#333]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Regenerate Secure PIN?
          </h3>
          <p className="text-sm text-[#666] mt-2">
            Are you sure you want to regenerate the secure PIN for <strong className="text-[#333]">{adminName}</strong>?
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg text-left flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              The administrator's existing PIN will be immediately invalidated and replaced with a newly generated 4-digit code.
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F1E5EC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#8E406F] hover:bg-[#73325A] active:scale-95 rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Regenerating...
              </>
            ) : (
              <>
                <KeyRound size={15} /> Regenerate PIN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────
function DeleteAdminModal({ admin, isSelf, onClose, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!admin) return null;

  const adminName = admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Administrator';

  const handleDelete = async () => {
    if (isSelf) return;
    setIsDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/administrators/${admin.adminId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || data?.detail || 'Failed to delete administrator.');
        return;
      }

      onDeleted(admin.adminId);
    } catch {
      setError('Unable to connect to the server.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-2 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#333]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Permanently Delete Administrator?
          </h3>
          <p className="text-sm text-[#666] mt-2">
            Are you sure you want to permanently delete <strong className="text-[#333]">{adminName}</strong>?
            This action will permanently remove both their administrator profile and user account from PostgreSQL.
          </p>

          {isSelf && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>You cannot delete your own account.</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-left">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#F1E5EC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSelf}
            className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 ${isSelf
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'text-white bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
          >
            {isDeleting ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} /> Permanently Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast Notification Component ────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-xl border border-[#F1E5EC] animate-in slide-in-from-bottom-5 duration-200">
      {type === 'success' ? (
        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-500 shrink-0" />
      )}
      <p className="text-sm font-medium text-[#333]">{message}</p>
      <button onClick={onClose} className="text-[#aaa] hover:text-[#333] transition-colors ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [metrics, setMetrics] = useState({ totalAdmins: 0, activeAdmins: 0, superAdmins: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Active Targets
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [oneTimePinData, setOneTimePinData] = useState(null);
  const [viewAdminTarget, setViewAdminTarget] = useState(null);
  const [editAdminTarget, setEditAdminTarget] = useState(null);
  const [regenPinTarget, setRegenPinTarget] = useState(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState(null);

  // Notifications
  const [toast, setToast] = useState(null);

  const currentUser = useMemo(() => getCurrentUser(), []);

  // Fetch metrics from backend
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      // ignore metrics background failure
    }
  }, []);

  // Fetch admins list from backend
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (roleFilter !== 'All') params.append('role', roleFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const url = `${API_BASE}/administrators?${params.toString()}`;
      const res = await fetch(url, { headers: getAuthHeaders() });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data?.detail || data?.message || 'Failed to load administrators.');
        return;
      }

      const data = await res.json();
      setAdmins(data);
    } catch {
      setFetchError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
    fetchAdmins();
  }, [fetchMetrics, fetchAdmins]);

  // Handler: after new admin registered
  const handleAdminCreated = (created) => {
    setShowRegisterModal(false);
    setOneTimePinData({
      pin: created.generatedPin,
      name: created.fullName,
      isRegeneration: false,
    });
    setToast({ message: `Administrator ${created.fullName} created successfully!` });
    fetchAdmins();
    fetchMetrics();
  };

  // Handler: after admin updated
  const handleAdminUpdated = (updated) => {
    setEditAdminTarget(null);
    setToast({ message: `Administrator ${updated.fullName} updated successfully!` });
    fetchAdmins();
    fetchMetrics();
  };

  // Handler: trigger PIN regeneration confirmation
  const handleOpenRegenModal = (admin) => {
    if (editAdminTarget) setEditAdminTarget(null);
    setRegenPinTarget(admin);
  };

  // Handler: execute PIN regeneration API call
  const handleRegeneratePin = async (admin) => {
    try {
      const res = await fetch(`${API_BASE}/administrators/${admin.adminId}/regenerate-pin`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ message: data?.message || 'Failed to regenerate PIN.', type: 'error' });
        return;
      }

      const data = await res.json();
      setRegenPinTarget(null);

      setOneTimePinData({
        pin: data.newGeneratedPin,
        name: data.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
        isRegeneration: true,
      });

      setToast({ message: `Secure PIN regenerated for ${data.fullName}!` });
      fetchAdmins();
    } catch {
      setToast({ message: 'Unable to connect to the server to regenerate PIN.', type: 'error' });
    }
  };

  // Handler: after admin hard deleted
  const handleAdminDeleted = (deletedId) => {
    setDeleteAdminTarget(null);
    setAdmins((prev) => prev.filter((a) => a.adminId !== deletedId && a.userId !== deletedId));
    setToast({ message: 'Administrator permanently deleted from the database!' });
    fetchMetrics();
  };

  // Check if a row represents the currently logged in Super Admin
  const isCurrentLoggedInUser = (admin) => {
    if (!currentUser || !admin) return false;
    if (
      currentUser.userId &&
      (String(currentUser.userId) === String(admin.adminId) ||
        String(currentUser.userId) === String(admin.userId))
    ) {
      return true;
    }
    if (
      currentUser.email &&
      admin.email &&
      currentUser.email.toLowerCase() === admin.email.toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getInitials = (name) =>
    (name || 'Admin')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#333]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Admin Management
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Super Admin portal to manage platform administrator accounts, roles, and security credentials.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-md shrink-0"
        >
          <UserPlus size={16} />
          Register Admin
        </button>
      </div>

      {/* ── Stat Cards (bound to /api/admin/metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Total Admins</p>
            <div className="w-8 h-8 rounded-full bg-[#8E406F]/10 flex items-center justify-center text-[#8E406F]">
              <User size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#333] mt-2">{metrics.totalAdmins}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Active Accounts</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Check size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{metrics.activeAdmins}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#F1E5EC] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">Super Admins</p>
            <div className="w-8 h-8 rounded-full bg-[#8E406F]/10 flex items-center justify-center text-[#8E406F]">
              <Shield size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#8E406F] mt-2">{metrics.superAdmins}</p>
        </div>
      </div>

      {/* ── Table & Search Container ── */}
      <div className="bg-white rounded-xl border border-[#F1E5EC] overflow-hidden shadow-sm">
        {/* Search & Filter Toolbar */}
        <div className="px-6 py-4 border-b border-[#F1E5EC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#666]">
              <Filter size={13} className="text-[#8E406F]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:border-[#8E406F]"
              >
                <option value="All">All Roles</option>
                <option value="SuperAdmin">Super Admin</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] focus:outline-none focus:border-[#8E406F]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => {
                fetchAdmins();
                fetchMetrics();
              }}
              title="Refresh list"
              className="p-2 text-[#8E406F] hover:bg-[#FDF0F4] rounded-lg transition-colors border border-[#F1E5EC]"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-16" />
                <div className="h-6 bg-gray-100 rounded w-16" />
                <div className="h-8 bg-gray-100 rounded w-24" />
              </div>
            ))}
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
              <p className="text-sm text-[#999]">No administrators found matching criteria.</p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-3 text-xs text-[#8E406F] font-medium hover:underline"
              >
                Register an administrator
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFBFC] text-[#999] text-xs uppercase tracking-wider border-b border-[#F1E5EC]">
                  <th className="text-left px-6 py-3.5 font-semibold">Administrator</th>
                  <th className="text-left px-6 py-3.5 font-semibold">Email</th>
                  <th className="text-left px-6 py-3.5 font-semibold">Phone Number</th>
                  <th className="text-left px-6 py-3.5 font-semibold">Access Level</th>
                  <th className="text-left px-6 py-3.5 font-semibold">Status</th>
                  <th className="text-left px-6 py-3.5 font-semibold">Created Date</th>
                  <th className="text-right px-6 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5EC]">
                {admins.map((admin) => {
                  const isSelf = isCurrentLoggedInUser(admin);
                  const fullName = admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Administrator';

                  return (
                    <tr key={admin.adminId} className="hover:bg-[#FDF0F4]/40 transition-colors">
                      {/* Name + Avatar */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#8E406F]/10 border border-[#e8c4d8] flex items-center justify-center shrink-0">
                            <span className="text-[#8E406F] text-xs font-bold">
                              {getInitials(fullName)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#333]">{fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#8E406F]/10 text-[#8E406F]">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#888] block">{admin.department || 'Administration'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 text-[#555]">{admin.email}</td>

                      {/* Phone Number */}
                      <td className="px-6 py-3.5 text-[#555]">
                        {admin.phoneNumber ? (
                          <span className="font-mono text-xs">{admin.phoneNumber}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Access Level */}
                      <td className="px-6 py-3.5">
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

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`
                            inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                            ${admin.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-3.5 text-[#888] text-xs">{formatDate(admin.createdAt)}</td>

                      {/* Action Buttons: View, Edit, Regenerate PIN, Delete */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setViewAdminTarget(admin)}
                            title="View Details"
                            className="p-1.5 text-gray-500 hover:text-[#8E406F] hover:bg-[#FDF0F4] rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setEditAdminTarget(admin)}
                            title="Edit Administrator"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Regenerate PIN */}
                          <button
                            type="button"
                            onClick={() => handleOpenRegenModal(admin)}
                            title="Regenerate 4-Digit Secure PIN"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <KeyRound size={16} />
                          </button>

                          {/* Delete (Disabled for self) */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setDeleteAdminTarget(admin)}
                            title={isSelf ? 'Cannot delete your active account' : 'Deactivate / Delete Administrator'}
                            className={`
                              p-1.5 rounded-lg transition-colors
                              ${isSelf
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}
                            `}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {oneTimePinData && (
        <OneTimePinModal
          pin={oneTimePinData.pin}
          adminName={oneTimePinData.name}
          isRegeneration={oneTimePinData.isRegeneration}
          onClose={() => setOneTimePinData(null)}
        />
      )}

      {viewAdminTarget && (
        <ViewAdminModal
          admin={viewAdminTarget}
          onClose={() => setViewAdminTarget(null)}
        />
      )}

      {editAdminTarget && (
        <EditAdminModal
          admin={editAdminTarget}
          onClose={() => setEditAdminTarget(null)}
          onUpdated={handleAdminUpdated}
          onRegeneratePinClick={handleOpenRegenModal}
        />
      )}

      {regenPinTarget && (
        <RegeneratePinConfirmModal
          admin={regenPinTarget}
          onClose={() => setRegenPinTarget(null)}
          onConfirm={handleRegeneratePin}
        />
      )}

      {deleteAdminTarget && (
        <DeleteAdminModal
          admin={deleteAdminTarget}
          isSelf={isCurrentLoggedInUser(deleteAdminTarget)}
          onClose={() => setDeleteAdminTarget(null)}
          onDeleted={handleAdminDeleted}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || 'success'}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
