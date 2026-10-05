/**
 * BusinessStep.jsx — Step 2: Vendor Business Profile
 * Reuses FormField from src/components/common/FormField.jsx
 */

import { Building2, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import FormField from '../common/FormField';

export default function BusinessStep({
  formData,
  errors = {},
  touched = {},
  options = {},
  onChange,
  onBlur,
}) {
  const categories = options.categories || [];
  const businessTypes = options.businessTypes || [];

  const taglineLength = (formData.tagline || '').length;
  const descriptionLength = (formData.description || '').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Business Name */}
      <FormField
        id="businessName"
        label="Business Name"
        required
        hint="Brand or trading name shown to couples"
        error={touched.businessName ? errors.businessName : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <Building2 className="w-4 h-4" />
          </span>
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            value={formData.businessName || ''}
            onChange={(e) => onChange('businessName', e.target.value)}
            onBlur={() => onBlur('businessName')}
            aria-invalid={touched.businessName && !!errors.businessName}
            placeholder="e.g. Lumina Moments Photography"
            maxLength={150}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
              touched.businessName && errors.businessName
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
        </div>
      </FormField>

      {/* Grid: Business Type & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Type */}
        <FormField
          id="businessType"
          label="Business Structure"
          required
          error={touched.businessType ? errors.businessType : undefined}
        >
          <div className="relative">
            <select
              id="businessType"
              name="businessType"
              required
              value={formData.businessType || ''}
              onChange={(e) => onChange('businessType', e.target.value)}
              onBlur={() => onBlur('businessType')}
              aria-invalid={touched.businessType && !!errors.businessType}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none bg-white ${
                touched.businessType && errors.businessType
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            >
              <option value="" disabled>Select business type...</option>
              {businessTypes.map((type) => (
                <option key={type.value || type} value={type.value || type}>
                  {type.label || type}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        {/* Category */}
        <FormField
          id="category"
          label="Primary Category"
          required
          error={touched.category ? errors.category : undefined}
        >
          <div className="relative">
            <select
              id="category"
              name="category"
              required
              value={formData.category || ''}
              onChange={(e) => onChange('category', e.target.value)}
              onBlur={() => onBlur('category')}
              aria-invalid={touched.category && !!errors.category}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none bg-white ${
                touched.category && errors.category
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            >
              <option value="" disabled>Select wedding category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </FormField>
      </div>

      {/* Tagline */}
      <FormField
        id="tagline"
        label="Business Tagline"
        hint="Short, catchy headline (optional)"
        error={touched.tagline ? errors.tagline : undefined}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
            <Sparkles className="w-4 h-4" />
          </span>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={formData.tagline || ''}
            onChange={(e) => onChange('tagline', e.target.value)}
            onBlur={() => onBlur('tagline')}
            placeholder="e.g. Crafting timeless wedding memories with artistic elegance"
            maxLength={250}
            className="w-full pl-10 pr-16 py-2.5 rounded-lg border border-[#D6C1C9] bg-white text-[#1E293B] text-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 outline-none transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#94A3B8] font-mono">
            {taglineLength}/250
          </span>
        </div>
      </FormField>

      {/* Description (50-500 chars) */}
      <FormField
        id="description"
        label="About Your Business"
        required
        hint="Describe your style, services, and experience"
        error={touched.description ? errors.description : undefined}
      >
        <div className="relative flex flex-col">
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            onBlur={() => onBlur('description')}
            aria-invalid={touched.description && !!errors.description}
            placeholder="Introduce your wedding service to prospective couples. Mention your background, signature aesthetic, packages, and what makes your work exceptional... (min. 50 characters)"
            maxLength={500}
            className={`w-full p-3.5 rounded-lg border text-sm transition-all outline-none resize-none ${
              touched.description && errors.description
                ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }`}
          />
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mt-1.5 px-0.5">
            <span className={descriptionLength < 50 ? 'text-amber-600 font-medium' : 'text-[#64748B]'}>
              {descriptionLength < 50
                ? `${50 - descriptionLength} more character${50 - descriptionLength === 1 ? '' : 's'} needed`
                : 'Meets minimum requirement'}
            </span>
            <span className="font-mono">{descriptionLength}/500</span>
          </div>
        </div>
      </FormField>

      {/* Grid: Years in Business & Business Registration Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Years in Business */}
        <FormField
          id="yearsInBusiness"
          label="Years in Business"
          hint="Optional (0 - 80)"
          error={touched.yearsInBusiness ? errors.yearsInBusiness : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              id="yearsInBusiness"
              name="yearsInBusiness"
              type="number"
              min={0}
              max={80}
              value={formData.yearsInBusiness ?? ''}
              onChange={(e) => onChange('yearsInBusiness', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              onBlur={() => onBlur('yearsInBusiness')}
              aria-invalid={touched.yearsInBusiness && !!errors.yearsInBusiness}
              placeholder="e.g. 5"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                touched.yearsInBusiness && errors.yearsInBusiness
                  ? 'border-rose-300 bg-rose-50/40 text-[#1E293B] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-[#D6C1C9] bg-white text-[#1E293B] hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
              }`}
            />
          </div>
        </FormField>

        {/* Business Registration Number */}
        <FormField
          id="businessRegistrationNumber"
          label="BRN (Optional)"
          hint="Needed later to verify your business"
          error={touched.businessRegistrationNumber ? errors.businessRegistrationNumber : undefined}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <input
              id="businessRegistrationNumber"
              name="businessRegistrationNumber"
              type="text"
              value={formData.businessRegistrationNumber || ''}
              onChange={(e) => onChange('businessRegistrationNumber', e.target.value)}
              onBlur={() => onBlur('businessRegistrationNumber')}
              placeholder="e.g. PV-123456"
              maxLength={50}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D6C1C9] bg-white text-[#1E293B] text-sm hover:border-[#8E406F]/50 focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 outline-none transition-all"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
