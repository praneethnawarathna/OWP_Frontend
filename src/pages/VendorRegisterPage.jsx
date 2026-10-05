/**
 * VendorRegisterPage.jsx — Oleena Wedding Planner
 * Phase 5: Vendor Registration Wizard (Self-contained, pre-auth view)
 * Matches the Ethereal Union design system of LoginPage.jsx
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Heart } from 'lucide-react';
import RegistrationStepper from '../components/vendorRegistration/RegistrationStepper';
import AccountStep from '../components/vendorRegistration/AccountStep';
import BusinessStep from '../components/vendorRegistration/BusinessStep';
import ContactLocationStep from '../components/vendorRegistration/ContactLocationStep';
import ReviewStep from '../components/vendorRegistration/ReviewStep';
import {
  validateAccountStep,
  validateBusinessStep,
  validateContactLocationStep,
  validateReviewStep,
  getStepForField,
} from '../components/vendorRegistration/validation';
import { fetchOptions, submitRegistration } from '../components/vendorRegistration/registrationApi';
import { saveSession } from '../components/auth/saveSession';

const LEFT_PANEL_IMAGE = '/images/image1.jpg';

export default function VendorRegisterPage({
  onRegisterSuccess,
  onBackToLogin,
  googlePrefill = null,
}) {
  const isGoogleFlow = !!(googlePrefill && googlePrefill.idToken);

  // --- SessionStorage draft ---
  const DRAFT_KEY = 'oleena_vendor_registration_draft';
  const EXCLUDED_KEYS = ['password', 'confirmPassword', 'googleIdToken'];

  const loadDraft = () => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  // Evaluated once at module scope so useState gets the value synchronously
  const savedDraft = loadDraft();

  // --- Wizard Step State ---
  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep ?? 0);
  const [maxStepReached, setMaxStepReached] = useState(savedDraft?.maxStepReached ?? 0);
  const [draftRestoredBanner, setDraftRestoredBanner] = useState(!!savedDraft);

  // --- Options State (loaded from backend) ---
  const [options, setOptions] = useState({ categories: [], districts: [], businessTypes: [] });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  // --- Master Form State ---
  const [formData, setFormData] = useState(() => {
    const defaults = {
      // Step 1: Account
      fullName: googlePrefill?.fullName || '',
      email: googlePrefill?.email || '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      googleIdToken: googlePrefill?.idToken || null,

      // Step 2: Business
      businessName: '',
      businessType: '',
      category: '',
      tagline: '',
      description: '',
      yearsInBusiness: '',
      businessRegistrationNumber: '',

      // Step 3: Contact & Location
      businessEmail: googlePrefill?.email || '',
      contactNumber: '',
      altPhoneNumber: '',
      websiteUrl: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      serviceAreas: [],

      // Step 4: Terms
      acceptTerms: false,
    };
    // Merge saved draft (never overwrite excluded secrets)
    if (savedDraft?.formData) {
      return { ...defaults, ...savedDraft.formData };
    }
    return defaults;
  });

  // --- Form Validation & UI State ---
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- Load Registration Options on Mount ---
  const loadOptions = async () => {
    setIsLoadingOptions(true);
    setOptionsError(null);
    try {
      const data = await fetchOptions();
      setOptions({
        categories: data.categories || [],
        districts: data.districts || [],
        businessTypes: data.businessTypes || [],
      });
    } catch (err) {
      setOptionsError(err.message || 'Unable to load registration options.');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  // --- Persist draft to sessionStorage on every change ---
  useEffect(() => {
    try {
      const safeFormData = Object.fromEntries(
        Object.entries(formData).filter(([k]) => !EXCLUDED_KEYS.includes(k))
      );
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: safeFormData, currentStep, maxStepReached }));
    } catch {
      // sessionStorage may be unavailable (private mode quota)
    }
  }, [formData, currentStep, maxStepReached]);

  // Update form values if googlePrefill changes dynamically
  useEffect(() => {
    if (googlePrefill) {
      setFormData((prev) => ({
        ...prev,
        fullName: googlePrefill.fullName || prev.fullName,
        email: googlePrefill.email || prev.email,
        businessEmail: prev.businessEmail || googlePrefill.email,
        googleIdToken: googlePrefill.idToken || prev.googleIdToken,
      }));
    }
  }, [googlePrefill]);

  // --- Field Change Handler ---
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    // Clear global submit error banner once editing
    if (submitError) {
      setSubmitError(null);
    }
  };

  // --- Field Blur Handler ---
  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Run validation on the current step to show inline errors
    validateCurrentStep(false);
  };

  // --- Validate Current Step ---
  const validateCurrentStep = (markAllTouched = true) => {
    let result = { isValid: true, errors: {} };

    if (currentStep === 0) {
      result = validateAccountStep(formData, isGoogleFlow);
    } else if (currentStep === 1) {
      result = validateBusinessStep(formData, options);
    } else if (currentStep === 2) {
      result = validateContactLocationStep(formData, options);
    } else if (currentStep === 3) {
      result = validateReviewStep(formData);
    }

    if (markAllTouched) {
      const newlyTouched = {};
      Object.keys(result.errors).forEach((f) => {
        newlyTouched[f] = true;
      });
      setTouched((prev) => ({ ...prev, ...newlyTouched }));
    }

    setErrors((prev) => ({ ...prev, ...result.errors }));
    return result.isValid;
  };

  // --- Navigation Handlers ---
  const handleNext = () => {
    setSubmitError(null);
    const isValid = validateCurrentStep(true);

    if (isValid) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBackToLogin) {
      onBackToLogin();
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep <= maxStepReached) {
      setSubmitError(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Final Form Submission Handler ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    // Validate step 4 (Accept Terms)
    const isTermsValid = validateReviewStep(formData);
    if (!isTermsValid.isValid) {
      setTouched((prev) => ({ ...prev, acceptTerms: true }));
      setErrors((prev) => ({ ...prev, ...isTermsValid.errors }));
      return;
    }

    // Build backend payload
    const payload = {
      fullName: (formData.fullName || '').trim(),
      email: (formData.email || '').trim().toLowerCase(),
      phoneNumber: (formData.phoneNumber || '').trim(),
      password: isGoogleFlow ? null : formData.password,
      googleIdToken: formData.googleIdToken || null,

      businessName: (formData.businessName || '').trim(),
      businessType: (formData.businessType || '').trim(),
      category: (formData.category || '').trim(),
      tagline: (formData.tagline || '').trim() || null,
      description: (formData.description || '').trim(),
      yearsInBusiness:
        formData.yearsInBusiness !== '' && formData.yearsInBusiness !== null && formData.yearsInBusiness !== undefined
          ? Number(formData.yearsInBusiness)
          : null,
      businessRegistrationNumber: (formData.businessRegistrationNumber || '').trim() || null,

      businessEmail: (formData.businessEmail || '').trim().toLowerCase(),
      contactNumber: (formData.contactNumber || '').trim(),
      altPhoneNumber: (formData.altPhoneNumber || '').trim() || null,
      websiteUrl: (formData.websiteUrl || '').trim() || null,
      address: (formData.address || '').trim(),
      city: (formData.city || '').trim(),
      district: (formData.district || '').trim(),
      postalCode: (formData.postalCode || '').trim() || null,
      serviceAreas: Array.isArray(formData.serviceAreas) ? formData.serviceAreas : [],

      acceptTerms: !!formData.acceptTerms,
    };

    setIsSubmitting(true);

    try {
      const result = await submitRegistration(payload);

      if (result.ok && result.status === 201) {
        // Success: clear draft, store session, and notify parent
        sessionStorage.removeItem(DRAFT_KEY);
        saveSession(result.data);
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
        return;
      }

      // Handle Conflict: 409 (Email already registered)
      if (result.status === 409) {
        const errorMsg = result.error?.message || 'This email is already registered. Please log in or use a different email.';
        setErrors((prev) => ({ ...prev, email: errorMsg }));
        setTouched((prev) => ({ ...prev, email: true }));
        setSubmitError(errorMsg);
        setCurrentStep(0); // Jump directly to Account Step
        return;
      }

      // Handle 400: ValidationProblemDetails
      if (result.status === 400 && result.error?.errors) {
        const backendErrors = result.error.errors;
        const mappedErrors = {};
        const touchedFields = {};
        let firstErrorStep = null;

        Object.entries(backendErrors).forEach(([key, messages]) => {
          // Normalize camelCase field key
          const cleanKey = key.charAt(0).toLowerCase() + key.slice(1);
          mappedErrors[cleanKey] = Array.isArray(messages) ? messages[0] : String(messages);
          touchedFields[cleanKey] = true;

          if (firstErrorStep === null) {
            firstErrorStep = getStepForField(cleanKey);
          }
        });

        setErrors((prev) => ({ ...prev, ...mappedErrors }));
        setTouched((prev) => ({ ...prev, ...touchedFields }));
        setSubmitError('Please review and correct the highlighted fields.');

        if (firstErrorStep !== null) {
          setCurrentStep(firstErrorStep);
        }
        return;
      }

      // Handle 401: Invalid / Expired Google Token
      if (result.status === 401) {
        setSubmitError('Your Google authentication session has expired. Please return to the login screen and sign in again.');
        setCurrentStep(0);
        return;
      }

      // Handle 503 or other server/network issues
      setSubmitError(
        result.error?.message ||
          'Registration is temporarily unavailable. Please verify your connection or try again shortly.'
      );
    } catch {
      setSubmitError('An unexpected error occurred while processing registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* ========================================================
          LEFT PANEL — Brand & Inspiration Hero
          ======================================================== */}
      <div className="w-full md:w-[40%] lg:w-[35%] bg-[#FDF0F4] flex flex-col justify-between p-6 sm:p-10 border-b md:border-b-0 md:border-r border-[#E8DDE4] relative overflow-hidden">
        {/* Background Decorative Pattern / Image */}
        {LEFT_PANEL_IMAGE && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
            style={{ backgroundImage: `url(${LEFT_PANEL_IMAGE})` }}
            aria-hidden="true"
          />
        )}

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E406F] hover:text-[#75325a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] rounded mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8E406F] flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span
                className="font-display text-xl font-bold tracking-tight text-[#8E406F]"
              >
                OLEENA
              </span>
              <p className="text-[10px] text-[#737373] tracking-widest uppercase font-medium">
                Wedding Planner Portal
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Value Proposition Editorial */}
        <div className="relative z-10 my-8 hidden md:block">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 text-[#8E406F] border border-[#8E406F]/20 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Sri Lanka&apos;s Premier Wedding Network</span>
          </span>

          <h2
            className="font-display text-2xl lg:text-3xl font-bold text-[#2D2926] leading-snug"
          >
            Showcase your artistry to couples creating their dream wedding.
          </h2>

          <p
            className="font-sans text-xs text-[#737373] mt-3 leading-relaxed"
          >
            Create your verified vendor portfolio, receive curated booking inquiries, and manage all your wedding services in one elegant workspace.
          </p>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#334155]">
              <CheckCircle2 className="w-4 h-4 text-[#8E406F]" />
              <span>Verified business badge on public directory</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#334155]">
              <CheckCircle2 className="w-4 h-4 text-[#8E406F]" />
              <span>Direct inquiries from registered couples</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#334155]">
              <CheckCircle2 className="w-4 h-4 text-[#8E406F]" />
              <span>Real-time analytics and rating management</span>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="relative z-10 text-[11px] text-[#94A3B8] border-t border-[#E8DDE4] pt-4">
          <p>© {new Date().getFullYear()} Oleena Wedding Planner. All rights reserved.</p>
        </div>
      </div>

      {/* ========================================================
          RIGHT PANEL — Multi-Step Registration Form
          ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Step Header & Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1
                className="font-display text-2xl font-bold text-[#2D2926]"
              >
                Vendor Registration
              </h1>
              <p
                className="font-sans text-xs text-[#737373] mt-1"
              >
                Complete your details below to submit your vendor application.
              </p>
            </div>

            {/* Step Counter Pill */}
            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF0F4] text-[#8E406F] border border-[#8E406F]/20">
              Step {currentStep + 1} of 4
            </span>
          </div>

          {/* Stepper Component */}
          <RegistrationStepper
            currentStep={currentStep}
            maxStepReached={maxStepReached}
            onStepClick={handleStepClick}
            className="pt-2"
          />
        </div>

        {/* Form Body Area */}
        <div className="flex-1">
          {/* Options Loading State */}
          {isLoadingOptions ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin mb-3" />
              <p className="text-xs text-[#64748B]">
                Connecting to server and loading registration options...
              </p>
            </div>
          ) : optionsError ? (
            /* Options Loading Error State */
            <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-center my-8">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-rose-800 mb-1">
                Unable to Load Registration Setup
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto mb-4 leading-relaxed">
                {optionsError}
              </p>
              <button
                type="button"
                onClick={loadOptions}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8E406F] text-white text-xs font-semibold hover:bg-[#75325a] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            /* Active Step Form */
            <form onSubmit={handleSubmit} noValidate>
              {/* Draft Restored Banner */}
              {draftRestoredBanner && (
                <div
                  role="status"
                  className="mb-4 p-3 rounded-lg border border-[#8E406F]/25 bg-[#FDF0F4] text-[#8E406F] text-xs flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="flex-1">We restored your in-progress application.</span>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setDraftRestoredBanner(false)}
                    className="text-[#8E406F]/60 hover:text-[#8E406F] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Global Error Banner */}
              {submitError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg border border-rose-200 bg-rose-50/90 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-800">Registration Error</p>
                    <p className="mt-0.5">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Step 0: Account */}
              {currentStep === 0 && (
                <AccountStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  isGoogleFlow={isGoogleFlow}
                  googlePrefill={googlePrefill}
                />
              )}

              {/* Step 1: Business Profile */}
              {currentStep === 1 && (
                <BusinessStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  options={options}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              )}

              {/* Step 2: Contact & Location */}
              {currentStep === 2 && (
                <ContactLocationStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  options={options}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              )}

              {/* Step 3: Review & Terms */}
              {currentStep === 3 && (
                <ReviewStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  options={options}
                  isGoogleFlow={isGoogleFlow}
                  onEditStep={handleStepClick}
                  onChange={handleFieldChange}
                />
              )}

              {/* Bottom Wizard Actions */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#E8DDE4]">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg border border-[#D6C1C9] text-[#1E293B] text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentStep === 0 ? 'Back to Login' : 'Back'}</span>
                </button>

                {/* Next / Submit Button */}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-lg bg-[#8E406F] hover:bg-[#75325a] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2 active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-7 py-2.5 rounded-lg bg-[#8E406F] hover:bg-[#75325a] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2 active:scale-[0.98] ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Existing Account Footer Link */}
        <div className="text-center text-xs text-[#737373] mt-8 pt-4 border-t border-[#F1E9EE]">
          Already have a verified vendor account?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[#8E406F] font-semibold hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8E406F] rounded"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
