/**
 * RegistrationStepper.jsx — Wizard Progress Stepper
 * Keyboard accessible, responsive, Oleena Mauve theme.
 *
 * Desktop layout: TWO separate sibling rows.
 *   Row 1: circles + connector line only (h-8 fixed, no text).
 *   Row 2: title + subtitle labels only (no absolute children).
 * Row 1 height is determined solely by circle size; text in Row 2
 * cannot affect it in any way.
 */

import { Check } from 'lucide-react';

const STEPS = [
  { id: 0, title: 'Account', subtitle: 'Credentials & Login' },
  { id: 1, title: 'Business', subtitle: 'Company Details' },
  { id: 2, title: 'Contact & Location', subtitle: 'Inquiries & Areas' },
  { id: 3, title: 'Review & Submit', subtitle: 'Final Confirmation' },
];

export default function RegistrationStepper({
  currentStep,
  maxStepReached = 0,
  onStepClick,
  className = '',
}) {
  // Connector track geometry — computed from STEPS.length so it works for any N.
  // The track starts at the center of step 0 and ends at the center of step N-1.
  // Center of step i  =  (i + 0.5) / N  * 100%
  // So: left = center of step 0 = (0.5 / N) * 100 = 50/N %
  //     right = 100% - center of last = same = 50/N %
  const halfCell = (100 / STEPS.length) / 2; // e.g. 12.5 for 4 steps
  const fgWidth =
    currentStep === 0
      ? 0
      : (currentStep / (STEPS.length - 1)) * (100 - 100 / STEPS.length);

  return (
    <nav aria-label="Registration progress" className={`w-full ${className}`}>

      {/* ── MOBILE: compact progress bar (untouched) ── */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1E293B]">
          <span className="text-[#8E406F] uppercase tracking-wider">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-[#64748B] font-medium">
            {STEPS[currentStep]?.title}
          </span>
        </div>
        <div className="w-full h-2 bg-[#E8DDE4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8E406F] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── DESKTOP: two-row layout ── */}
      <div className="hidden md:block">

        {/*
         * ════════════════════════════════════════════════════
         * ROW 1 — Circles + connector line ONLY.
         * Fixed height h-8 (2rem) = exactly the circle height.
         * Nothing in this row has any text, so its height is
         * entirely determined by the circle size. Row 2 (below)
         * is a completely separate sibling element and cannot
         * affect this row's geometry.
         * ════════════════════════════════════════════════════
         */}
        <div className="relative flex items-center h-8">

          {/* Background track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-[#E8DDE4] pointer-events-none"
            style={{ left: `${halfCell}%`, right: `${halfCell}%` }}
            aria-hidden="true"
          />

          {/* Foreground (completed) track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-[#8E406F] transition-all duration-300 pointer-events-none"
            style={{ left: `${halfCell}%`, width: `${fgWidth}%` }}
            aria-hidden="true"
          />

          {/* One column per step — circle button only */}
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent  = currentStep === idx;
            const isAccessible = idx <= maxStepReached;

            return (
              <div
                key={step.id}
                className="flex-1 min-w-0 flex justify-center relative z-10"
              >
                <button
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => isAccessible && onStepClick?.(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${idx + 1}: ${step.title}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                    transition-all duration-300 shadow-sm focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2
                    ${isCompleted
                      ? 'bg-[#8E406F] text-white'
                      : isCurrent
                      ? 'bg-[#FDF0F4] border-2 border-[#8E406F] text-[#8E406F] ring-2 ring-[#8E406F]/20'
                      : 'bg-white border-2 border-[#E8DDE4] text-[#94A3B8] opacity-75'
                    }
                    ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {isCompleted
                    ? <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    : <span>{idx + 1}</span>
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/*
         * ════════════════════════════════════════════════════
         * ROW 2 — Labels ONLY.
         * Plain flex row, no absolute children, no connector.
         * Column structure mirrors Row 1 (same flex-1 min-w-0)
         * so each label sits directly under its circle with no
         * manual alignment math.
         * The label wrapper is also a button so keyboard users
         * can click a step from the label too.
         * ════════════════════════════════════════════════════
         */}
        <div className="flex mt-2">
          {STEPS.map((step, idx) => {
            const isCompleted  = currentStep > idx;
            const isCurrent    = currentStep === idx;
            const isAccessible = idx <= maxStepReached;

            return (
              <div key={step.id} className="flex-1 min-w-0">
                <button
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => isAccessible && onStepClick?.(idx)}
                  tabIndex={-1}          /* circle button in Row 1 already handles tab focus */
                  aria-hidden="true"     /* screenreader uses Row 1 button; this is pointer UX only */
                  className={`w-full flex flex-col items-center text-center
                    focus:outline-none
                    ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <span
                    className={`text-xs font-semibold leading-tight truncate w-full
                      transition-colors
                      ${isCurrent
                        ? 'text-[#8E406F]'
                        : isCompleted
                        ? 'text-[#1E293B]'
                        : 'text-[#94A3B8]'
                      }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-normal leading-tight truncate w-full">
                    {step.subtitle}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

      </div>{/* end desktop block */}
    </nav>
  );
}

export { STEPS };
