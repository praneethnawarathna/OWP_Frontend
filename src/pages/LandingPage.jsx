import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const API = 'http://localhost:5131';

// 5 Category Slides for Hero Carousel (Hotels, Photography, Music, Decor, Catering)
const HERO_SLIDES = [
  {
    category: 'Hotels & Venues',
    subtitle: 'Grand ballrooms, boutique heritage estates, and scenic gardens',
    image: '/images/hero/venue.jpg',
  },
  {
    category: 'Wedding Photography',
    subtitle: 'Candid elegance and timeless portraits capturing every emotion',
    image: '/images/hero/photography.jpg',
  },
  {
    category: 'Live Music & DJs',
    subtitle: 'Acoustic melodies, high-energy live bands, and modern sound',
    image: '/images/hero/music.jpg',
  },
  {
    category: 'Luxury Floral & Decor',
    subtitle: 'Bespoke floral arches, ambient lighting, and bespoke stages',
    image: '/images/hero/decor.jpg',
  },
  {
    category: 'Gourmet Catering',
    subtitle: 'Delectable Sri Lankan feasts and international culinary delights',
    image: '/images/hero/catering.jpg',
  },
];

// Category static config with SVG icons for crisp retina display
const CATEGORY_CONFIG = [
  {
    key: 'Hotel / Venue',
    slug: 'venues',
    label: 'Hotels & Venues',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Grand ballrooms, heritage estates, and boutique garden settings for your special day.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: 'Photography',
    slug: 'photography',
    label: 'Photography',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Talented photographers to capture every precious moment of your wedding.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'Music',
    slug: 'music',
    label: 'Music & DJs',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Live bands, acoustic ensembles, and DJs to keep your celebration alive.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    key: 'Decorations',
    slug: 'decorations',
    label: 'Decorations',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Floral artists and decoration designers to bring your dream setting to life.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    key: 'Catering',
    slug: 'catering',
    label: 'Catering',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: 'Expert caterers serving traditional Sri Lankan and international cuisines.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

const STEPS = [
  { num: '01', title: 'Browse Vendors', desc: 'Search our directory to find the perfect match for your style and budget.', active: false },
  { num: '02', title: 'View Real Packages', desc: 'Explore transparent pricing, portfolios, and genuine client reviews.', active: false },
  { num: '03', title: 'Inquire Directly', desc: 'Send messages and book your favourite vendors directly through the platform with no middlemen.', active: true },
  { num: '04', title: 'Celebrate with Joy', desc: 'Enjoy your big day knowing your vendor team is verified, trusted, and ready for you.', active: false },
];

const TESTIMONIALS = [
  { name: 'Ayesha & Dilshan', venue: 'Cinnamon Grand Ballroom', date: 'March 2025', rating: 5, quote: 'Finding our venue and photographer through Oleena was so easy. Everything was verified and exactly as described.', initial: 'A' },
  { name: 'Priya & Kavindra', venue: 'Waters Edge, Colombo', date: 'January 2025', rating: 5, quote: 'We booked our decorator and caterer in one afternoon. The vendors were professional and the quality was amazing.', initial: 'P' },
  { name: 'Sanduni & Ruwantha', venue: 'Heritance Kandalama', date: 'November 2024', rating: 5, quote: 'Oleena made planning our wedding stress-free. Every vendor delivered beautifully on the day.', initial: 'S' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function getToken() { return localStorage.getItem('token'); }

function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || Date.now() / 1000 < payload.exp;
  } catch { return false; }
}

function getUserRole() {
  try {
    const user = getStoredUser() || {};
    const role = String(user?.role || user?.Role || '').toUpperCase();
    if (role.includes('VENDOR')) return 'vendor';
    const token = getToken();
    if (token) {
      const p = JSON.parse(atob(token.split('.')[1]));
      const tr = String(p.role || p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '').toUpperCase();
      if (tr.includes('VENDOR')) return 'vendor';
    }
    return 'admin';
  } catch { return 'admin'; }
}

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Stars({ count = 5 }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SparkleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// Category-badge colour map by ID (1-5)
const BADGE_BY_ID = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-purple-50 text-purple-700 border-purple-200',
  3: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
  5: 'bg-rose-50 text-rose-700 border-rose-200',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  // Auth state
  const [authed, setAuthed] = useState(() => isTokenValid());
  const storedUser = authed ? (getStoredUser() || {}) : {};
  const userDisplayName = storedUser?.fullName || storedUser?.email || '';

  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Hero carousel auto-slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Live DB data
  const [metrics, setMetrics] = useState({
    venues: 0,
    photography: 0,
    music: 0,
    decorations: 0,
    catering: 0,
  });
  const [featured, setFeatured] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Auto-slide carousel every 5000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Fetch live data on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [mRes, fRes] = await Promise.all([
          fetch(`${API}/api/public/landing/metrics`),
          fetch(`${API}/api/public/landing/featured-listings`),
        ]);
        if (!cancelled) {
          if (mRes.ok) {
            const data = await mRes.json();
            if (Array.isArray(data)) {
              const mapped = { venues: 0, photography: 0, music: 0, decorations: 0, catering: 0 };
              data.forEach((item) => {
                const name = (item.categoryName || '').toLowerCase();
                const count = item.count ?? 0;
                if (name.includes('venue') || name.includes('hotel')) mapped.venues = count;
                else if (name.includes('photo')) mapped.photography = count;
                else if (name.includes('music')) mapped.music = count;
                else if (name.includes('decor')) mapped.decorations = count;
                else if (name.includes('cater')) mapped.catering = count;
              });
              setMetrics(mapped);
            } else if (typeof data === 'object' && data !== null) {
              setMetrics({
                venues: data.venues ?? data.Venues ?? 0,
                photography: data.photography ?? data.Photography ?? 0,
                music: data.music ?? data.Music ?? 0,
                decorations: data.decorations ?? data.Decorations ?? 0,
                catering: data.catering ?? data.Catering ?? 0,
              });
            }
          }
          if (fRes.ok) setFeatured(await fRes.json());
        }
      } catch { /* network unavailable – gracefully show static data */ }
      finally { if (!cancelled) setLoadingData(false); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Smart CTA routing
  const goToDashboard = () => navigate(getUserRole() === 'vendor' ? '/vendor-dashboard' : '/dashboard');
  const goToLogin = () => navigate('/login');
  const handleCta = () => (authed ? goToDashboard() : goToLogin());
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 5000); }
  };

  // Category list
  const mergedCategories = CATEGORY_CONFIG.map((cfg) => ({ ...cfg }));

  const navBg = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm'
    : 'bg-[#FAF7F6]/80 backdrop-blur-sm border-b border-transparent';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen bg-[#FAF7F6] text-[#1C0F13]"
      style={{ fontFamily: "'Inter','Plus Jakarta Sans',system-ui,sans-serif" }}
    >

      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Brand Logo Link to / */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 select-none focus:outline-none group"
            aria-label="Oleena Wedding Planner Home"
          >
            <img
              src="/Pink Blue and Yellow Retro Surf Club Logo.jpg"
              alt="Oleena Wedding Planner Logo"
              className="h-12 w-auto object-contain rounded-full shadow-sm hover:scale-105 transition-transform duration-200"
            />
            <div className="leading-none text-left hidden sm:flex flex-col justify-center">
              <span
                className="block text-[22px] font-black tracking-tight text-[#1C0F13] group-hover:text-[#701A40] transition-colors duration-200"
                style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
              >
                Oleena
              </span>
              <span
                className="block text-[8.5px] uppercase tracking-[0.24em] font-extrabold text-[#8E406F] mt-0.5"
                style={{ fontFamily: "'Inter',system-ui,sans-serif" }}
              >
                Wedding Planner
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[['Vendors', '#vendors'], ['How It Works', '#how-it-works'], ['Reviews', '#reviews'], ['About', '#about']].map(([l, h]) => (
              <a key={l} href={h} className="text-sm font-bold text-[#4A3040] hover:text-[#701A40] transition-colors duration-200">{l}</a>
            ))}
          </nav>

          {/* Auth-aware right section */}
          <div className="flex items-center gap-3">
            {authed ? (
              <>
                <span className="hidden sm:block text-sm text-[#4A3040] font-bold truncate max-w-[140px]">{userDisplayName}</span>
                <button id="nav-dashboard-btn" onClick={goToDashboard} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" style={{ background: 'linear-gradient(135deg,#701A40,#5B1435)' }}>
                  Dashboard <ArrowRight />
                </button>
              </>
            ) : (
              <>
                <button id="nav-signin-btn" onClick={goToLogin} className="hidden sm:block text-sm font-bold text-[#701A40] hover:text-[#5B1435] transition-colors px-2 py-1">
                  Sign In
                </button>
                <button id="nav-get-started-btn" onClick={goToLogin} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" style={{ background: 'linear-gradient(135deg,#701A40,#5B1435)' }}>
                  Get Started <ArrowRight />
                </button>
              </>
            )}
            {/* Mobile hamburger */}
            <button className="md:hidden p-1.5 rounded-md text-[#4A3040] hover:bg-rose-50 transition-colors" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-stone-100 px-5 py-4 flex flex-col gap-3 overflow-hidden shadow-lg">
              {[['Vendors', '#vendors'], ['How It Works', '#how-it-works'], ['Reviews', '#reviews'], ['About', '#about']].map(([l, h]) => (
                <a key={l} href={h} onClick={() => setMobileOpen(false)} className="text-sm font-bold text-[#4A3040] hover:text-[#701A40] py-1.5 transition-colors">{l}</a>
              ))}
              {authed ? (
                <button onClick={() => { setMobileOpen(false); goToDashboard(); }} className="mt-1 w-full py-2.5 rounded-lg text-sm font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg,#701A40,#5B1435)' }}>Go to Dashboard</button>
              ) : (
                <button onClick={() => { setMobileOpen(false); goToLogin(); }} className="mt-1 w-full py-2.5 rounded-lg text-sm font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg,#701A40,#5B1435)' }}>Sign In</button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-20 px-5 sm:px-8">
        {/* BG blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(112,26,64,0.07) 0%,transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(91,20,53,0.05) 0%,transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-200 bg-white text-xs font-bold text-[#8E406F] mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#701A40] animate-pulse" />
                Sri Lanka&apos;s Trusted Wedding Directory
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }} className="text-5xl sm:text-6xl lg:text-[62px] font-extrabold leading-[1.1] tracking-tight text-[#1C0F13] mb-6" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                Plan Your Dream<br />
                <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,#701A40,#8E406F)' }}>
                  Wedding with Ease
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32 }} className="text-base sm:text-lg text-[#5A3A45] max-w-lg leading-relaxed mb-8 font-medium">
                Discover trusted venues, talented photographers, live music, decorators, and caterers all carefully verified for your special day.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.42 }} className="flex flex-col sm:flex-row gap-3.5">
                <button id="hero-cta-btn" onClick={handleCta} className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" style={{ background: 'linear-gradient(135deg,#701A40,#5B1435)' }}>
                  {authed ? 'Go to Dashboard' : 'Get Started'} <ArrowRight />
                </button>
                <a href="#how-it-works" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-[#701A40] border-2 border-[#701A40]/30 bg-white hover:border-[#701A40] hover:bg-rose-50/50 transition-all duration-200">
                  How It Works
                </a>
              </motion.div>

              {/* Trust chips with clean SVG icons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-wrap gap-3 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 shadow-sm text-xs font-bold text-[#4A3040]">
                  <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.9 / 5.0 Rating</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 shadow-sm text-xs font-bold text-[#4A3040]">
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Verified Vendors</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 shadow-sm text-xs font-bold text-[#4A3040]">
                  <SparkleIcon className="w-4 h-4 text-[#701A40]" />
                  <span>1,400+ Weddings</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Hero Auto-Slider (Carousel) with Floating Badges */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative hidden lg:block">
              {/* The Slider Container */}
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-stone-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={HERO_SLIDES[currentImageIndex].image}
                      alt={HERO_SLIDES[currentImageIndex].category}
                      className="w-full h-full object-cover"
                    />
                    {/* Cinematic dark gradient overlay for text readability & mood */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C0F13]/90 via-[#1C0F13]/30 to-black/10" />

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-8 left-8 right-8 text-white select-none">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white mb-2.5 border border-white/30 shadow-sm">
                        {HERO_SLIDES[currentImageIndex].category}
                      </span>
                      <p className="text-xl font-bold text-white leading-snug drop-shadow-md" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                        {HERO_SLIDES[currentImageIndex].subtitle}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slider Indicators (Dots) */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Crucial: Floating glassmorphic badges OVER slider with z-20 (static, no fade) */}
              <div className="absolute -left-6 top-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-stone-200/90 z-20">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#1C0F13]">4.9 / 5.0</p>
                  <p className="text-[10px] font-bold text-[#737373]">Average Rating</p>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section id="vendors" className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#8E406F] mb-3">Wedding Categories</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1C0F13] mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Everything for Your Big Day</h2>
            <p className="text-[#5A3A45] max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-medium">Browse all five categories and find vendors who match your style, location, and budget.</p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {mergedCategories.map((cat, i) => (
              <FadeUp key={cat.label} delay={i * 0.07}>
                <div className="relative w-full text-left bg-white rounded-2xl border border-stone-200/90 p-6 shadow-sm flex flex-col h-full">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide mb-4 ${cat.badge}`}>
                    {cat.icon}
                    <span>{cat.label}</span>
                  </span>
                  <p className="text-xs text-[#5A3A45] leading-relaxed font-medium flex-1 mb-5">{cat.desc}</p>

                  {/* Dynamic Database Count Labels (static display) */}
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center min-h-[2.5rem]">
                    {cat.slug === 'venues' && (
                      metrics.venues > 0 ? (
                        <span className="font-bold text-[#701A40]">{metrics.venues} Venues Available</span>
                      ) : (
                        <span className="font-bold text-stone-400">Coming Soon</span>
                      )
                    )}
                    {cat.slug === 'photography' && (
                      metrics.photography > 0 ? (
                        <span className="font-bold text-[#701A40]">{metrics.photography} Studios Available</span>
                      ) : (
                        <span className="font-bold text-stone-400">Coming Soon</span>
                      )
                    )}
                    {cat.slug === 'music' && (
                      metrics.music > 0 ? (
                        <span className="font-bold text-[#701A40]">{metrics.music} Artists Available</span>
                      ) : (
                        <span className="font-bold text-stone-400">Coming Soon</span>
                      )
                    )}
                    {cat.slug === 'decorations' && (
                      metrics.decorations > 0 ? (
                        <span className="font-bold text-[#701A40]">{metrics.decorations} Designers Available</span>
                      ) : (
                        <span className="font-bold text-stone-400">Coming Soon</span>
                      )
                    )}
                    {cat.slug === 'catering' && (
                      metrics.catering > 0 ? (
                        <span className="font-bold text-[#701A40]">{metrics.catering} Caterers Available</span>
                      ) : (
                        <span className="font-bold text-stone-400">Coming Soon</span>
                      )
                    )}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-5 sm:px-8 bg-[#FAF7F6]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#8E406F] mb-3">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1C0F13] mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>How Oleena Works</h2>
            <p className="text-[#5A3A45] max-w-xl mx-auto text-base sm:text-lg font-medium">From browsing to booking &mdash; we keep things simple, transparent, and stress-free.</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div className={`relative rounded-2xl border p-7 h-full transition-all duration-300 ${step.active ? 'border-[#701A40]/40 bg-white shadow-lg ring-1 ring-[#701A40]/20' : 'border-stone-200/90 bg-white hover:border-[#701A40]/30 hover:shadow-md'}`}>
                  {step.active && <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#701A40] text-white shadow-sm">Key Step</span>}
                  <div className={`text-5xl font-black mb-4 leading-none ${step.active ? 'text-[#701A40]' : 'text-stone-300'}`} style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{step.num}</div>
                  <h3 className="font-bold text-xl mb-2 text-[#1C0F13]" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{step.title}</h3>
                  <p className="text-sm text-[#5A3A45] leading-relaxed font-medium">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section id="reviews" className="py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#8E406F] mb-3">Happy Couples</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1C0F13] mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Real Stories, Real Weddings</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-[#FAF7F6] rounded-2xl border border-rose-100 p-7 shadow-sm h-full flex flex-col">
                  <Stars count={t.rating} />
                  <blockquote className="text-base text-[#3A2030] leading-relaxed italic mt-4 mb-6 flex-1 font-medium" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-rose-100/70">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ background: 'linear-gradient(135deg,#701A40,#8E406F)' }}>{t.initial}</div>
                    <div>
                      <p className="text-sm font-bold text-[#1C0F13]">{t.name}</p>
                      <p className="text-xs font-semibold text-[#8E406F]">{t.venue} &middot; {t.date}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>



      {/* ── ABOUT OLEENA ─────────────────────────────────────────── */}
      <section id="about" className="py-20 px-5 sm:px-8 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Editorial Story */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#8E406F] mb-3">About Oleena</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1C0F13] mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Curating Sri Lanka&apos;s Finest Wedding Celebrations
                </h2>
                <p className="text-base sm:text-lg text-[#5A3A45] leading-relaxed mb-5 font-medium">
                  Oleena Wedding Planner was created with a singular mission: to make planning your dream wedding in Sri Lanka effortless, inspiring, and transparent.
                </p>
                <p className="text-sm sm:text-base text-[#5A3A45] leading-relaxed mb-8 font-medium">
                  We bring together the island&apos;s most sought-after banquet venues, visionary floral artists, passionate photographers, dynamic live entertainers, and master caterers all carefully vetted so you can celebrate with absolute peace of mind.
                </p>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-100">
                  <div>
                    <p className="text-3xl font-black text-[#701A40]" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>100%</p>
                    <p className="text-xs font-bold text-[#4A3040] mt-1">Verified Vendors</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#701A40]" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>5</p>
                    <p className="text-xs font-bold text-[#4A3040] mt-1">Core Categories</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#701A40]" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>1,400+</p>
                    <p className="text-xs font-bold text-[#4A3040] mt-1">Happy Couples</p>
                  </div>
                </div>
              </div>

              {/* Right: Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF7F6] p-6 rounded-2xl border border-stone-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                    <SparkleIcon className="w-5 h-5 text-[#701A40]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1C0F13] mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Curated Excellence</h3>
                  <p className="text-xs text-[#5A3A45] leading-relaxed font-medium">Every professional on Oleena is vetted for reputation, consistency, and exceptional quality.</p>
                </div>

                <div className="bg-[#FAF7F6] p-6 rounded-2xl border border-stone-200/80 shadow-sm sm:translate-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <CheckIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1C0F13] mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Zero Middlemen</h3>
                  <p className="text-xs text-[#5A3A45] leading-relaxed font-medium">Connect and inquire directly with vendors for transparent packages and honest pricing.</p>
                </div>

                <div className="bg-[#FAF7F6] p-6 rounded-2xl border border-stone-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                    <StarIcon className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1C0F13] mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Authentic Reviews</h3>
                  <p className="text-xs text-[#5A3A45] leading-relaxed font-medium">Read genuine stories and testimonials from real couples who planned their big day with Oleena.</p>
                </div>

                <div className="bg-[#FAF7F6] p-6 rounded-2xl border border-stone-200/80 shadow-sm sm:translate-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1C0F13] mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>Islandwide Reach</h3>
                  <p className="text-xs text-[#5A3A45] leading-relaxed font-medium">From grand Colombo venues to coastal resorts and scenic hill-country estates.</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-[#1C0F13] text-white/75 py-14 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3 mb-5 inline-flex select-none group"
                aria-label="Oleena Wedding Planner"
              >
                <img
                  src="/Pink Blue and Yellow Retro Surf Club Logo.jpg"
                  alt="Oleena Wedding Planner Logo"
                  className="h-12 w-auto object-contain rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                />
                <div className="leading-none text-left flex flex-col justify-center">
                  <span
                    className="block text-[21px] font-black text-white tracking-tight leading-none"
                    style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
                  >
                    Oleena
                  </span>
                  <span
                    className="block text-[8.5px] uppercase tracking-[0.26em] font-black text-rose-200/90 mt-1 leading-none"
                    style={{ fontFamily: "'Inter',system-ui,sans-serif" }}
                  >
                    Wedding Planner
                  </span>
                </div>
              </Link>
              <p className="text-xs leading-relaxed mb-5 font-medium">Sri Lanka&apos;s trusted wedding vendor directory. Connecting couples with verified professionals since 2023.</p>
              <div className="flex gap-3">
                {[['F', 'Facebook'], ['I', 'Instagram'], ['T', 'Twitter']].map(([l, label]) => (
                  <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#701A40] flex items-center justify-center text-xs font-bold text-white transition-colors duration-200">{l}</a>
                ))}
              </div>
            </div>
            {[
              { heading: 'Categories', links: ['Hotels & Venues', 'Photography', 'Music & DJs', 'Decorations', 'Catering'] },
              { heading: 'Platform', links: ['Sign In', 'Vendor Portal', 'Admin Dashboard', 'Listing Review'] },
              { heading: 'Company', links: ['About Oleena', 'Terms of Service', 'Privacy Policy', 'Contact Us'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">{heading}</h4>
                <ul className="space-y-2.5">{links.map(link => (<li key={link}><a href="#" className="text-xs font-semibold text-white/70 hover:text-white transition-colors duration-150">{link}</a></li>))}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-white/60">
            <p>&copy; 2026 Oleena Wedding Planner. All rights reserved.</p>
            <p>Made with love for Sri Lanka&apos;s most beautiful celebrations.</p>
          </div>
        </div>
      </footer>

    </motion.div>
  );
}
