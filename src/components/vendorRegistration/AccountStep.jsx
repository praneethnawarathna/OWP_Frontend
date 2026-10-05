/**
 * AccountStep.jsx — Step 1: Vendor Account & Credentials
 * Reuses FormField from src/components/common/FormField.jsx
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Phone } from 'lucide-react';
import FormField from '../common/FormField';
import { calculatePasswordStrength, sanitizePhoneInput } from './validation';

export default function AccountStep({
  formData,
  errors = {},
  touched = {},
  onChange,
  onBlur,
  isGoogleFlow = false,
  googlePrefill = null,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pwdStrength = calculatePasswordStrength(formData.password);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Google Flow Banner */}
      {isGoogleFlow && (
        <div className="p-4 rounded-xl border border-[#8E406F]/30 bg-[#FDF0F4] flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#8E406F] uppercase tracking-wider">
              Signed in with Google
            </h4>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Your Google identity ({googlePrefill?.email || formData.email}) is verified. No password is required.
            </p>
          </div>
        </div>
      )}

      {/* Full Name */}
      <FormField
        id="fullName"
        label="Full Name"
        required
        hint={isGoogleFlow ? 'Verified via Google' : 'Your legal name or primary contact name'}
        error={touched.fullName ? errors.fullName : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <User className="w-4 h-4" />
          </span>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            readOnly={isGoogleFlow}
            value={formData.fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            onBlur={() => onBlur('fullName')}
            aria-invalid={touched.fullName && !!errors.fullName}
            placeholder="e.g. Kasun Perera"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              isGoogleFlow
                ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
                : touched.fullName && errors.fullName
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] shadow-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>

      {/* Email Address */}
      <FormField
        id="email"
        label="Email Address"
        required
        hint={isGoogleFlow ? 'Linked to Google Account' : 'Used to log in to your vendor dashboard'}
        error={touched.email ? errors.email : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <Mail className="w-4 h-4" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            readOnly={isGoogleFlow}
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            aria-invalid={touched.email && !!errors.email}
            placeholder="e.g. vendor@oleena.com"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              isGoogleFlow
                ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
                : touched.email && errors.email
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] shadow-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>

      {/* Password Fields (Hidden when using Google Auth) */}
      {!isGoogleFlow && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <FormField
              id="password"
              label="Password"
              required
              hint="Min. 8 chars (uppercase, lowercase, number)"
              error={touched.password ? errors.password : undefined}
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password || ''}
                  onChange={(e) => onChange('password', e.target.value)}
                  onBlur={() => onBlur('password')}
                  aria-invalid={touched.password && !!errors.password}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                    touched.password && errors.password
                      ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-[#D6C1C9] bg-white text-[#1E293B] shadow-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#8E406F] transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* Confirm Password */}
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              required
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword || ''}
                  onChange={(e) => onChange('confirmPassword', e.target.value)}
                  onBlur={() => onBlur('confirmPassword')}
                  aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-[#D6C1C9] bg-white text-[#1E293B] shadow-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#8E406F] transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 -mt-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B] font-medium">Strength:</span>
                <span className={`font-semibold ${pwdStrength.textClass}`}>{pwdStrength.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'
                  }`}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Phone Number */}
      <FormField
        id="phoneNumber"
        label="Personal Contact Phone"
        required
        hint="e.g. 077 123 4567 or +94 77 123 4567"
        error={touched.phoneNumber ? errors.phoneNumber : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <Phone className="w-4 h-4" />
          </span>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phoneNumber || ''}
            onChange={(e) => onChange('phoneNumber', sanitizePhoneInput(e.target.value))}
            onBlur={() => onBlur('phoneNumber')}
            inputMode="tel"
            aria-invalid={touched.phoneNumber && !!errors.phoneNumber}
            placeholder="0771234567"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              touched.phoneNumber && errors.phoneNumber
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>
    </div>
  );
}
