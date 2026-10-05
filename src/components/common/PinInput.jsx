// PinInput.jsx — Reusable 4-digit PIN entry component
//
// Usage:
//   const [pin, setPin] = useState(['', '', '', '']);
//   <PinInput id="current-pin" value={pin} onChange={setPin} hasError={pinError} />
//
// This component is intentionally shared (not page-local) so that:
//   - AdminSettingsPage can use it for Change PIN flow
//   - Future SuperAdmin settings page can reuse it
//   - Any "high-impact action" confirmation dialog can import it
//
// Design matches the LoginPage PIN entry pattern already established in this codebase.

import { useRef } from 'react';

/**
 * PinInput
 *
 * @param {string}   id        - Unique ID prefix for each digit input (for a11y)
 * @param {string[]} value     - Array of 4 digit strings, e.g. ['1','2','','']
 * @param {Function} onChange  - Called with updated 4-element array on every change
 * @param {boolean}  disabled  - Disables all inputs
 * @param {boolean}  hasError  - Applies red ring to all boxes when true
 * @param {string}   size      - 'md' (default) | 'lg' for larger boxes
 */
export default function PinInput({
  id = 'pin',
  value = ['', '', '', ''],
  onChange,
  disabled = false,
  hasError = false,
  size = 'md',
}) {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const boxSize = size === 'lg'
    ? 'h-14 w-12 text-xl'
    : 'h-11 w-10 text-base';

  const handleChange = (index, rawValue) => {
    // Accept only the last typed digit (strip non-numeric)
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange?.(next);

    // Auto-advance to next box on digit entry
    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // On Backspace in an empty box, move focus to previous box
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const next = [...value];
    pasted.split('').forEach((char, i) => {
      if (i < 4) next[i] = char;
    });
    onChange?.(next);
    // Focus last filled cell
    const lastIndex = Math.min(pasted.length, 3);
    refs[lastIndex].current?.focus();
  };

  return (
    <div className="flex items-center gap-3" role="group" aria-label="PIN entry">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={refs[i]}
          id={`${id}-digit-${i}`}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          disabled={disabled}
          autoComplete="off"
          aria-label={`PIN digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            ${boxSize}
            rounded-xl border-2 text-center font-bold tabular-nums
            transition-all duration-150 outline-none
            ${hasError
              ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
              : 'border-[#e8c4d8] bg-[#FDF0F4] text-[#8E406F] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        />
      ))}
    </div>
  );
}
