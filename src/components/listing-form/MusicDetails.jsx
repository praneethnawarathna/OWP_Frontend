// ============================================================
// MusicDetails.jsx
// Feature: Vendor Portal → Create/Edit Listing Wizard
// Category: Music Specific Attributes
// Sections: Performance Type & Lineup, Audio & Stage Lighting (Gates),
// Services & Performance Extras (MC, Breaks, Custom Songs).
// ============================================================

import React from 'react';
import {
  Music,
  Radio,
  Sliders,
  Sparkles,
  Mic2,
  Clock,
  Speaker,
} from 'lucide-react';
import Toggle from '../common/Toggle';
import MultiSelect from '../common/MultiSelect';
import FormField from '../common/FormField';

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function MusicDetails({ details = {}, onChange }) {
  const updateField = (field, value) => {
    onChange?.({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────────────────────
          1. PERFORMANCE TYPE & REPERTOIRE
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Music size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              1. Performance Type & Musical Lineup
            </h3>
            <p className="text-xs text-[#737373]">
              Ensemble style, lineup size, genres, and standard set duration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField id="perf-type" label="Performance Type" required>
            <select
              id="perf-type"
              value={details.performanceType || 'Live Band'}
              onChange={(e) => updateField('performanceType', e.target.value)}
              className={inputCls}
            >
              {[
                'Live Band',
                'DJ & Sound Engineer',
                'DJ + Live Instrumentalists (Hybrid)',
                'Acoustic Duo / Trio',
                'Classical Strings / Chamber Ensemble',
                'Traditional Cultural Ensemble (Hewisi / Magul Bera)',
              ].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>

          <FormField id="lineup-size" label="Band / Team Size" required>
            <select
              id="lineup-size"
              value={details.lineupSize || '6–8 Piece Full Band'}
              onChange={(e) => updateField('lineupSize', e.target.value)}
              className={inputCls}
            >
              {[
                'Solo Artist',
                'Duo / Trio',
                '4–5 Piece Band',
                '6–8 Piece Full Band',
                '9+ Piece Big Band / Brass Section',
                'Solo DJ with Host / MC',
              ].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </FormField>

          <FormField id="set-duration" label="Standard Set Duration" required>
            <select
              id="set-duration"
              value={details.setDuration || '5 Hours (Standard Reception)'}
              onChange={(e) => updateField('setDuration', e.target.value)}
              className={inputCls}
            >
              {[
                '2 Hours (Ceremony / Cocktails)',
                '3 Hours',
                '4 Hours',
                '5 Hours (Standard Reception)',
                'Full Event (6+ Hours)',
              ].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
        </div>

        <MultiSelect
          id="music-genres"
          label="Genres & Musical Repertoire"
          description="Select all music genres your group actively performs or mixes"
          options={[
            'Pop & Top 40',
            'Sri Lankan Baila',
            'Classic Rock & Retro (70s/80s)',
            'Jazz & Swing',
            'R&B & Soul',
            'EDM & Modern Dance',
            'Bollywood & Hindi Hits',
            'Classical & Instrumental Strings',
            'Country & Acoustic Folk',
            'Reggae & Tropical Grooves',
          ]}
          value={details.genres || ['Pop & Top 40', 'Sri Lankan Baila', 'Classic Rock & Retro (70s/80s)']}
          onChange={(val) => updateField('genres', val)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. AUDIO, LIGHTING & TECHNICAL HARDWARE (GATED)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Speaker size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              2. Sound System, Stage Lighting & Technical Rig
            </h3>
            <p className="text-xs text-[#737373]">
              Audio PA packages, wireless microphones, dance floor lighting, and power checks
            </p>
          </div>
        </div>

        {/* Sound System Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Speaker size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Full Sound System (PA & Speakers) Provided</span>
                <p className="text-[11px] text-[#737373]">Provide speakers, subwoofers, and digital mixer console</p>
              </div>
            </div>
            <Toggle
              id="gate-sound-system"
              label="Provide Sound System"
              checked={details.soundSystemIncluded ?? true}
              onChange={(val) => updateField('soundSystemIncluded', val)}
              size="sm"
            />
          </div>

          {details.soundSystemIncluded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <FormField id="pa-capacity" label="Audio System Guest Capacity">
                <select
                  id="pa-capacity"
                  value={details.soundSystemCapacity || 'Medium Hall (150–350 Guests)'}
                  onChange={(e) => updateField('soundSystemCapacity', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'Intimate Setup (up to 150 Guests)',
                    'Medium Hall (150–350 Guests)',
                    'Large Ballroom (350–600 Guests)',
                    'Concert Scale / Outdoor Grounds (600+ Guests)',
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="wireless-mics" label="Wireless Microphones Included">
                <select
                  id="wireless-mics"
                  value={details.wirelessMics || '2 Wireless Handheld Mics'}
                  onChange={(e) => updateField('wirelessMics', e.target.value)}
                  className={inputCls}
                >
                  {[
                    '2 Wireless Handheld Mics (Toasts & MC)',
                    '4 Wireless Handheld Mics',
                    'Full Miking (Instruments + 4 Wireless)',
                    'Not Included (Venue supplies mics)',
                  ].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
        </div>

        {/* Stage Lighting Gate */}
        <div className="rounded-xl border border-[#F1E5EC] bg-[#FCF8FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#8E406F]" />
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Stage & Dance Floor Lighting</span>
                <p className="text-[11px] text-[#737373]">Provide dynamic wash, moving heads, or laser effects</p>
              </div>
            </div>
            <Toggle
              id="gate-stage-lighting"
              label="Provide Stage Lighting"
              checked={details.stageLightingIncluded ?? true}
              onChange={(val) => updateField('stageLightingIncluded', val)}
              size="sm"
            />
          </div>

          {details.stageLightingIncluded && (
            <div className="pt-2 border-t border-[#F1E5EC] animate-fadeIn">
              <FormField id="lighting-rig" label="Lighting Rig Configuration">
                <select
                  id="lighting-rig"
                  value={details.lightingRig || 'Moving Heads & Truss Lighting'}
                  onChange={(e) => updateField('lightingRig', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'Basic Ambient Wash (Warm par cans on stage)',
                    'Moving Heads & Truss Lighting',
                    'Full DMX Computerized Show + Lasers & Haze',
                  ].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <FormField id="setup-time" label="Setup & Soundcheck Time Required">
            <select
              id="setup-time"
              value={details.setupTimeRequired || '2 Hours Prior'}
              onChange={(e) => updateField('setupTimeRequired', e.target.value)}
              className={inputCls}
            >
              {['1 Hour Prior', '2 Hours Prior', '3 Hours Prior', 'Early Morning / Previous Day'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>

          <Toggle
            id="toggle-audio-backup"
            fieldLabel="Hardware Reliability"
            label="Spare Audio Hardware On Site"
            description="Backup mixer, spare cables & reserve wireless mics"
            checked={details.backupHardwareOnSite ?? true}
            onChange={(val) => updateField('backupHardwareOnSite', val)}
            size="sm"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SERVICES & PERFORMANCE EXTRAS
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1E5EC]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Mic2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">
              3. Services & Performance Add-ons
            </h3>
            <p className="text-xs text-[#737373]">
              MC hosting, background dinner music, custom first dances, and overtime fees
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Toggle
            id="toggle-mc-services"
            label="Master of Ceremonies (MC) Included"
            description="Professional host for cake cutting, toasts & bridal entry"
            checked={details.mcServicesIncluded ?? true}
            onChange={(val) => updateField('mcServicesIncluded', val)}
            card
            size="sm"
          />

          <Toggle
            id="toggle-break-music"
            label="Continuous Music During Band Breaks"
            description="Curated DJ playlist ensures zero awkward silence"
            checked={details.breakMusicIncluded ?? true}
            onChange={(val) => updateField('breakMusicIncluded', val)}
            card
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <FormField id="custom-song-requests" label="First Dance & Custom Song Requests">
            <select
              id="custom-song-requests"
              value={details.customSongsAllowed || 'Up to 3 Rehearsed Songs'}
              onChange={(e) => updateField('customSongsAllowed', e.target.value)}
              className={inputCls}
            >
              {[
                'Unlimited Custom Song Requests',
                'Up to 3 Rehearsed Songs (First dance + parent dances)',
                '1 Custom Rehearsed Song',
                'Standard Repertoire Only',
              ].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>

          <FormField id="overtime-rate" label="Overtime Hourly Rate" hint="Charged per hour past contract">
            <input
              id="overtime-rate"
              type="text"
              value={details.overtimeRate || 'Rs. 25,000 / Hour'}
              onChange={(e) => updateField('overtimeRate', e.target.value)}
              placeholder="e.g. Rs. 25,000 / Hour"
              className={inputCls}
            />
          </FormField>
        </div>
      </div>

    </div>
  );
}
