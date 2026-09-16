// MultiSelect.jsx — Reusable interactive chip/tag selection primitive
// Supports string array or { value, label, description } objects.
// Active state uses Oleena Mauve (#8E406F) & Blush tint (#FDF0F4).

import { Check } from 'lucide-react';

export default function MultiSelect({
  id,
  label,
  description,
  options = [],
  value = [],
  onChange,
  disabled = false,
  layout = 'wrap', // 'wrap' | 'grid-2' | 'grid-3'
  className = '',
}) {
  const selectedSet = new Set(value);

  const toggleOption = (optVal) => {
    if (disabled) return;
    if (selectedSet.has(optVal)) {
      onChange?.(value.filter((v) => v !== optVal));
    } else {
      onChange?.([...value, optVal]);
    }
  };

  const layoutClass =
    layout === 'grid-2'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
      : layout === 'grid-3'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'
      : 'flex flex-wrap gap-2';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label id={id ? `${id}-label` : undefined} className="text-sm font-medium text-[#1E293B]">
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-[#737373] mt-0.5">{description}</span>
          )}
        </div>
      )}

      <div className={layoutClass} role="group" aria-labelledby={id ? `${id}-label` : undefined}>
        {options.map((opt) => {
          const isObj = typeof opt === 'object' && opt !== null;
          const optValue = isObj ? opt.value : opt;
          const optLabel = isObj ? opt.label : opt;
          const optDesc = isObj ? opt.description : null;
          const OptIcon = isObj ? opt.icon : null;
          const isSelected = selectedSet.has(optValue);

          return (
            <button
              key={optValue}
              type="button"
              disabled={disabled}
              onClick={() => toggleOption(optValue)}
              aria-pressed={isSelected}
              className={`group relative flex items-center justify-between text-left transition-all duration-150 active:scale-[0.98] ${
                optDesc ? 'p-3 rounded-xl' : 'px-3.5 py-2 rounded-lg'
              } border text-xs sm:text-sm font-medium ${
                disabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#8E406F] bg-[#FDF0F4] text-[#8E406F] shadow-sm ring-1 ring-[#8E406F]/20'
                  : 'border-[#E8DDE4] bg-white text-[#475569] hover:border-[#C495B2] hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {OptIcon && (
                  <OptIcon
                    size={16}
                    className={`shrink-0 ${
                      isSelected ? 'text-[#8E406F]' : 'text-[#64748B] group-hover:text-[#8E406F]'
                    }`}
                  />
                )}
                <div className="min-w-0">
                  <p className={`truncate leading-snug ${isSelected ? 'font-semibold text-[#8E406F]' : 'text-[#334155]'}`}>
                    {optLabel}
                  </p>
                  {optDesc && (
                    <p className={`text-[11px] leading-tight mt-0.5 ${isSelected ? 'text-[#8E406F]/80' : 'text-[#737373]'}`}>
                      {optDesc}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  isSelected
                    ? 'border-[#8E406F] bg-[#8E406F] text-white'
                    : 'border-[#CBD5E1] bg-white group-hover:border-[#8E406F]/50'
                }`}
              >
                {isSelected && <Check size={11} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
