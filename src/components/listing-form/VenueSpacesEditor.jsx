// VenueSpacesEditor.jsx — Repeatable spaces/halls manager for Venue & Hotel listings
// Allows vendors to configure individual spaces (Ballrooms, Lawns, Pavilions, etc.)

import { useState } from 'react';
import { Plus, Trash2, Building2, Users, Wind, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Toggle from '../common/Toggle';
import FormField from '../common/FormField';

const SPACE_TYPES = [
  'Indoor Ballroom',
  'Outdoor Lawn / Garden',
  'Covered Terrace / Verandah',
  'Poolside Deck',
  'Beachfront',
  'Rooftop Terrace',
  'Banquet Hall',
  'Conference / Multi-purpose Room',
];

const inputCls =
  'w-full rounded-lg border border-[#E8DDE4] bg-white px-3 py-2 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

export default function VenueSpacesEditor({ spaces = [], onChange, error }) {
  const [expandedIndex, setExpandedIndex] = useState(0); // expand first space by default

  const handleAddSpace = () => {
    const newSpace = {
      id: `space-${Date.now()}`,
      name: '',
      type: 'Indoor Ballroom',
      capacitySeated: '',
      capacityFloating: '',
      isAirConditioned: true,
      description: '',
    };
    const nextSpaces = [...spaces, newSpace];
    onChange?.(nextSpaces);
    setExpandedIndex(nextSpaces.length - 1);
  };

  const handleRemoveSpace = (indexToRemove) => {
    const nextSpaces = spaces.filter((_, idx) => idx !== indexToRemove);
    onChange?.(nextSpaces);
    if (expandedIndex >= nextSpaces.length) {
      setExpandedIndex(Math.max(0, nextSpaces.length - 1));
    }
  };

  const handleUpdateSpace = (index, field, value) => {
    const nextSpaces = spaces.map((sp, idx) => {
      if (idx !== index) return sp;
      return { ...sp, [field]: value };
    });
    onChange?.(nextSpaces);
  };

  // Calculate total capacities
  const totalSeated = spaces.reduce((sum, sp) => sum + (Number(sp.capacitySeated) || 0), 0);
  const totalFloating = spaces.reduce((sum, sp) => sum + (Number(sp.capacityFloating) || 0), 0);

  return (
    <div className="space-y-4">
      {/* ── Header with stats ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#F1E5EC]">
        <div>
          <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <Building2 size={18} className="text-[#8E406F]" />
            Venue Spaces & Banquet Halls
          </h3>
          <p className="text-xs text-[#737373]">
            Add details for each ballroom, garden lawn, or event space available at this venue.
          </p>
        </div>

        {spaces.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F4] border border-[#F1E5EC] font-semibold text-[#8E406F]">
              <Users size={13} />
              Total Max Seated: {totalSeated.toLocaleString()}
            </span>
            {totalFloating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-medium text-slate-700">
                Floating: {totalFloating.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-fadeIn">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty State ── */}
      {spaces.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E8DDE4] bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] mb-3">
            <Building2 size={22} />
          </div>
          <h4 className="text-sm font-bold text-[#1E293B] mb-1">No event spaces added yet</h4>
          <p className="text-xs text-[#737373] max-w-sm mx-auto mb-4">
            Add at least one space (e.g. Grand Ballroom, Poolside Lawn) so couples know your room options and seating capacities.
          </p>
          <button
            type="button"
            id="add-first-space-btn"
            onClick={handleAddSpace}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8E406F] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
          >
            <Plus size={15} />
            Add First Space
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {spaces.map((space, idx) => {
            const isExpanded = expandedIndex === idx;
            const spaceNameDisplay = space.name?.trim() || `Space #${idx + 1} (Untitled)`;

            return (
              <div
                key={space.id || idx}
                className="rounded-2xl border border-[#F1E5EC] bg-white shadow-sm transition-all duration-200 overflow-hidden"
              >
                {/* ── Card Header ── */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors ${
                    isExpanded ? 'bg-[#FCF8FA] border-b border-[#F1E5EC]' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8E406F]/10 text-xs font-bold text-[#8E406F]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#1E293B] truncate">
                          {spaceNameDisplay}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {space.type}
                        </span>
                        {space.isAirConditioned && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-medium">
                            <Wind size={10} /> AC
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737373] truncate">
                        {space.capacitySeated ? `${space.capacitySeated} seated` : 'Capacity not set'}
                        {space.capacityFloating ? ` • ${space.capacityFloating} floating` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label="Remove space"
                      title="Remove space"
                      onClick={() => handleRemoveSpace(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* ── Card Body (Expanded) ── */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        id={`space-${idx}-name`}
                        label="Space / Hall Name"
                        required
                        hint="e.g. Lotus Grand Ballroom"
                      >
                        <input
                          id={`space-${idx}-name`}
                          type="text"
                          value={space.name}
                          onChange={(e) => handleUpdateSpace(idx, 'name', e.target.value)}
                          placeholder="e.g. Grand Ballroom"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField
                        id={`space-${idx}-type`}
                        label="Space Type"
                        required
                      >
                        <select
                          id={`space-${idx}-type`}
                          value={space.type}
                          onChange={(e) => handleUpdateSpace(idx, 'type', e.target.value)}
                          className={inputCls}
                        >
                          {SPACE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <FormField
                        id={`space-${idx}-seated`}
                        label="Seated Capacity"
                        required
                        hint="Guests with tables"
                      >
                        <input
                          id={`space-${idx}-seated`}
                          type="number"
                          min="0"
                          value={space.capacitySeated}
                          onChange={(e) => handleUpdateSpace(idx, 'capacitySeated', e.target.value)}
                          placeholder="e.g. 350"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField
                        id={`space-${idx}-floating`}
                        label="Floating / Standing"
                        hint="Cocktail style"
                      >
                        <input
                          id={`space-${idx}-floating`}
                          type="number"
                          min="0"
                          value={space.capacityFloating}
                          onChange={(e) => handleUpdateSpace(idx, 'capacityFloating', e.target.value)}
                          placeholder="e.g. 500"
                          className={inputCls}
                        />
                      </FormField>

                      <Toggle
                        id={`space-${idx}-ac`}
                        fieldLabel="Climate Control"
                        label="Air Conditioned"
                        description="Full indoor cooling"
                        checked={space.isAirConditioned}
                        onChange={(val) => handleUpdateSpace(idx, 'isAirConditioned', val)}
                        size="sm"
                      />
                    </div>

                    <FormField
                      id={`space-${idx}-desc`}
                      label="Key Features & Amenities"
                      hint="Optional highlights"
                    >
                      <textarea
                        id={`space-${idx}-desc`}
                        rows={2}
                        value={space.description}
                        onChange={(e) => handleUpdateSpace(idx, 'description', e.target.value)}
                        placeholder="e.g. Crystal chandeliers, integrated stage lighting, sound console, dedicated bridal suite."
                        className={`${inputCls} resize-none`}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Add Another Space Button ── */}
          <button
            type="button"
            id="add-another-space-btn"
            onClick={handleAddSpace}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#8E406F]/30 bg-[#FDF0F4]/50 py-3 text-xs font-semibold text-[#8E406F] hover:bg-[#FDF0F4] hover:border-[#8E406F] transition active:scale-[0.99]"
          >
            <Plus size={16} />
            Add Another Event Space
          </button>
        </div>
      )}
    </div>
  );
}
