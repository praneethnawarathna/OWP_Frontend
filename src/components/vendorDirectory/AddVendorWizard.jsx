/**
 * AddVendorWizard.jsx
 * Thin orchestrator that wires together the four step components built by the
 * registration team (AccountStep → BusinessStep → ContactLocationStep → ReviewStep)
 * and drives them with the existing registrationApi.
 *
 * Props:
 *   onClose()          — close the modal (no success)
 *   onSuccess()        — close the modal AND refresh the vendor list
 */

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import RegistrationStepper from "../vendorRegistration/RegistrationStepper";
import AccountStep         from "../vendorRegistration/AccountStep";
import BusinessStep        from "../vendorRegistration/BusinessStep";
import ContactLocationStep from "../vendorRegistration/ContactLocationStep";
import ReviewStep          from "../vendorRegistration/ReviewStep";
import { fetchOptions, submitRegistration } from "../vendorRegistration/registrationApi";
import {
  validateAccountStep,
  validateBusinessStep,
  validateContactLocationStep,
  validateReviewStep,
  getStepForField,
} from "../vendorRegistration/validation";

// ── Initial form shape ────────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Step 0 — Account
  fullName: "", email: "", password: "", confirmPassword: "", phoneNumber: "",
  // Step 1 — Business
  businessName: "", businessType: "", category: "", tagline: "",
  description: "", yearsInBusiness: "", businessRegistrationNumber: "",
  // Step 2 — Contact & Location
  businessEmail: "", contactNumber: "", altPhoneNumber: "", websiteUrl: "",
  address: "", city: "", district: "", postalCode: "", serviceAreas: [],
  // Step 3 — Review
  acceptTerms: false,
};

// Per-step validators
const VALIDATORS = [
  validateAccountStep,
  validateBusinessStep,
  validateContactLocationStep,
  validateReviewStep,
];

export default function AddVendorWizard({ onClose, onSuccess }) {
  const [step,           setStep]           = useState(0);
  const [maxStep,        setMaxStep]        = useState(0);
  const [formData,       setFormData]       = useState(INITIAL_FORM);
  const [errors,         setErrors]         = useState({});
  const [touched,        setTouched]        = useState({});
  const [options,        setOptions]        = useState({});
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError,   setOptionsError]   = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState(null);
  const [success,        setSuccess]        = useState(false);

  // Load registration options (categories, districts, business types)
  useEffect(() => {
    let alive = true;
    fetchOptions()
      .then((data) => { if (alive) setOptions(data); })
      .catch((err) => { if (alive) setOptionsError(err.message); })
      .finally(() => { if (alive) setOptionsLoading(false); });
    return () => { alive = false; };
  }, []);

  // onChange — one handler for all steps
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // onBlur — mark field as touched, run step validation
  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Validate current step; returns true if valid
  const validateStep = useCallback((targetStep = step) => {
    const validate = VALIDATORS[targetStep];
    if (!validate) return true;
    const { isValid, errors: errs } = validate(formData, options);
    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...errs }));
      // Mark all errored fields as touched so messages show
      const touchAll = {};
      Object.keys(errs).forEach((k) => { touchAll[k] = true; });
      setTouched((prev) => ({ ...prev, ...touchAll }));
    }
    return isValid;
  }, [step, formData, options]);

  // Next step
  const handleNext = () => {
    if (!validateStep(step)) return;
    const nextStep = step + 1;
    setStep(nextStep);
    setMaxStep((m) => Math.max(m, nextStep));
  };

  // Back
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Jump (from stepper click)
  const handleStepClick = (idx) => {
    if (idx <= maxStep) setStep(idx);
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitRegistration(formData);
      if (result.ok) {
        setSuccess(true);
        // Auto-close and refresh after 2 s
        setTimeout(() => onSuccess?.(), 2000);
      } else {
        // Try to jump to the step that contains the first server error
        const errMsg = result.error?.message || "Registration failed. Please try again.";
        const field  = result.error?.field;
        if (field) {
          const errStep = getStepForField(field);
          setStep(errStep);
          setErrors((prev) => ({ ...prev, [field]: result.error.message }));
          setTouched((prev) => ({ ...prev, [field]: true }));
        }
        setSubmitError(errMsg);
      }
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-8 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}>
          Vendor Registered!
        </h3>
        <p className="text-sm text-[#64748B] max-w-xs">
          The vendor account has been created and is pending approval. Refreshing the directory…
        </p>
      </div>
    );
  }

  // ── Options loading / error ───────────────────────────────────────────────
  const STEP_LABELS = ["Account", "Business", "Contact & Location", "Review & Submit"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC] shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Add New Vendor
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Step {step + 1} of 4 — {STEP_LABELS[step]}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[#94A3B8]
                     hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Stepper */}
      <div className="px-6 pt-5 pb-2 shrink-0">
        <RegistrationStepper
          currentStep={step}
          maxStepReached={maxStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {optionsLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[#8E406F]">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading registration options…</span>
          </div>
        ) : optionsError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
            <p className="font-semibold">Could not load options</p>
            <p className="text-xs mt-1">{optionsError}</p>
            <p className="text-xs mt-1 text-rose-500">
              Ensure the backend is running at http://localhost:5131
            </p>
          </div>
        ) : (
          <>
            {step === 0 && (
              <AccountStep
                formData={formData}
                errors={errors}
                touched={touched}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {step === 1 && (
              <BusinessStep
                formData={formData}
                errors={errors}
                touched={touched}
                options={options}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {step === 2 && (
              <ContactLocationStep
                formData={formData}
                errors={errors}
                touched={touched}
                options={options}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {step === 3 && (
              <ReviewStep
                formData={formData}
                errors={errors}
                touched={touched}
                options={options}
                onEditStep={(s) => setStep(s)}
                onChange={handleChange}
              />
            )}
          </>
        )}

        {/* Server-level error banner */}
        {submitError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {submitError}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#F1E5EC] flex justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={step === 0 ? onClose : handleBack}
          disabled={submitting}
          className="px-4 py-2 rounded-lg border border-[#E8DDE4] text-sm text-[#555]
                     hover:bg-[#FDF0F4] hover:border-[#8E406F] hover:text-[#8E406F]
                     transition-colors disabled:opacity-50">
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={optionsLoading}
            className="px-5 py-2 rounded-lg bg-[#8E406F] text-white text-sm font-medium
                       hover:bg-[#7a3560] transition-colors disabled:opacity-50 shadow-sm">
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8E406F] text-white
                       text-sm font-medium hover:bg-[#7a3560] transition-colors
                       disabled:opacity-50 shadow-sm">
            {submitting ? (
              <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            ) : (
              "Submit Registration"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
