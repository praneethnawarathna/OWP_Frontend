import { useState, useRef, useEffect } from 'react';

// ============================================================
// LoginPage.jsx — Oleena Wedding Planner
// Design System: Ethereal Union (from Stitch)
// Colors:
//   Primary (Deep Mauve):   #8E406F  — buttons, headings, active states
//   Soft Blush:             #FDF0F4  — left panel bg, PIN section bg
//   Pure White:             #FFFFFF  — form area background
//   Muted Gray:             #737373  — body text, borders
// Typography:
//   Headlines: Playfair Display (serif, editorial)
//   Body/UI:   Plus Jakarta Sans (sans-serif, clean)
// ============================================================

// ============================================================
// LEFT PANEL IMAGE — HOW TO ADD YOUR OWN PHOTO:
//
//   1. Drag & drop your image into the  public/images/  folder
//      (create it if it doesn't exist: t:\Test 2\test2\public\images\)
//   2. Right-click the image file → "Copy as path"
//   3. Replace null below with ONLY the filename part, like this:
//
//         const LEFT_PANEL_IMAGE = '/images/wedding.jpg';
//
//   4. Save the file — the image appears on the left panel instantly.
//
//   SUPPORTED: .jpg  .jpeg  .png  .webp  .gif  .svg
//   TIP: Keep images under 2 MB for fast load times.
//   To remove the image: set the value back to null.
// ============================================================
const LEFT_PANEL_IMAGE = 'images\\image1.jpg' // ← Paste your image path here

export default function LoginPage() {
  // --- State ---
  // isAdmin: controls whether the Admin toggle is ON
  const [isAdmin, setIsAdmin] = useState(false);

  // showPassword: controls eye-icon password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // pin: array of 4 digits for the secure admin PIN entry
  const [pin, setPin] = useState(['', '', '', '']);

  // pinError: shows when PIN validation fails
  const [pinError, setPinError] = useState(false);

  // formData: email and password fields
  const [formData, setFormData] = useState({ email: '', password: '' });

  // isLoading: button loading state during sign-in
  const [isLoading, setIsLoading] = useState(false);

  // pinRefs: refs for each PIN input cell for auto-focus management
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // -------------------------------------------------------
  // Handlers
  // -------------------------------------------------------

  // Toggle the Admin mode switch
  const handleAdminToggle = () => {
    setIsAdmin((prev) => !prev);
    // Reset PIN on toggle off
    if (isAdmin) {
      setPin(['', '', '', '']);
      setPinError(false);
    }
  };

  // Handle PIN digit input — auto-advance focus to next cell
  const handlePinChange = (index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setPinError(false);

    // Auto-focus next input if a digit was entered
    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  // Handle PIN backspace — move focus back to previous cell
  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  // Handle PIN paste — distribute pasted digits across cells
  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newPin = [...pin];
    pasted.split('').forEach((char, i) => {
      if (i < 4) newPin[i] = char;
    });
    setPin(newPin);
    // Focus last filled cell
    const lastIndex = Math.min(pasted.length, 3);
    pinRefs[lastIndex].current?.focus();
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Sign In form submission
  // NOTE: Replace the mock logic below with your real API call to OWP_Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: if admin mode, PIN must be fully filled
    if (isAdmin) {
      const fullPin = pin.join('');
      if (fullPin.length < 4) {
        setPinError(true);
        pinRefs[pin.findIndex((d) => d === '')].current?.focus();
        return;
      }
    }

    setIsLoading(true);

    // --- MOCK: Simulate API delay ---
    // TODO: Replace with actual fetch/axios call to your .NET 8 backend:
    // POST /api/auth/login  { email, password, isAdmin, pin? }
    // Expect JWT in response store in localStorage/context
    await new Promise((res) => setTimeout(res, 1500));

    setIsLoading(false);
    // TODO: on success navigate to dashboard via React Router
    alert(`Mock sign-in successful!\nEmail: ${formData.email}\nAdmin: ${isAdmin}`);
  };

  // Auto-focus first PIN cell when admin mode is activated
  useEffect(() => {
    if (isAdmin) {
      setTimeout(() => pinRefs[0].current?.focus(), 350);
    }
  }, [isAdmin]);

  return (
    // ============================================================
    // Root container — full viewport, mobile-first flex column
    // On md+ screens: flex-row (split-screen layout)
    // ============================================================
    <div className="min-h-screen flex flex-col md:flex-row font-sans">

      {/* ========================================================
          LEFT PANEL — Brand / Hero Section
          Background: Soft Blush (#FDF0F4)
          Visible on md+ screens; hidden on mobile (collapses to top bar)
          To change the left panel content: edit within this section
          ======================================================== */}
      {/* LEFT PANEL — 65% width on desktop */}
      <div
        className="relative flex flex-col items-center justify-center bg-[#FDF0F4] md:w-[65%] px-10 py-16 md:py-0 min-h-[220px] md:min-h-screen overflow-hidden"
        aria-label="Brand panel"
      >
        {/* ── Custom Background Image ────────────────────────────────
            Set LEFT_PANEL_IMAGE at the top of this file to show a photo.
            The image covers the panel; the mauve overlay keeps text readable.
            To adjust overlay darkness: change the opacity value (0–1) below.
            ──────────────────────────────────────────────────────── */}
        {LEFT_PANEL_IMAGE && (
          <>
            <img
              src={LEFT_PANEL_IMAGE}
              alt="Wedding background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              aria-hidden="true"
            />
            {/* Semi-transparent mauve overlay so text stays legible over the photo */}
            {/* To change overlay color/opacity: edit the background and opacity below */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(142,64,111,0.72) 0%, rgba(114,40,86,0.55) 100%)' }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Decorative background blobs — only shown when no image is set */}
        {/* To remove decorative elements: delete these two divs */}
        {!LEFT_PANEL_IMAGE && (
          <>
            <div
              className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8E406F 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8E406F 0%, transparent 70%)' }}
            />
          </>
        )}

        {/* Brand content — z-10 keeps it above the image/overlay */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo / Brand Name — Playfair Display for editorial elegance */}
          {/* To change brand name: edit the text inside the h1 */}
          <h1
            className={`font-serif text-8xl md:text-3xl lg:text-8xl font-bold leading-tight tracking-tight mb-6 ${LEFT_PANEL_IMAGE ? 'text-white' : 'text-[#8E406F]'
              }`}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Oleena Wedding Planner
          </h1>

          {/* Brand tagline */}
          {/* To change tagline: edit the paragraph text below */}
          <p
            className={`text-base md:text-lg lg:text-2xl leading-relaxed ${LEFT_PANEL_IMAGE ? 'text-white/80' : 'text-[#737373]'
              }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Curating elegant, seamless wedding experiences with precision and grace.
          </p>

          {/* Decorative divider line */}
          <div className={`mt-8 mx-auto w-16 h-[2px] opacity-40 rounded-full ${LEFT_PANEL_IMAGE ? 'bg-white' : 'bg-[#8E406F]'
            }`} />
        </div>
      </div>

      {/* ========================================================
          RIGHT PANEL — Login Form Section
          Background: Pure White (#FFFFFF)
          Contains: email, password, admin toggle, PIN entry, submit
          ======================================================== */}
      {/* RIGHT PANEL — 35% width on desktop */}
      <div
        className="md:w-[35%] flex flex-col items-center justify-center bg-white px-6 py-12 md:py-0 min-h-screen"
        role="main"
      >
        {/* Form Card — max width constrained for readability */}
        <div className="w-full max-w-md">

          {/* Welcome heading */}
          {/* To change the heading text: edit the h2 content below */}
          <h2
            className="text-5xl font-bold text-[#8E406F] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome Back
          </h2>
          <p
            className="text-[#737373] text-sm mb-8"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Please enter your details to sign in.
          </p>

          {/* =====================================================
              SIGN IN FORM
              ===================================================== */}
          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">

            {/* --- Email Field --- */}
            {/* To change the label text: edit the label content */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#2d2926] mb-1.5 tracking-wide uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Email Address
              </label>
              <div className="relative">
                {/* Email icon */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  aria-label="Email address"
                  aria-required="true"
                  className="w-full pl-10 pr-4 py-3 border border-[#d6c1c9] rounded text-sm text-[#2d2926] placeholder-[#b0a0a8] bg-white transition-all duration-200 focus:outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 hover:border-[#8E406F]/60"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            {/* --- Password Field --- */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#2d2926] mb-1.5 tracking-wide uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                {/* Lock icon */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  aria-label="Password"
                  aria-required="true"
                  className="w-full pl-10 pr-11 py-3 border border-[#d6c1c9] rounded text-sm text-[#2d2926] placeholder-[#b0a0a8] bg-white transition-all duration-200 focus:outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/20 hover:border-[#8E406F]/60"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#8E406F] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F]"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password link */}
            {/* To change the link destination: update the onClick handler */}
            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="text-xs text-[#8E406F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] rounded"
                aria-label="Forgot password"
                onClick={() => alert('Navigate to Forgot Password page')}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Forgot Password?
              </button>
            </div>

            {/* ===================================================
                ADMIN TOGGLE — Switches between Vendor and Admin mode
                When ON: the PIN section smoothly slides into view
                To change the toggle label: edit the span text below
                =================================================== */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-sm font-medium text-[#2d2926]"
                id="admin-toggle-label"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                I am an Administrator
              </span>

              {/* Custom toggle switch — fully keyboard accessible */}
              <button
                type="button"
                role="switch"
                aria-checked={isAdmin}
                aria-labelledby="admin-toggle-label"
                onClick={handleAdminToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2 ${isAdmin ? 'bg-[#8E406F]' : 'bg-[#d6c1c9]'}`}
              >
                <span className="sr-only">Toggle admin mode</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${isAdmin ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* ===================================================
                SECURE ADMIN PIN SECTION
                Animates smoothly into view when isAdmin is true.
                Uses CSS max-height transition for smooth open/close.
                Each PIN cell: auto-advances focus on digit entry.
                To change PIN length: adjust the pin array size and
                add/remove input cells (currently 4 digits).
                =================================================== */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isAdmin ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}
              aria-hidden={!isAdmin}
            >
              <div
                className="bg-[#FDF0F4] rounded-lg p-4 border border-[#d6c1c9]"
                role="group"
                aria-labelledby="pin-label"
              >
                {/* PIN section header */}
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-[#8E406F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span
                    id="pin-label"
                    className="text-xs font-semibold text-[#8E406F] tracking-wide uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Secure Admin PIN
                  </span>
                </div>

                {/* PIN input cells */}
                {/* To change PIN digit count: add/remove input elements and adjust pin state array */}
                <div className="flex gap-3 justify-center" role="group" aria-label="Enter 4-digit admin PIN">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={pinRefs[index]}
                      id={`pin-digit-${index + 1}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      onPaste={handlePinPaste}
                      aria-label={`PIN digit ${index + 1} of 4`}
                      aria-required={isAdmin}
                      className={`w-12 h-12 text-center text-lg font-bold rounded border-2 bg-white text-[#2d2926] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8E406F]/30 ${pinError ? 'border-red-400 bg-red-50' : digit ? 'border-[#8E406F]' : 'border-[#d6c1c9] focus:border-[#8E406F]'}`}
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                  ))}
                </div>

                {/* PIN validation error message */}
                {pinError && (
                  <p
                    className="text-red-500 text-xs text-center mt-2"
                    role="alert"
                    aria-live="polite"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Please enter your 4-digit admin PIN.
                  </p>
                )}
              </div>
            </div>

            {/* ===================================================
                SIGN IN BUTTON
                Primary action: Deep Mauve bg, white text
                Shows spinner during loading state
                To change button label: edit the span text below
                =================================================== */}
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Sign in to your account"
              className={`w-full py-3.5 px-6 rounded flex items-center justify-center gap-2 text-white font-semibold text-sm tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] focus-visible:ring-offset-2 ${isLoading ? 'bg-[#8E406F]/70 cursor-not-allowed' : 'bg-[#8E406F] hover:bg-[#722856] active:scale-[0.98] shadow-[0px_10px_30px_rgba(142,64,111,0.25)] hover:shadow-[0px_10px_30px_rgba(142,64,111,0.4)]'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* =====================================================
              FOOTER LINK — Vendor registration / inquiry
              NOTE: This app is Admin/Vendor only (no public signup)
              To change this text or link: edit the button below
              ===================================================== */}
          <p
            className="text-center text-sm text-[#737373] mt-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-[#8E406F] font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E406F] rounded"
              onClick={() => alert('Navigate to Vendor Inquiry / Onboarding page')}
              aria-label="Inquire about creating a vendor account"
            >
              Inquire Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
