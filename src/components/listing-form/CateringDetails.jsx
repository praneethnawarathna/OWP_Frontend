// ============================================================
// CateringDetails.jsx
// Feature: Vendor Portal → Create/Edit Listing Wizard
// Category: Catering Specific Attributes
// Sections: Menu & Cuisines, Guest Capacity & Headcount,
// Staffing & Tableware, Logistics & Tasting Sessions.
// ============================================================

import React from 'react';
import {
  Utensils,
  Soup,
  Users,
  Coffee,
  CheckCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import Toggle from '../common/Toggle';
import MultiSelect from '../common/MultiSelect';
import FormField from '../common/FormField';

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function CateringDetails({ details = {}, onChange }) {
  const updateField = (field, value) => {
    onChange?.({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────────────────────
          1. MENU & CUISINES
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              1. Catering Service Style & Cuisines
            </h3>
            <p className="text-xs text-[#737373]">
              Dining format, regional culinary specializations, and dietary accommodations
            </p>
          </div>
        </div>

        <div className="pt-1">
          <FormField id="service-style" label="Primary Dining Service Style" required>
            <select
              id="service-style"
              value={details.serviceStyle || 'Buffet Service'}
              onChange={(e) => updateField('serviceStyle', e.target.value)}
              className={inputCls}
            >
              {[
                'Buffet Service',
                'Plated / Multi-Course Silver Service',
                'Family Style Table Platters',
                'Cocktail & Canapés (Standing)',
                'Live Action Cooking Stations (Hoppers, BBQ, Shawarma)',
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
        </div>

        <MultiSelect
          id="cuisines-offered"
          label="Cuisines Offered & Culinary Specialties"
          description="Select all cuisines your culinary team prepares"
          options={[
            'Sri Lankan Traditional & Village',
            'Indian / Mughlai / Tandoori',
            'Western Fine Dining & Continental',
            'Chinese / Pan-Asian',
            'Italian & Mediterranean',
            'Middle Eastern & Arabic',
            'Fusion & Global Street Food',
            'Seafood Specialties',
          ]}
          value={details.cuisines || [
            'Sri Lankan Traditional & Village',
            'Western Fine Dining & Continental',
            'Indian / Mughlai / Tandoori',
          ]}
          onChange={(val) => updateField('cuisines', val)}
        />

        <MultiSelect
          id="dietary-accommodations"
          label="Dietary Accommodations & Special Menus"
          description="Select all dietary needs supported without cross-contamination"
          options={[
            'Vegetarian',
            'Vegan',
            '100% Halal Certified',
            'Gluten-Free',
            'Nut-Free Safe',
            'Jain / No Onion & Garlic',
            'Dairy-Free Options',
          ]}
          value={details.dietaryOptions || ['Vegetarian', '100% Halal Certified', 'Vegan']}
          onChange={(val) => updateField('dietaryOptions', val)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GUEST CAPACITY & HEADCOUNT
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              2. Guest Capacity & Pricing Unit
            </h3>
            <p className="text-xs text-[#737373]">
              Minimum and maximum catering headcounts and average per-person pricing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="min-guests" label="Minimum Guest Count" required hint="Headcount threshold">
            <input
              id="min-guests"
              type="number"
              min="10"
              value={details.minGuests || 50}
              onChange={(e) => updateField('minGuests', parseInt(e.target.value, 10) || '')}
              placeholder="e.g. 50"
              className={inputCls}
            />
          </FormField>

          <FormField id="max-guests" label="Maximum Guest Capacity" required hint="Peak capacity">
            <input
              id="max-guests"
              type="number"
              min="50"
              value={details.maxGuests || 1000}
              onChange={(e) => updateField('maxGuests', parseInt(e.target.value, 10) || '')}
              placeholder="e.g. 1000"
              className={inputCls}
            />
          </FormField>

          <FormField id="price-per-head" label="Approx Price Per Plate / Head" hint="Standard menu rate">
            <input
              id="price-per-head"
              type="text"
              value={details.pricePerHead || 'Rs. 3,800 / Plate'}
              onChange={(e) => updateField('pricePerHead', e.target.value)}
              placeholder="e.g. Rs. 3,500 - 5,500"
              className={inputCls}
            />
          </FormField>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STAFFING, TABLEWARE & EQUIPMENT
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Coffee size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              3. Service Staff, Cutlery & Tableware
            </h3>
            <p className="text-xs text-[#737373]">
              Banquet waitstaff, china cutlery, chafing warmers, and furniture rentals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Toggle
            id="toggle-waitstaff"
            label="Uniformed Service Waitstaff Included"
            description="Banquet captains, table stewards, and live station chefs"
            checked={details.waitstaffIncluded ?? true}
            onChange={(val) => updateField('waitstaffIncluded', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-glassware"
            label="Stemware & Glassware Included"
            description="High-ball tumblers, wine glasses & champagne flutes"
            checked={details.glasswareIncluded ?? true}
            onChange={(val) => updateField('glasswareIncluded', val)}
            card
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="crockery-cutlery" label="Crockery & Cutlery Standard">
            <select
              id="crockery-cutlery"
              value={details.crockeryCutlery || 'Premium Porcelain & Stainless Silverware'}
              onChange={(e) => updateField('crockeryCutlery', e.target.value)}
              className={inputCls}
            >
              {[
                'Premium Porcelain & Stainless Silverware',
                'Standard Ceramic Banquet Ware',
                'Biodegradable Eco-Friendly Disposables',
                'Not Included (Supplied by Client/Venue)',
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-chafers"
            fieldLabel="Warmers & Platters"
            label="Chafing Dishes Included"
            description="Stainless warmers & fuel burners"
            checked={details.chafingDishesIncluded ?? true}
            onChange={(val) => updateField('chafingDishesIncluded', val)}
            size="sm"
          />

          <Toggle
            id="toggle-tables-chairs"
            fieldLabel="Banquet Furniture"
            label="Tables & Chairs Rental"
            description="Can supply dining tables & chairs"
            checked={details.furnitureRentalAvailable ?? false}
            onChange={(val) => updateField('furnitureRentalAvailable', val)}
            size="sm"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. LOGISTICS, TASTINGS & VENUE POLICIES
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Truck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              4. Logistics, Menu Tastings & On-site Kitchen
            </h3>
            <p className="text-xs text-[#737373]">
              Tasting sessions for the couple, venue kitchen demands, and islandwide delivery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <Toggle
            id="toggle-setup-teardown"
            fieldLabel="Banquet Station Setup"
            label="Setup & Clean-up Included"
            description="Complete buffet assembly & disposal"
            checked={details.setupTeardownIncluded ?? true}
            onChange={(val) => updateField('setupTeardownIncluded', val)}
            size="sm"
          />

          <FormField id="outstation-catering" label="Outstation Catering Scope">
            <select
              id="outstation-catering"
              value={details.outstationCatering || 'Islandwide with Transport Surcharge'}
              onChange={(e) => updateField('outstationCatering', e.target.value)}
              className={inputCls}
            >
              {[
                'Local City Area Only',
                'Islandwide with Transport Surcharge',
                'Islandwide Fully Inclusive',
              ].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FormField>

          <FormField id="kitchen-req" label="Venue Kitchen Requirement">
            <select
              id="kitchen-req"
              value={details.kitchenRequirement || 'Full On-Site Venue Kitchen Needed'}
              onChange={(e) => updateField('kitchenRequirement', e.target.value)}
              className={inputCls}
            >
              {[
                'Full On-Site Venue Kitchen Needed',
                'Only Prep Counter & Electrical Points Needed',
                'Fully Self-Contained Mobile Unit / Food Truck',
              ].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Tasting Session Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Pre-Wedding Menu Tasting Session</span>
                <p className="text-[11px] text-[#737373]">Allow couples to sample chosen dishes before finalizing the menu</p>
              </div>
            </div>
            <Toggle
              id="gate-tasting-session"
              label="Offer Tasting Session"
              checked={details.tastingAvailable ?? true}
              onChange={(val) => updateField('tastingAvailable', val)}
              size="sm"
            />
          </div>

          {details.tastingAvailable && (
            <div className="pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <FormField id="tasting-policy" label="Tasting Session Pricing Policy">
                <select
                  id="tasting-policy"
                  value={details.tastingPolicy || 'Complimentary for Couple (2 Pax)'}
                  onChange={(e) => updateField('tastingPolicy', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'Complimentary for Couple (2 Pax)',
                    'Credited Towards Confirmed Booking',
                    'Paid Session per Plate (At Cost)',
                  ].map((tp) => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
