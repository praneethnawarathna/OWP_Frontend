/**
 * RegistrationStepper.jsx — Wizard Progress Stepper
 * Keyboard accessible, responsive, Oleena Mauve theme.
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
  return (
    <nav
      aria-label="Registration progress"
      className={`w-full ${className}`}
    >
      {/* Mobile view: Compact progress indicator */}
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

      {/* Desktop view: Step items with connectors */}
      <ol className="hidden md:flex items-center w-full justify-between relative">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isCurrent = currentStep === idx;
          const isAccessible = idx <= maxStepReached;

          return (
            <li
              key={step.id}
              className="flex-1 relative last:flex-none flex items-center"
            >
              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  className="absolute top-4 left-8 right-0 h-0.5 -translate-y-1/2 transition-colors duration-300"
                  style={{
                    backgroundColor: isCompleted ? '#8E406F' : '#E8DDE4',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Step item button / element */}
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick?.(idx)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative z-10 flex items-center gap-3 text-left group transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2 rounded-lg p-1 ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-[#8E406F] text-white'
                      : isCurrent
                      ? 'bg-[#FDF0F4] border-2 border-[#8E406F] text-[#8E406F] ring-2 ring-[#8E406F]/20'
                      : 'bg-white border-2 border-[#E8DDE4] text-[#94A3B8] opacity-75'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Text */}
                <div className="hidden lg:flex flex-col">
                  <span
                    className={`text-xs font-semibold leading-tight transition-colors ${
                      isCurrent
                        ? 'text-[#8E406F]'
                        : isCompleted
                        ? 'text-[#1E293B]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-normal leading-tight">
                    {step.subtitle}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { STEPS };
