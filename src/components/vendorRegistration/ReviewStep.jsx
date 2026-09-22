/**
 * ReviewStep.jsx — Step 4: Review Details, Terms & Submit
 * Displays read-only summary with Edit links and approval notice.
 */

import { Edit3, Info, MapPin, Building2, User } from 'lucide-react';

export default function ReviewStep({
  formData,
  errors = {},
  touched = {},
  options = {},
  isGoogleFlow = false,
  onEditStep,
  onChange,
}) {
  // Helper to get label for business type
  const getBusinessTypeLabel = (val) => {
    const found = options.businessTypes?.find((t) => t.value === val);
    return found ? found.label : val || 'Not specified';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Review Information Note */}
      <div className="p-4 rounded-xl border border-[#8E406F]/20 bg-[#FDF0F4] flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#8E406F] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E293B] leading-relaxed">
          <p className="font-semibold text-[#8E406F]">
            Important Account Notice
          </p>
          <p className="text-[#64748B] mt-0.5">
            Our team will review your account. You can log in right away, but you can publish listings only after approval.
          </p>
        </div>
      </div>

      {/* Summary Card 1: Account & Credentials */}
      <div className="bg-white rounded-xl border border-[#E8DDE4] p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E9EE]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <User className="w-4 h-4 text-[#8E406F]" />
            <span>Account Details</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep?.(0)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E406F] hover:text-[#75325a] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded px-1.5 py-0.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 text-xs">
          <div>
            <dt className="text-[#94A3B8] font-medium">Full Name</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.fullName || '—'}</dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Login Email</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5 flex items-center gap-1.5">
              <span>{formData.email || '—'}</span>
              {isGoogleFlow && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                  Google
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Personal Contact Phone</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.phoneNumber || '—'}</dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Security</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">
              {isGoogleFlow ? 'Google OAuth 2.0 Identity' : 'Password Protected (Encrypted)'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Summary Card 2: Business Profile */}
      <div className="bg-white rounded-xl border border-[#E8DDE4] p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E9EE]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <Building2 className="w-4 h-4 text-[#8E406F]" />
            <span>Business Profile</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep?.(1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E406F] hover:text-[#75325a] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded px-1.5 py-0.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 text-xs">
          <div>
            <dt className="text-[#94A3B8] font-medium">Business / Trading Name</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.businessName || '—'}</dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Primary Category</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.category || '—'}</dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Structure / Legal Type</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">
              {getBusinessTypeLabel(formData.businessType)}
            </dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Years in Business</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">
              {formData.yearsInBusiness ? `${formData.yearsInBusiness} year(s)` : 'Not specified'}
            </dd>
          </div>
          {formData.tagline && (
            <div className="sm:col-span-2">
              <dt className="text-[#94A3B8] font-medium">Tagline</dt>
              <dd className="text-[#1E293B] mt-0.5 italic text-slate-700 font-medium">
                &ldquo;{formData.tagline}&rdquo;
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-[#94A3B8] font-medium">About / Description</dt>
            <dd className="text-[#334155] mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 whitespace-pre-line text-xs">
              {formData.description || '—'}
            </dd>
          </div>
          {formData.businessRegistrationNumber && (
            <div>
              <dt className="text-[#94A3B8] font-medium">Business Registration (BRN)</dt>
              <dd className="text-[#1E293B] font-semibold mt-0.5 font-mono">
                {formData.businessRegistrationNumber}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Summary Card 3: Contact & Locations */}
      <div className="bg-white rounded-xl border border-[#E8DDE4] p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E9EE]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
            <MapPin className="w-4 h-4 text-[#8E406F]" />
            <span>Contact & Service Coverage</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep?.(2)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E406F] hover:text-[#75325a] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded px-1.5 py-0.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 text-xs">
          <div>
            <dt className="text-[#94A3B8] font-medium">Public Inquiry Email</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.businessEmail || '—'}</dd>
          </div>
          <div>
            <dt className="text-[#94A3B8] font-medium">Primary Business Phone</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.contactNumber || '—'}</dd>
          </div>
          {formData.altPhoneNumber && (
            <div>
              <dt className="text-[#94A3B8] font-medium">Alternate Phone</dt>
              <dd className="text-[#1E293B] font-semibold mt-0.5">{formData.altPhoneNumber}</dd>
            </div>
          )}
          {formData.websiteUrl && (
            <div>
              <dt className="text-[#94A3B8] font-medium">Website</dt>
              <dd className="text-[#8E406F] font-semibold mt-0.5 truncate">
                <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {formData.websiteUrl}
                </a>
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-[#94A3B8] font-medium">Operating Address</dt>
            <dd className="text-[#1E293B] font-semibold mt-0.5">
              {formData.address}, {formData.city}, {formData.district} {formData.postalCode ? `(${formData.postalCode})` : ''}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[#94A3B8] font-medium">
              Service Areas ({formData.serviceAreas?.length || 0} District{formData.serviceAreas?.length === 1 ? '' : 's'})
            </dt>
            <dd className="flex flex-wrap gap-1.5 mt-1.5">
              {formData.serviceAreas?.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF0F4] text-[#8E406F] border border-[#8E406F]/20"
                >
                  {area}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="pt-2">
        <div
          className={`p-4 rounded-xl border transition-all ${
            touched.acceptTerms && errors.acceptTerms
              ? 'border-rose-300 bg-rose-50/50'
              : 'border-[#E8DDE4] bg-white'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={!!formData.acceptTerms}
              onChange={(e) => onChange('acceptTerms', e.target.checked)}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#8E406F] focus:ring-[#8E406F] mt-0.5 cursor-pointer accent-[#8E406F]"
            />
            <div className="text-xs text-[#334155] leading-relaxed">
              <span className="font-semibold text-[#1E293B]">
                I agree to the Terms of Service & Vendor Guidelines
              </span>
              <p className="text-[#64748B] mt-0.5">
                By submitting this application, you confirm that all provided business information is authentic and agree to Oleena Wedding Planner&apos;s{' '}
                <a
                  href="#terms"
                  onClick={(e) => { e.preventDefault(); alert('Terms of Service: All vendor registrations are subject to manual review.'); }}
                  className="text-[#8E406F] underline font-medium hover:text-[#75325a]"
                >
                  Vendor Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => { e.preventDefault(); alert('Privacy Policy: We protect vendor and couple data in accordance with Sri Lankan privacy standards.'); }}
                  className="text-[#8E406F] underline font-medium hover:text-[#75325a]"
                >
                  Privacy Policy
                </a>.
              </p>
            </div>
          </label>

          {touched.acceptTerms && errors.acceptTerms && (
            <p className="text-xs text-rose-500 font-medium mt-2 pl-7" role="alert">
              {errors.acceptTerms}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
