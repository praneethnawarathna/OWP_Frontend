// ============================================================
// DecorationsDetails.jsx
// Feature: Vendor Portal → Create/Edit Listing Wizard
// Category: Decorations Specific Attributes
// Sections: Style & Floral Focus, Inclusions & Core Setups,
// Setup Logistics & Outstation, Consultation & Design Process.
// ============================================================

import React from 'react';
import {
  Palette,
  Flower2,
  Boxes,
  Clock,
  MapPin,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import Toggle from '../common/Toggle';
import MultiSelect from '../common/MultiSelect';
import FormField from '../common/FormField';

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function DecorationsDetails({ details = {}, onChange }) {
  const updateField = (field, value) => {
    onChange?.({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────────────────────
          1. STYLE & THEMATIC FOCUS
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              1. Decor Style & Floral Capabilities
            </h3>
            <p className="text-xs text-[#737373]">
              Thematic styles, design aesthetics, and floral composition specialties
            </p>
          </div>
        </div>

        <MultiSelect
          id="decor-styles"
          label="Primary Decor Styles & Themes"
          description="Select all aesthetic styles your team specializes in designing and executing"
          options={[
            'Classic / Traditional',
            'Modern / Minimalist',
            'Rustic / Bohemian (Boho)',
            'Glamorous / Luxury Floral',
            'Vintage Romance',
            'Tropical / Coastal Lawn',
            'Cultural (Kandyan / Indian / Traditional Poruwa)',
            'Fairytale / Whimsical Enchanted',
          ]}
          value={details.primaryStyles || ['Classic / Traditional', 'Glamorous / Luxury Floral', 'Modern / Minimalist']}
          onChange={(val) => updateField('primaryStyles', val)}
        />

        {/* Floral Arrangements Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flower2 size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Floral Styling & Arrangements</span>
                <p className="text-[11px] text-[#737373]">Design and install fresh, silk, or preserved floral compositions</p>
              </div>
            </div>
            <Toggle
              id="gate-florals"
              label="Provide Floral Arrangements"
              checked={details.providesFlorals ?? true}
              onChange={(val) => updateField('providesFlorals', val)}
              size="sm"
            />
          </div>

          {details.providesFlorals && (
            <div className="pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <MultiSelect
                id="floral-types"
                label="Floral Varieties & Mediums Used"
                description="Select all floral types used in arrangements"
                options={[
                  'Fresh Local Seasonal Flowers',
                  'Premium Imported Blooms (Roses, Hydrangeas, Orchids)',
                  'High-End Silk & Artificial Flowers',
                  'Dried & Preserved Florals',
                  'Foliage & Greenery Focused',
                ]}
                value={details.floralTypes || [
                  'Fresh Local Seasonal Flowers',
                  'Premium Imported Blooms (Roses, Hydrangeas, Orchids)',
                ]}
                onChange={(val) => updateField('floralTypes', val)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. INCLUSIONS & CORE DECOR SETUPS
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Boxes size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              2. Core Setups, Props & Lighting
            </h3>
            <p className="text-xs text-[#737373]">
              Poruwa structures, settee backdrops, aisle styling, linens, and custom signage
            </p>
          </div>
        </div>

        <MultiSelect
          id="decor-setups"
          label="Available Decor Setups & Structures"
          description="Select all components that can be supplied in this listing package"
          options={[
            'Poruwa / Mandap / Ceremony Arch',
            'Head Table & Settee Backdrop',
            'Guest Table Centerpieces & Runners',
            'Entrance Archway & Welcome Canopy',
            'Walkway / Aisle Runner & Floral Pillars',
            'Photo Booth Backdrop & Flower Wall',
            'Ceiling Draping & Fairy Light Canopies',
            'Ambient Floor Uplighting & Spotlights',
          ]}
          value={details.availableSetups || [
            'Poruwa / Mandap / Ceremony Arch',
            'Head Table & Settee Backdrop',
            'Guest Table Centerpieces & Runners',
            'Entrance Archway & Welcome Canopy',
          ]}
          onChange={(val) => updateField('availableSetups', val)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="tableware-linens" label="Tableware & Linens">
            <select
              id="tableware-linens"
              value={details.tablewareLinens || 'Full Linens & Chair Covers Included'}
              onChange={(e) => updateField('tablewareLinens', e.target.value)}
              className={inputCls}
            >
              {[
                'Full Linens & Chair Covers Included',
                'Custom Specialty Linens (Add-on)',
                'Linens Not Provided (Venue supplies)',
              ].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-custom-signage"
            label="Custom Signage & Boards"
            description="Personalized acrylic / wooden welcome signs"
            checked={details.customSignageIncluded ?? true}
            onChange={(val) => updateField('customSignageIncluded', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-lounge-props"
            label="Lounge Props & Rentals"
            description="Vintage settees, plinths & lanterns"
            checked={details.loungePropsAvailable ?? true}
            onChange={(val) => updateField('loungePropsAvailable', val)}
            card
            size="sm"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SETUP, LOGISTICS & VENUE RULES
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              3. Setup Times, Teardown & Logistics
            </h3>
            <p className="text-xs text-[#737373]">
              Assembly window requirements, post-wedding teardown, and venue compatibility
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="setup-time" label="Estimated Setup Time" hint="Assembly hours">
            <select
              id="setup-time"
              value={details.setupTimeRequired || '4–6 Hours'}
              onChange={(e) => updateField('setupTimeRequired', e.target.value)}
              className={inputCls}
            >
              {[
                '2–3 Hours (Compact setup)',
                '4–6 Hours (Standard wedding)',
                '8+ Hours (Grand luxury setup)',
                'Overnight / Previous Day Setup Required',
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-teardown"
            fieldLabel="Post-Event Clean-up"
            label="Same-Day Teardown Included"
            description="Immediate midnight teardown & clearing"
            checked={details.sameDayTeardownIncluded ?? true}
            onChange={(val) => updateField('sameDayTeardownIncluded', val)}
            size="sm"
          />

          <FormField id="venue-compatibility" label="Venue Restrictions">
            <select
              id="venue-compatibility"
              value={details.venueRestrictions || 'Works at Any Client Venue'}
              onChange={(e) => updateField('venueRestrictions', e.target.value)}
              className={inputCls}
            >
              {[
                'Works at Any Client Venue',
                'Works Only at Partnered Venues',
                'Requires Ground-Floor Loading Access',
              ].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Outstation Travel Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Outstation & Destination Travel</span>
                <p className="text-[11px] text-[#737373]">Travel and execute wedding decor outside base city</p>
              </div>
            </div>
            <Toggle
              id="gate-outstation-decor"
              label="Support Outstation Events"
              checked={details.outstationDecorAllowed ?? true}
              onChange={(val) => updateField('outstationDecorAllowed', val)}
              size="sm"
            />
          </div>

          {details.outstationDecorAllowed && (
            <div className="pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <FormField id="travel-fee-policy" label="Travel & Transport Logistics Policy">
                <select
                  id="travel-fee-policy"
                  value={details.travelFeePolicy || 'Additional Fee Based on Mileage / Distance'}
                  onChange={(e) => updateField('travelFeePolicy', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'Included in Package (Islandwide)',
                    'Additional Fee Based on Mileage / Distance',
                    'Client Provides Transport Lorry / Van',
                  ].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CONSULTATION & DESIGN PROCESS
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <FileCheck2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              4. Consultation, Concept Sketches & Budget
            </h3>
            <p className="text-xs text-[#737373]">
              Design meetings, 3D renderings, moodboards, and minimum booking order values
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Toggle
            id="toggle-free-consultation"
            label="Complimentary Initial Consultation"
            description="Free 1-on-1 concept discovery session for couple"
            checked={details.freeConsultation ?? true}
            onChange={(val) => updateField('freeConsultation', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-moodboards"
            label="Custom 3D Sketches & Moodboards"
            description="Computerized render previews prior to wedding date"
            checked={details.customMoodboards ?? true}
            onChange={(val) => updateField('customMoodboards', val)}
            card
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {details.customMoodboards && (
            <FormField id="design-fee" label="Design Process Fee Policy">
              <select
                id="design-fee"
                value={details.designFeePolicy || 'Complimentary with Confirmed Booking'}
                onChange={(e) => updateField('designFeePolicy', e.target.value)}
                className={inputCls}
              >
                {[
                  'Complimentary with Confirmed Booking',
                  'Fee Deducted from Final Invoice',
                  'Separate Design & Drafting Retainer',
                ].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </FormField>
          )}

          <FormField id="min-budget" label="Minimum Decor Order Value" hint="Starting package floor">
            <input
              id="min-budget"
              type="text"
              value={details.minimumBudget || 'Rs. 250,000'}
              onChange={(e) => updateField('minimumBudget', e.target.value)}
              placeholder="e.g. Rs. 250,000"
              className={inputCls}
            />
          </FormField>
        </div>
      </div>

    </div>
  );
}
