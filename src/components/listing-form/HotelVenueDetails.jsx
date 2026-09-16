// ============================================================
// HotelVenueDetails.jsx
// Feature: Vendor Portal → Create/Edit Listing Wizard
// Category: Hotel / Venue Full Static Attribute Set
// Sections: Venue Specifications (top-level), Repeatable Spaces,
// Ceremony, Catering & Dining, Beverages, Accommodation,
// Entertainment & Event Facilities, Decoration, Photography Policy, Policies.
// ============================================================

import React from 'react';
import {
  Building2,
  Compass,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Bed,
  Music,
  Palette,
  Camera,
  FileText,
  Info,
} from 'lucide-react';
import Toggle from '../common/Toggle';
import MultiSelect from '../common/MultiSelect';
import FormField from '../common/FormField';
import VenueSpacesEditor from './VenueSpacesEditor';

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function HotelVenueDetails({ details = {}, onChange, spacesError }) {
  const updateField = (field, value) => {
    onChange?.({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────────────────────
          1. VENUE SPECIFICATIONS (Top-level, applies once to venue)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              1. Top-Level Venue Specifications
            </h3>
            <p className="text-xs text-[#737373]">
              General property profile, setting, parking, and architectural access
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Venue Type */}
          <FormField id="venue-type" label="Venue Type" required>
            <select
              id="venue-type"
              value={details.venueType || 'Hotel'}
              onChange={(e) => updateField('venueType', e.target.value)}
              className={inputCls}
            >
              {['Hotel', 'Resort', 'Banquet Hall', 'Ballroom', 'Garden', 'Rooftop', 'Beach Venue'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>

          {/* Venue Setting */}
          <FormField id="venue-setting" label="Venue Setting" required>
            <select
              id="venue-setting"
              value={details.venueSetting || 'City'}
              onChange={(e) => updateField('venueSetting', e.target.value)}
              className={inputCls}
            >
              {['City', 'Beachfront', 'Garden', 'Hill Country', 'Waterfront', 'Countryside'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          {/* Indoor / Outdoor */}
          <FormField id="venue-env" label="Indoor / Outdoor" required>
            <select
              id="venue-env"
              value={details.indoorOutdoor || 'Both'}
              onChange={(e) => updateField('indoorOutdoor', e.target.value)}
              className={inputCls}
            >
              {['Indoor', 'Outdoor', 'Both'].map((io) => (
                <option key={io} value={io}>{io}</option>
              ))}
            </select>
          </FormField>

          {/* Parking Capacity */}
          <FormField id="parking-capacity" label="Parking Capacity">
            <select
              id="parking-capacity"
              value={details.parkingCapacity || '50+'}
              onChange={(e) => updateField('parkingCapacity', e.target.value)}
              className={inputCls}
            >
              {['None', '20+', '50+', '100+', '200+'].map((p) => (
                <option key={p} value={p}>{p} Vehicles</option>
              ))}
            </select>
          </FormField>

          {/* Parking Type */}
          <FormField id="parking-type" label="Parking Type">
            <select
              id="parking-type"
              value={details.parkingType || 'On-site'}
              onChange={(e) => updateField('parkingType', e.target.value)}
              className={inputCls}
            >
              {['On-site', 'Street', 'Valet', 'Nearby'].map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </FormField>

          {/* Valet Parking */}
          <FormField id="valet-parking" label="Valet Service">
            <select
              id="valet-parking"
              value={details.valetParking || 'Included'}
              onChange={(e) => updateField('valetParking', e.target.value)}
              className={inputCls}
            >
              {['Included', 'Available at extra cost', 'Not available'].map((vp) => (
                <option key={vp} value={vp}>{vp}</option>
              ))}
            </select>
          </FormField>

          {/* Wi-Fi */}
          <FormField id="venue-wifi" label="Guest Wi-Fi">
            <select
              id="venue-wifi"
              value={details.wifi || 'Free'}
              onChange={(e) => updateField('wifi', e.target.value)}
              className={inputCls}
            >
              {['Free', 'Paid', 'Not available'].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </FormField>

          {/* Wheelchair Accessible */}
          <FormField id="wheelchair-access" label="Wheelchair Accessibility">
            <select
              id="wheelchair-access"
              value={details.wheelchairAccessible || 'Fully accessible'}
              onChange={(e) => updateField('wheelchairAccessible', e.target.value)}
              className={inputCls}
            >
              {['Fully accessible', 'Partially accessible', 'Not accessible'].map((wa) => (
                <option key={wa} value={wa}>{wa}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Binary Facility Flags in 2-col cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <Toggle
            id="toggle-air-conditioning"
            label="Air Conditioning"
            description="Central climate control"
            checked={details.hasAirConditioning ?? true}
            onChange={(val) => updateField('hasAirConditioning', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-backup-generator"
            label="Backup Generator"
            description="Uninterrupted power supply"
            checked={details.hasBackupGenerator ?? true}
            onChange={(val) => updateField('hasBackupGenerator', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-elevator"
            label="Guest / Service Elevator"
            description="Multi-floor lift access"
            checked={details.hasElevator ?? true}
            onChange={(val) => updateField('hasElevator', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-guest-dropoff"
            label="Porte-Cochère Drop-off"
            description="Covered car entrance"
            checked={details.hasGuestDropOff ?? true}
            onChange={(val) => updateField('hasGuestDropOff', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-vendor-loading"
            label="Dedicated Vendor Loading Bay & Service Access"
            description="Separate rear/dock entrance for decorators, audio equipment, and caterers"
            checked={details.hasVendorLoadingAccess ?? true}
            onChange={(val) => updateField('hasVendorLoadingAccess', val)}
            card
            size="sm"
            className="sm:col-span-2 lg:col-span-4"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VENUE SPACES (Repeatable Structured Group)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm">
        <VenueSpacesEditor
          spaces={details.spaces || []}
          onChange={(newSpaces) => updateField('spaces', newSpaces)}
          error={spacesError}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CEREMONY (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                3. Ceremony
              </h3>
              <p className="text-xs text-[#737373]">
                Poruwa, church-style blessings, exchange of vows & lawn rituals
              </p>
            </div>
          </div>
          <Toggle
            id="gate-ceremony"
            label="Host Ceremonies Here"
            checked={details.hasCeremony ?? true}
            onChange={(val) => updateField('hasCeremony', val)}
            size="sm"
          />
        </div>

        {details.hasCeremony ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField id="ceremony-location" label="Ceremony Location">
                <select
                  id="ceremony-location"
                  value={details.ceremonyLocation || 'Garden'}
                  onChange={(e) => updateField('ceremonyLocation', e.target.value)}
                  className={inputCls}
                >
                  {['Same Hall', 'Garden', 'Poolside', 'Beach', 'Rooftop', 'Other'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="outdoor-ceremony-cap" label="Outdoor Ceremony Capacity">
                <select
                  id="outdoor-ceremony-cap"
                  value={details.outdoorCeremonyCapacity || '200'}
                  onChange={(e) => updateField('outdoorCeremonyCapacity', e.target.value)}
                  className={inputCls}
                >
                  {['50', '100', '200', '300', '500+'].map((c) => (
                    <option key={c} value={c}>{c} Guests</option>
                  ))}
                </select>
              </FormField>

              <Toggle
                id="toggle-separate-ceremony"
                fieldLabel="Ceremony Space Layout"
                label="Separate Ceremony Space"
                description="Dedicated hall or lawn"
                checked={details.separateCeremonyReceptionSpaces ?? true}
                onChange={(val) => updateField('separateCeremonyReceptionSpaces', val)}
                size="sm"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Ceremony hosting is disabled. Couples will see this venue is for receptions only.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CATERING & DINING (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                4. Catering & Dining
              </h3>
              <p className="text-xs text-[#737373]">
                Culinary styles, buffet/plated options, outside food policies & kitchens
              </p>
            </div>
          </div>
          <Toggle
            id="gate-catering"
            label="Offer Catering Services"
            checked={details.hasCatering ?? true}
            onChange={(val) => updateField('hasCatering', val)}
            size="sm"
          />
        </div>

        {details.hasCatering ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField id="catering-provider" label="Catering Provided By">
                <select
                  id="catering-provider"
                  value={details.cateringProvidedBy || 'Both'}
                  onChange={(e) => updateField('cateringProvidedBy', e.target.value)}
                  className={inputCls}
                >
                  {['Hotel', 'Approved external caterers', "Vendor's choice", 'Both'].map((cp) => (
                    <option key={cp} value={cp}>{cp}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="outside-food-policy" label="Outside Food Policy">
                <select
                  id="outside-food-policy"
                  value={details.outsideFoodAllowed || 'With additional fee'}
                  onChange={(e) => updateField('outsideFoodAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'With additional fee'].map((of) => (
                    <option key={of} value={of}>{of}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="kitchen-facility" label="Kitchen / Food Prep Facility">
                <select
                  id="kitchen-facility"
                  value={details.kitchenFacility || 'Available'}
                  onChange={(e) => updateField('kitchenFacility', e.target.value)}
                  className={inputCls}
                >
                  {['Available', 'Not available'].map((kf) => (
                    <option key={kf} value={kf}>{kf}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Cuisine Options MultiSelect */}
            <MultiSelect
              id="cuisine-options"
              label="Cuisine Options & Specialties"
              description="Select all culinary styles your kitchen or approved caterers support"
              options={[
                'Sri Lankan',
                'Indian',
                'Chinese',
                'Western',
                'Italian',
                'Arabic',
                'Asian',
                'Fusion',
                'Vegetarian',
                'Vegan',
              ]}
              value={details.cuisineOptions || ['Sri Lankan', 'Western', 'Indian']}
              onChange={(newVal) => updateField('cuisineOptions', newVal)}
            />

            {/* Dining Format Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <Toggle
                id="toggle-buffet"
                label="Buffet Available"
                description="Live & steam buffet stations"
                checked={details.buffetAvailable ?? true}
                onChange={(val) => updateField('buffetAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-plated-dinner"
                label="Plated Dinner Available"
                description="Multi-course silver service"
                checked={details.platedDinnerAvailable ?? true}
                onChange={(val) => updateField('platedDinnerAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-custom-menu"
                label="Custom Menu Available"
                description="Tailored tasting consultation"
                checked={details.customMenuAvailable ?? true}
                onChange={(val) => updateField('customMenuAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-cake-cutting"
                label="Cake Cutting Allowed"
                description="Includes table, knife & service"
                checked={details.cakeCuttingAllowed ?? true}
                onChange={(val) => updateField('cakeCuttingAllowed', val)}
                card
                size="sm"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Catering services are disabled. Client must arrange external food solutions.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BEVERAGES (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Wine size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                5. Beverages & Bar Facilities
              </h3>
              <p className="text-xs text-[#737373]">
                Bar setups, corkage terms, and alcoholic/non-alcoholic provisions
              </p>
            </div>
          </div>
          <Toggle
            id="gate-beverages"
            label="Provide Beverage Service"
            checked={details.hasBeverages ?? true}
            onChange={(val) => updateField('hasBeverages', val)}
            size="sm"
          />
        </div>

        {details.hasBeverages ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField id="beverage-service" label="Beverage Service">
                <select
                  id="beverage-service"
                  value={details.beverageService || 'Both'}
                  onChange={(e) => updateField('beverageService', e.target.value)}
                  className={inputCls}
                >
                  {['Hotel provided', 'External catering allowed', 'Both'].map((bs) => (
                    <option key={bs} value={bs}>{bs}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="bar-facility" label="Bar Facility Type">
                <select
                  id="bar-facility"
                  value={details.barFacility || 'Full bar'}
                  onChange={(e) => updateField('barFacility', e.target.value)}
                  className={inputCls}
                >
                  {['Full bar', 'Limited bar', 'Mocktail bar', 'No bar'].map((bf) => (
                    <option key={bf} value={bf}>{bf}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="outside-beverages" label="Outside Beverages / Corkage">
                <select
                  id="outside-beverages"
                  value={details.outsideBeveragesAllowed || 'Corkage fee applies'}
                  onChange={(e) => updateField('outsideBeveragesAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'Corkage fee applies'].map((ob) => (
                    <option key={ob} value={ob}>{ob}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Beverage services are not offered at this property.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. ACCOMMODATION (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Bed size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                6. Accommodation
              </h3>
              <p className="text-xs text-[#737373]">
                Guest bedrooms, bridal dressing suites & overnight lodgings
              </p>
            </div>
          </div>
          <Toggle
            id="gate-accommodation"
            label="Offer Guest Rooms"
            checked={details.hasAccommodation ?? true}
            onChange={(val) => updateField('hasAccommodation', val)}
            size="sm"
          />
        </div>

        {details.hasAccommodation ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="num-guest-rooms" label="Number of Guest Rooms">
                <select
                  id="num-guest-rooms"
                  value={details.numberOfGuestRooms || '26–50'}
                  onChange={(e) => updateField('numberOfGuestRooms', e.target.value)}
                  className={inputCls}
                >
                  {['1–10', '11–25', '26–50', '51–100', '100+'].map((r) => (
                    <option key={r} value={r}>{r} Rooms</option>
                  ))}
                </select>
              </FormField>

              <FormField id="comp-bridal-suite" label="Complimentary Bridal Suite">
                <select
                  id="comp-bridal-suite"
                  value={details.complimentaryBridalSuite || 'Included'}
                  onChange={(e) => updateField('complimentaryBridalSuite', e.target.value)}
                  className={inputCls}
                >
                  {['Included', 'Available at additional cost', 'Not available'].map((cbs) => (
                    <option key={cbs} value={cbs}>{cbs}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Room Types MultiSelect */}
            <MultiSelect
              id="room-types"
              label="Available Room Categories"
              description="Select all lodging categories available for wedding parties and guests"
              options={['Standard', 'Deluxe', 'Superior', 'Suite', 'Family Room', 'Villa']}
              value={details.roomTypes || ['Deluxe', 'Suite']}
              onChange={(newVal) => updateField('roomTypes', newVal)}
            />

            {/* Binary Lodging Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Toggle
                id="toggle-bridal-suite"
                label="Bridal Suite Available"
                description="Private dressing & makeup lounge"
                checked={details.bridalSuiteAvailable ?? true}
                onChange={(val) => updateField('bridalSuiteAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-guest-accommodation"
                label="Guest Room Blocks"
                description="Discounted block booking for attendees"
                checked={details.guestAccommodationAvailable ?? true}
                onChange={(val) => updateField('guestAccommodationAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-onsite-accommodation"
                label="On-site Lodging"
                description="Rooms within walking distance of halls"
                checked={details.onSiteAccommodation ?? true}
                onChange={(val) => updateField('onSiteAccommodation', val)}
                card
                size="sm"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            No on-site guest rooms or bridal suites offered for this venue.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. ENTERTAINMENT & EVENT FACILITIES (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Music size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                7. Entertainment & Event Facilities
              </h3>
              <p className="text-xs text-[#737373]">
                Live bands, DJs, curfew timings, and integrated AV projectors
              </p>
            </div>
          </div>
          <Toggle
            id="gate-entertainment"
            label="Support Entertainment"
            checked={details.hasEntertainment ?? true}
            onChange={(val) => updateField('hasEntertainment', val)}
            size="sm"
          />
        </div>

        {details.hasEntertainment ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField id="dj-allowed" label="DJ Policy">
                <select
                  id="dj-allowed"
                  value={details.djAllowed || 'Yes'}
                  onChange={(e) => updateField('djAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'With restrictions'].map((dj) => (
                    <option key={dj} value={dj}>{dj}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="live-band-allowed" label="Live Band Policy">
                <select
                  id="live-band-allowed"
                  value={details.liveBandAllowed || 'Yes'}
                  onChange={(e) => updateField('liveBandAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'With restrictions'].map((lb) => (
                    <option key={lb} value={lb}>{lb}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="max-music-end" label="Max Music / Curfew Time">
                <select
                  id="max-music-end"
                  value={details.maxMusicEndTime || 'Midnight'}
                  onChange={(e) => updateField('maxMusicEndTime', e.target.value)}
                  className={inputCls}
                >
                  {['10 PM', '11 PM', 'Midnight', '1 AM', 'No fixed limit'].map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="projector-screen" label="Projector / Screen">
                <select
                  id="projector-screen"
                  value={details.projectorScreen || 'Included'}
                  onChange={(e) => updateField('projectorScreen', e.target.value)}
                  className={inputCls}
                >
                  {['Included', 'Available', 'Not available'].map((ps) => (
                    <option key={ps} value={ps}>{ps}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <Toggle
              id="toggle-traditional-music"
              label="Traditional Music & Percussion Allowed"
              description="Supports Hewisi drums, magul bera, and cultural processional ensembles"
              checked={details.traditionalMusicAllowed ?? true}
              onChange={(val) => updateField('traditionalMusicAllowed', val)}
              card
              size="sm"
            />
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Entertainment and amplified sound facilities are disabled.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. DECORATION (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                8. Decoration
              </h3>
              <p className="text-xs text-[#737373]">
                Floral styling, stage sets, table linens, and external decorator access
              </p>
            </div>
          </div>
          <Toggle
            id="gate-decoration"
            label="Provide / Manage Decoration"
            checked={details.hasDecoration ?? true}
            onChange={(val) => updateField('hasDecoration', val)}
            size="sm"
          />
        </div>

        {details.hasDecoration ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField id="decoration-policy" label="Decoration Policy">
                <select
                  id="decoration-policy"
                  value={details.decorationPolicy || 'Both'}
                  onChange={(e) => updateField('decorationPolicy', e.target.value)}
                  className={inputCls}
                >
                  {['Hotel decoration only', 'External decorators allowed', 'Both'].map((dp) => (
                    <option key={dp} value={dp}>{dp}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="table-decoration" label="Table Centerpiece Styling">
                <select
                  id="table-decoration"
                  value={details.tableDecoration || 'Included'}
                  onChange={(e) => updateField('tableDecoration', e.target.value)}
                  className={inputCls}
                >
                  {['Included', 'Optional', 'Not available'].map((td) => (
                    <option key={td} value={td}>{td}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="lighting-decoration" label="Ambient Lighting">
                <select
                  id="lighting-decoration"
                  value={details.lightingDecoration || 'Included'}
                  onChange={(e) => updateField('lightingDecoration', e.target.value)}
                  className={inputCls}
                >
                  {['Included', 'Optional', 'Not available'].map((ld) => (
                    <option key={ld} value={ld}>{ld}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="outside-decorator-approval" label="Outside Decorator Policy">
                <select
                  id="outside-decorator-approval"
                  value={details.outsideDecoratorAllowed || 'With approval'}
                  onChange={(e) => updateField('outsideDecoratorAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'With approval'].map((od) => (
                    <option key={od} value={od}>{od}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Binary Decor Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Toggle
                id="toggle-basic-decor"
                label="Basic In-House Decor"
                description="Chair sashes, linens, and podium"
                checked={details.basicDecorationIncluded ?? true}
                onChange={(val) => updateField('basicDecorationIncluded', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-floral-decor"
                label="Floral Arrangements"
                description="Fresh floral centerpieces & entrance arch"
                checked={details.floralDecorationAvailable ?? true}
                onChange={(val) => updateField('floralDecorationAvailable', val)}
                card
                size="sm"
              />

              <Toggle
                id="toggle-stage-decor"
                label="Stage & Backdrop Setup"
                description="Custom backdrop framing & stage carpet"
                checked={details.stageDecorationAvailable ?? true}
                onChange={(val) => updateField('stageDecorationAvailable', val)}
                card
                size="sm"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Decoration services are disabled. Client must provide full external decorating crew.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          9. PHOTOGRAPHY (As Hotel Policy)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                9. Photography Policies (Venue Rules)
              </h3>
              <p className="text-xs text-[#737373]">
                Guidelines for commercial shoots, drone permits, and scenic property zones
              </p>
            </div>
          </div>
          <Toggle
            id="gate-photography-policy"
            label="Specific Photo Policies"
            checked={details.hasPhotographyPolicy ?? true}
            onChange={(val) => updateField('hasPhotographyPolicy', val)}
            size="sm"
          />
        </div>

        {details.hasPhotographyPolicy ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Toggle
                id="toggle-photography-allowed"
                fieldLabel="Photography Permission"
                label="Allowed on Premises"
                description="On-site event coverage"
                checked={details.photographyAllowed ?? true}
                onChange={(val) => updateField('photographyAllowed', val)}
                size="sm"
              />

              <FormField id="ext-photographer" label="External Photographer">
                <select
                  id="ext-photographer"
                  value={details.externalPhotographerAllowed || 'Yes'}
                  onChange={(e) => updateField('externalPhotographerAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'With approval'].map((ep) => (
                    <option key={ep} value={ep}>{ep}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="pre-wedding-shoot" label="Pre-Wedding Couple Shoots">
                <select
                  id="pre-wedding-shoot"
                  value={details.preWeddingShootAllowed || 'Yes'}
                  onChange={(e) => updateField('preWeddingShootAllowed', e.target.value)}
                  className={inputCls}
                >
                  {['Yes', 'No', 'Additional fee'].map((pw) => (
                    <option key={pw} value={pw}>{pw}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Scenic Photography Locations MultiSelect */}
            <MultiSelect
              id="photo-locations"
              label="Approved Photography & Portrait Locations"
              description="Select all areas accessible for wedding photo sessions"
              options={[
                'Garden',
                'Ballroom',
                'Lobby',
                'Pool',
                'Beach',
                'Rooftop',
                'Exterior',
                'Bridal Suite',
              ]}
              value={details.photographyLocations || ['Garden', 'Ballroom', 'Lobby', 'Exterior']}
              onChange={(newVal) => updateField('photographyLocations', newVal)}
            />
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Standard photography terms apply without property restrictions.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          10. POLICIES & TERMS (Gated Section)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-[#FCF8FA] border-b border-[#F1E5EC]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                10. Venue Policies & Booking Terms
              </h3>
              <p className="text-xs text-[#737373]">
                Deposit terms, minimum guest counts, booking durations & vendor rules
              </p>
            </div>
          </div>
          <Toggle
            id="gate-policies"
            label="Enforce Custom Policies"
            checked={details.hasPolicies ?? true}
            onChange={(val) => updateField('hasPolicies', val)}
            size="sm"
          />
        </div>

        {details.hasPolicies ? (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Toggle
                id="toggle-deposit-required"
                fieldLabel="Deposit Requirement"
                label="Deposit Required"
                description="Security advance fee"
                checked={details.depositRequired ?? true}
                onChange={(val) => updateField('depositRequired', val)}
                size="sm"
              />

              {details.depositRequired && (
                <FormField
                  id="deposit-amount"
                  label="Deposit Amount / Percentage"
                  hint="e.g. 25% or Rs. 50,000"
                >
                  <input
                    id="deposit-amount"
                    type="text"
                    value={details.depositAmount || ''}
                    onChange={(e) => updateField('depositAmount', e.target.value)}
                    placeholder="e.g. 25% advance to secure date"
                    className={inputCls}
                  />
                </FormField>
              )}

              <FormField
                id="min-guest-count"
                label="Minimum Guest Count"
                hint="Minimum headcount for halls"
              >
                <input
                  id="min-guest-count"
                  type="number"
                  min="0"
                  value={details.minimumGuestCount || ''}
                  onChange={(e) => updateField('minimumGuestCount', e.target.value)}
                  placeholder="e.g. 100"
                  className={inputCls}
                />
              </FormField>

              <FormField
                id="min-booking-duration"
                label="Minimum Booking Duration"
                hint="Standard hall access block"
              >
                <input
                  id="min-booking-duration"
                  type="text"
                  value={details.minimumBookingDuration || ''}
                  onChange={(e) => updateField('minimumBookingDuration', e.target.value)}
                  placeholder="e.g. 6 hours"
                  className={inputCls}
                />
              </FormField>
            </div>

            {/* Textarea Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="cancellation-policy"
                label="Cancellation & Refund Policy"
                hint="Refund tiers and penalty windows"
              >
                <textarea
                  id="cancellation-policy"
                  rows={3}
                  value={details.cancellationPolicy || ''}
                  onChange={(e) => updateField('cancellationPolicy', e.target.value)}
                  placeholder="Explain terms for date changes, cancellation deadlines, and refund percentages..."
                  className={`${inputCls} resize-none`}
                />
              </FormField>

              <FormField
                id="outside-vendor-restrictions"
                label="Outside Vendor Restrictions"
                hint="Rules for outside decorators, bands, etc."
              >
                <textarea
                  id="outside-vendor-restrictions"
                  rows={3}
                  value={details.outsideVendorRestrictions || ''}
                  onChange={(e) => updateField('outsideVendorRestrictions', e.target.value)}
                  placeholder="e.g. External vendors must carry third-party insurance and coordinate setup 14 days in advance..."
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            </div>

            <FormField
              id="additional-charges"
              label="Additional Charges & Surcharges"
              hint="Electricity, extra hours, cleanup fees"
            >
              <textarea
                id="additional-charges"
                rows={2}
                value={details.additionalCharges || ''}
                onChange={(e) => updateField('additionalCharges', e.target.value)}
                placeholder="e.g. Additional hall usage charged at Rs. 15,000/hour after midnight..."
                className={`${inputCls} resize-none`}
              />
            </FormField>
          </div>
        ) : (
          <div className="p-4 bg-slate-50/60 text-xs text-[#737373] text-center">
            Standard venue contract policies apply.
          </div>
        )}
      </div>

    </div>
  );
}
