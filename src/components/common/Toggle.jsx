// Toggle.jsx — Reusable boolean switch primitive
// Styled with Oleena Mauve (#8E406F) active state and smooth transition

export default function Toggle({
  id,
  name,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md', // 'sm' | 'md'
  align = 'center', // 'center' | 'start' (default 'center' for true vertical alignment)
  card = false, // When true, renders a bordered, padded card container
  fieldLabel, // Optional top label to align with adjacent FormField components in a grid
  hint, // Optional bottom hint text matching FormField hint
  className = '',
}) {
  const isSm = size === 'sm';
  const switchWidth = isSm ? 'w-9 h-5' : 'w-11 h-6';
  const dotSize = isSm ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const translatePos = isSm ? 'translate-x-4' : 'translate-x-5';

  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const switchButton = (
    <button
      type="button"
      id={id}
      name={name}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center shrink-0 ${switchWidth} cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:ring-offset-1 ${
        disabled
          ? 'bg-gray-200 cursor-not-allowed opacity-60'
          : checked
          ? 'bg-[#8E406F]'
          : 'bg-gray-300 hover:bg-gray-400/80'
      }`}
    >
      <span className="sr-only">{label || fieldLabel || 'Toggle switch'}</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block ${dotSize} transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? translatePos : 'translate-x-0'
        }`}
      />
    </button>
  );

  // Mode 1: When placed in a grid row alongside FormField inputs, match label + 42px height alignment
  if (fieldLabel) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="flex items-center justify-between text-xs font-semibold text-[#1E293B]">
          <span>{fieldLabel}</span>
          {hint && <span className="text-[11px] font-normal text-[#94A3B8]">{hint}</span>}
        </label>
        <div
          className={`h-[42px] flex items-center justify-between px-3.5 rounded-xl border border-[#E8DDE4] bg-slate-50/60 hover:border-[#D4C3CE] transition-colors cursor-pointer select-none`}
          onClick={handleClick}
        >
          {(label || description) ? (
            <div className="flex flex-col min-w-0 pr-2">
              {label && (
                <span className={`font-medium ${disabled ? 'text-gray-400' : 'text-[#1E293B]'} ${isSm ? 'text-xs' : 'text-sm'} leading-none`}>
                  {label}
                </span>
              )}
              {description && (
                <span className={`text-[#737373] mt-0.5 truncate ${isSm ? 'text-[11px]' : 'text-xs'} leading-tight`}>
                  {description}
                </span>
              )}
            </div>
          ) : <div />}
          <div onClick={(e) => e.stopPropagation()}>
            {switchButton}
          </div>
        </div>
      </div>
    );
  }

  // Mode 2: Card container mode or standalone inline switch
  return (
    <div
      className={`flex ${align === 'start' ? 'items-start' : 'items-center'} justify-between gap-3 ${
        card
          ? 'p-3 rounded-xl border border-[#E8DDE4] bg-slate-50/50 hover:border-[#D4C3CE] transition-colors'
          : ''
      } ${className}`}
    >
      {(label || description) && (
        <div className="flex flex-col select-none cursor-pointer min-w-0" onClick={handleClick}>
          {label && (
            <span className={`font-medium ${disabled ? 'text-gray-400' : 'text-[#1E293B]'} ${isSm ? 'text-xs' : 'text-sm'}`}>
              {label}
            </span>
          )}
          {description && (
            <span className={`text-[#737373] mt-0.5 leading-snug ${isSm ? 'text-[11px]' : 'text-xs'}`}>
              {description}
            </span>
          )}
        </div>
      )}

      {switchButton}
    </div>
  );
}
