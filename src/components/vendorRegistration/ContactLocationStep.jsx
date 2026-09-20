/**
 * ContactLocationStep.jsx — Step 3: Vendor Contact & Service Areas
 * Reuses FormField and MultiSelect from src/components/common/
 */

import { useState, useEffect } from 'react';
import { Mail, Phone, Globe, MapPin, Building, Map, CheckSquare, Square } from 'lucide-react';
import FormField from '../common/FormField';
import MultiSelect from '../common/MultiSelect';

export default function ContactLocationStep({
  formData,
  errors = {},
  touched = {},
  options = {},
  onChange,
  onBlur,
}) {
  const districts = options.districts || [];

  // Checkbox state: "Same as login email"
  const [sameAsLoginEmail, setSameAsLoginEmail] = useState(
    !!formData.email && formData.businessEmail === formData.email
  );

  // When "same as login email" is toggled, update businessEmail
  const handleToggleSameEmail = () => {
    const nextState = !sameAsLoginEmail;
    setSameAsLoginEmail(nextState);
    if (nextState && formData.email) {
      onChange('businessEmail', formData.email);
    }
  };

  // If user changed login email and "sameAsLoginEmail" is active, sync it
  useEffect(() => {
    if (sameAsLoginEmail && formData.email && formData.businessEmail !== formData.email) {
      onChange('businessEmail', formData.email);
    }
  }, [formData.email, sameAsLoginEmail]);

  // When primary district is selected, auto pre-select it in serviceAreas if not already included
  const handleDistrictChange = (selectedDistrict) => {
    onChange('district', selectedDistrict);
    if (selectedDistrict) {
      const currentAreas = Array.isArray(formData.serviceAreas) ? formData.serviceAreas : [];
      if (!currentAreas.includes(selectedDistrict)) {
        onChange('serviceAreas', [...currentAreas, selectedDistrict]);
      }
    }
  };

  // Quick actions for service areas
  const handleSelectAllDistricts = () => {
    onChange('serviceAreas', [...districts]);
  };

  const handleClearServiceAreas = () => {
    if (formData.district) {
      onChange('serviceAreas', [formData.district]);
    } else {
      onChange('serviceAreas', []);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Business Email & Same as login checkbox */}
      <div className="space-y-2">
        <FormField
          id="businessEmail"
          label="Inquiry / Business Email"
          required
          hint="Couples will use this email for wedding inquiries"
          error={touched.businessEmail ? errors.businessEmail : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="businessEmail"
              name="businessEmail"
              type="email"
              required
              readOnly={sameAsLoginEmail}
              value={formData.businessEmail || ''}
              onChange={(e) => onChange('businessEmail', e.target.value)}
              onBlur={() => onBlur('businessEmail')}
              aria-invalid={touched.businessEmail && !!errors.businessEmail}
              placeholder="e.g. info@luminamoments.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                sameAsLoginEmail
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : touched.businessEmail && errors.businessEmail
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            />
          </div>
        </FormField>

        {/* Checkbox: Same as login email */}
        <button
          type="button"
          onClick={handleToggleSameEmail}
          className="flex items-center gap-2 text-xs text-[#64748B] hover:text-[#8E406F] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded py-0.5 px-1 -ml-1"
        >
          {sameAsLoginEmail ? (
            <CheckSquare className="w-4 h-4 text-[#8E406F]" />
          ) : (
            <Square className="w-4 h-4 text-[#94A3B8]" />
          )}
          <span>Same as my personal login email ({formData.email || 'not provided yet'})</span>
        </button>
      </div>

      {/* Contact Numbers (Primary + Alternate) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Number */}
        <FormField
          id="contactNumber"
          label="Primary Business Phone"
          required
          hint="e.g. 011 234 5678 or 077 123 4567"
          error={touched.contactNumber ? errors.contactNumber : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              required
              value={formData.contactNumber || ''}
              onChange={(e) => onChange('contactNumber', e.target.value)}
              onBlur={() => onBlur('contactNumber')}
              aria-invalid={touched.contactNumber && !!errors.contactNumber}
              placeholder="0771234567"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                touched.contactNumber && errors.contactNumber
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            />
          </div>
        </FormField>

        {/* Alternate Phone Number */}
        <FormField
          id="altPhoneNumber"
          label="Alternate Phone"
          hint="Optional secondary number"
          error={touched.altPhoneNumber ? errors.altPhoneNumber : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="altPhoneNumber"
              name="altPhoneNumber"
              type="tel"
              value={formData.altPhoneNumber || ''}
              onChange={(e) => onChange('altPhoneNumber', e.target.value)}
              onBlur={() => onBlur('altPhoneNumber')}
              placeholder="0112345678"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D6C1C9] bg-white text-[#1E293B] text-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 outline-none transition-all"
            />
          </div>
        </FormField>
      </div>

      {/* Website URL */}
      <FormField
        id="websiteUrl"
        label="Website or Portfolio Link"
        hint="Must start with http:// or https:// (optional)"
        error={touched.websiteUrl ? errors.websiteUrl : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <Globe className="w-4 h-4" />
          </span>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl || ''}
            onChange={(e) => onChange('websiteUrl', e.target.value)}
            onBlur={() => onBlur('websiteUrl')}
            aria-invalid={touched.websiteUrl && !!errors.websiteUrl}
            placeholder="https://www.luminamoments.com"
            maxLength={500}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              touched.websiteUrl && errors.websiteUrl
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>

      {/* Physical Address */}
      <FormField
        id="address"
        label="Street Address / Studio Location"
        required
        error={touched.address ? errors.address : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <MapPin className="w-4 h-4" />
          </span>
          <input
            id="address"
            name="address"
            type="text"
            required
            value={formData.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            onBlur={() => onBlur('address')}
            aria-invalid={touched.address && !!errors.address}
            placeholder="e.g. 45/2 Galle Road, Bambalapitiya"
            maxLength={300}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              touched.address && errors.address
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>

      {/* City, District, Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* City */}
        <FormField
          id="city"
          label="City"
          required
          error={touched.city ? errors.city : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <Building className="w-4 h-4" />
            </span>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              onBlur={() => onBlur('city')}
              aria-invalid={touched.city && !!errors.city}
              placeholder="e.g. Colombo 04"
              maxLength={100}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                touched.city && errors.city
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            />
          </div>
        </FormField>

        {/* District */}
        <FormField
          id="district"
          label="Primary District"
          required
          error={touched.district ? errors.district : undefined}
        >
          <div className="relative">
            <select
              id="district"
              name="district"
              required
              value={formData.district || ''}
              onChange={(e) => handleDistrictChange(e.target.value)}
              onBlur={() => onBlur('district')}
              aria-invalid={touched.district && !!errors.district}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none bg-white ${
                touched.district && errors.district
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            >
              <option value="" disabled>Select district...</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        {/* Postal Code */}
        <FormField
          id="postalCode"
          label="Postal Code"
          hint="Optional"
          error={touched.postalCode ? errors.postalCode : undefined}
        >
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={formData.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
            onBlur={() => onBlur('postalCode')}
            placeholder="00400"
            maxLength={30}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D6C1C9] bg-white text-[#1E293B] text-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 outline-none transition-all"
          />
        </FormField>
      </div>

      {/* Service Areas (MultiSelect) */}
      <div className="pt-2 border-t border-[#E8DDE4]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <label className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[#8E406F]" />
              <span>Service Coverage Areas</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Select all Sri Lankan districts where your team is available to travel or provide services.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAllDistricts}
              className="text-[#8E406F] font-semibold hover:underline px-2 py-1 rounded bg-[#FDF0F4]"
            >
              Islandwide (All 25)
            </button>
            <button
              type="button"
              onClick={handleClearServiceAreas}
              className="text-[#64748B] hover:text-[#1E293B] hover:underline px-2 py-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Reusing MultiSelect component */}
        <MultiSelect
          id="serviceAreas"
          options={districts}
          value={formData.serviceAreas || []}
          onChange={(selected) => onChange('serviceAreas', selected)}
          layout="wrap"
          className="mt-2"
        />

        {touched.serviceAreas && errors.serviceAreas && (
          <p className="text-xs text-rose-500 font-medium mt-2" role="alert">
            {errors.serviceAreas}
          </p>
        )}
      </div>
    </div>
  );
}
