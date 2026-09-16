// ============================================================
// PhotographyDetails.jsx
// Feature: Vendor Portal → Create/Edit Listing Wizard
// Category: Photography Specific Attributes
// Sections: Included Services & Style, Deliverables & Timeline,
// Team & Equipment (Video gate), Travel & Booking Policies.
// ============================================================

import React from 'react';
import {
  Camera,
  Film,
  Users,
  MapPin,
  Sparkles,
  PackageCheck,
} from 'lucide-react';
import Toggle from '../common/Toggle';
import MultiSelect from '../common/MultiSelect';
import FormField from '../common/FormField';

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function PhotographyDetails({ details = {}, onChange }) {
  const updateField = (field, value) => {
    onChange?.({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────────────────────
          1. STYLE & INCLUDED COVERAGE
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Camera size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              1. Photography Style & Coverage Services
            </h3>
            <p className="text-xs text-[#737373]">
              Artistic direction, shoot scopes, and wedding session inclusions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <FormField id="photo-style" label="Primary Shooting Style" required>
            <select
              id="photo-style"
              value={details.shootingStyle || 'Candid / Documentary'}
              onChange={(e) => updateField('shootingStyle', e.target.value)}
              className={inputCls}
            >
              {[
                'Candid / Documentary',
                'Traditional & Posed',
                'Contemporary & Editorial',
                'Cinematic Storytelling',
                'Fine Art / Moody',
                'Vintage / Film Look',
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <FormField id="hours-coverage" label="Standard Hours of Coverage" required>
            <select
              id="hours-coverage"
              value={details.hoursOfCoverage || 'Full Day (10–12 Hours)'}
              onChange={(e) => updateField('hoursOfCoverage', e.target.value)}
              className={inputCls}
            >
              {[
                'Half Day (4–6 Hours)',
                'Standard Day (8 Hours)',
                'Full Day (10–12 Hours)',
                'Extended Coverage (14+ Hours)',
                'Multi-Day Wedding Package',
              ].map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </FormField>
        </div>

        <MultiSelect
          id="included-services"
          label="Included Services & Shoots"
          description="Select all shoots and coverage sessions included in this primary listing package"
          options={[
            'Pre-Wedding / Engagement Shoot',
            'Full Day Wedding Coverage',
            'Homecoming / Reception Shoot',
            'Bridal Dressing Prep',
            'Drone Aerial Photography',
            'Second Lead Shooter',
            'High-Res Digital Gallery',
            'Printed Luxury Album',
          ]}
          value={details.includedServices || [
            'Full Day Wedding Coverage',
            'Pre-Wedding / Engagement Shoot',
            'High-Res Digital Gallery',
          ]}
          onChange={(val) => updateField('includedServices', val)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DELIVERABLES & TIMELINE
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <PackageCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              2. Deliverables & Turnaround Timeline
            </h3>
            <p className="text-xs text-[#737373]">
              Expected photo count, digital delivery, RAW source availability, and turnaround
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <FormField id="photos-delivered" label="Edited Photos Delivered" hint="Approximate count">
            <input
              id="photos-delivered"
              type="text"
              value={details.photosDelivered || '500+ Fully Edited'}
              onChange={(e) => updateField('photosDelivered', e.target.value)}
              placeholder="e.g. 500+ Fully Edited"
              className={inputCls}
            />
          </FormField>

          <FormField id="delivery-timeframe" label="Final Delivery Timeline">
            <select
              id="delivery-timeframe"
              value={details.deliveryTimeframe || '3–4 Weeks'}
              onChange={(e) => updateField('deliveryTimeframe', e.target.value)}
              className={inputCls}
            >
              {['1–2 Weeks (Express)', '3–4 Weeks', '1–2 Months', '2–3 Months', '3+ Months'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-raw-files"
            fieldLabel="Source Files Policy"
            label="RAW Files Included"
            description="Provide original unedited RAWs"
            checked={details.rawFilesIncluded ?? false}
            onChange={(val) => updateField('rawFilesIncluded', val)}
            size="sm"
          />

          <Toggle
            id="toggle-digital-gallery"
            fieldLabel="Client Delivery Method"
            label="Online Digital Gallery"
            description="Password-protected cloud link"
            checked={details.digitalGalleryIncluded ?? true}
            onChange={(val) => updateField('digitalGalleryIncluded', val)}
            size="sm"
          />
        </div>

        {/* Physical Album Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Physical Printed Album Inclusions</span>
                <p className="text-[11px] text-[#737373]">Provide hardcover, flush mount, or parent mini albums</p>
              </div>
            </div>
            <Toggle
              id="gate-album"
              label="Include Printed Album"
              checked={details.albumIncluded ?? true}
              onChange={(val) => updateField('albumIncluded', val)}
              size="sm"
            />
          </div>

          {details.albumIncluded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <FormField id="album-type" label="Album Binding & Style">
                <select
                  id="album-type"
                  value={details.albumType || 'Leather Flush Mount (12x18)'}
                  onChange={(e) => updateField('albumType', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'Leather Flush Mount (12x18)',
                    'Linen Hardcover Photobook (10x14)',
                    'Fine Art Matte Magazine Style',
                    'Parent Mini-Albums + Couple Master',
                  ].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="album-pages" label="Album Spreads / Pages">
                <input
                  id="album-pages"
                  type="text"
                  value={details.albumPages || '50 Pages / 25 Spreads'}
                  onChange={(e) => updateField('albumPages', e.target.value)}
                  placeholder="e.g. 50 Pages / 25 Spreads"
                  className={inputCls}
                />
              </FormField>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CREW, VIDEOGRAPHY & HARDWARE
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              3. Crew Size, Equipment & Videography
            </h3>
            <p className="text-xs text-[#737373]">
              Shooter crew count, drone certification, and cinema video packages
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="photographer-count" label="Number of Photographers" required>
            <select
              id="photographer-count"
              value={details.photographerCount || '2 Photographers'}
              onChange={(e) => updateField('photographerCount', e.target.value)}
              className={inputCls}
            >
              {['1 Lead Photographer', '2 Photographers (Lead + Assistant)', '3 Photographers', '4+ Multi-Shooter Crew'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-drone"
            fieldLabel="Aerial Coverage"
            label="Licensed Drone Operator"
            description="4K cinematic aerial footage"
            checked={details.droneAllowed ?? true}
            onChange={(val) => updateField('droneAllowed', val)}
            size="sm"
          />

          <Toggle
            id="toggle-backup-gear"
            fieldLabel="Hardware Redundancy"
            label="Dual-Card & Backup Gear"
            description="Zero data loss redundancy"
            checked={details.backupGear ?? true}
            onChange={(val) => updateField('backupGear', val)}
            size="sm"
          />
        </div>

        {/* Videography Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Film size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Videography / Cinema Service</span>
                <p className="text-[11px] text-[#737373]">Bundle cinematic highlight films and full ceremony footage</p>
              </div>
            </div>
            <Toggle
              id="gate-videography"
              label="Include Videography"
              checked={details.videographyIncluded ?? false}
              onChange={(val) => updateField('videographyIncluded', val)}
              size="sm"
            />
          </div>

          {details.videographyIncluded && (
            <div className="space-y-3 pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField id="videographer-count" label="Number of Videographers">
                  <select
                    id="videographer-count"
                    value={details.videographerCount || '2 Videographers'}
                    onChange={(e) => updateField('videographerCount', e.target.value)}
                    className={inputCls}
                  >
                    {['1 Videographer', '2 Videographers', '3+ Cinematic Crew'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </FormField>

                <FormField id="video-length" label="Highlight Film Length">
                  <select
                    id="video-length"
                    value={details.videoLength || '3–5 Min Cinematic Teaser + 30 Min Feature'}
                    onChange={(e) => updateField('videoLength', e.target.value)}
                    className={inputCls}
                  >
                    {[
                      '1 Min Instagram Reel / Trailer',
                      '3–5 Min Cinematic Teaser',
                      '3–5 Min Teaser + 30 Min Feature',
                      'Full Documentary (60+ Mins)',
                    ].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <MultiSelect
                id="video-deliverables"
                label="Video Deliverables"
                description="Select all video edits and deliverables included"
                options={[
                  'Cinematic 4K Teaser (3-5 mins)',
                  'Full Ceremony & Poruwa Edit',
                  'Speeches & Toast Cuts',
                  'Social Media Teaser (60s)',
                  'Full Unedited Footage USB',
                ]}
                value={details.videoDeliverables || ['Cinematic 4K Teaser (3-5 mins)', 'Full Ceremony & Poruwa Edit']}
                onChange={(val) => updateField('videoDeliverables', val)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TRAVEL, OUTSTATION & BOOKING POLICIES
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              4. Travel, Outstation & Booking Terms
            </h3>
            <p className="text-xs text-[#737373]">
              Destination wedding travel policies, lodging terms, and reservation deposit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="travel-outside-colombo" label="Travel Outside Colombo / City">
            <select
              id="travel-outside-colombo"
              value={details.travelOutsideColombo || 'Yes - Additional Fee'}
              onChange={(e) => updateField('travelOutsideColombo', e.target.value)}
              className={inputCls}
            >
              {[
                'Yes - Free Islandwide',
                'Yes - Additional Fee',
                'Western Province Only',
                'Client Provides Transport',
              ].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-outstation-stay"
            fieldLabel="Outstation Lodging"
            label="Hotel Stay Required"
            description="Client provides room for multi-day shoots"
            checked={details.outstationAccommodationRequired ?? true}
            onChange={(val) => updateField('outstationAccommodationRequired', val)}
            size="sm"
          />

          <Toggle
            id="toggle-advance-deposit"
            fieldLabel="Reservation Terms"
            label="Deposit Required"
            description="Date lock advance fee"
            checked={details.depositRequired ?? true}
            onChange={(val) => updateField('depositRequired', val)}
            size="sm"
          />
        </div>

        {details.depositRequired && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-fadeIn">
            <FormField id="deposit-rate" label="Deposit Amount / Percentage" hint="e.g. 30% or Rs. 40,000">
              <input
                id="deposit-rate"
                type="text"
                value={details.depositAmount || '30% Advance Upon Booking'}
                onChange={(e) => updateField('depositAmount', e.target.value)}
                placeholder="e.g. 30% Advance Upon Booking"
                className={inputCls}
              />
            </FormField>

            <FormField id="cancellation-terms" label="Cancellation & Rescheduling Policy">
              <select
                id="cancellation-terms"
                value={details.cancellationPolicy || 'Flexible (Free reschedule up to 60 days)'}
                onChange={(e) => updateField('cancellationPolicy', e.target.value)}
                className={inputCls}
              >
                {[
                  'Flexible (Free reschedule up to 60 days)',
                  'Moderate (50% deposit refundable)',
                  'Strict (Non-refundable deposit)',
                ].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}
      </div>

    </div>
  );
}
