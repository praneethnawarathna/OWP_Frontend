// ============================================================
// OWP – Vendor Portal
// Mock data: Vendor Listings (vendorListingsData.js)
// Used by VendorListingsPage for local-state CRUD until API is wired.
// ============================================================
// ....

/**
 * Category options — kept in sync with the existing VendorContentPage
 * category list so data shapes remain consistent for the future backend.
 */
export const LISTING_CATEGORIES = [
  'Hotel / Venue',
  'Photography',
  'Decorations',
  'Catering',
  'Music',
];

/**
 * Status options for a listing.
 * Even though "status" is not yet a backend concept, we persist it in mock
 * data now so the field is ready for backend alignment.
 */
export const LISTING_STATUSES = ['Active', 'Draft'];

/**
 * Seed data — 7 entries across 5 categories.
 * Fields:
 *   id          – string, unique within this vendor's listings
 *   title       – string
 *   category    – one of LISTING_CATEGORIES
 *   price       – number | null  (null → "Price on request")
 *   description – string
 *   status      – 'Active' | 'Draft'
 *   views       – number  [TODO: placeholder — not real until API provides it]
 *   inquiries   – number  [TODO: placeholder — not real until API provides it]
 *   createdAt   – ISO date string
 */
export const initialListings = [
  {
    id: 'lst-001',
    title: 'Premium Full-Day Wedding Photography',
    category: 'Photography',
    price: 85000,
    description:
      'Complete wedding-day coverage from bridal preparation through reception exit. Delivered as 600+ edited high-resolution images in an online gallery within 4 weeks.',
    fullDescription:
      'Capture every emotional nuance of your wedding day with our award-winning photography service. We provide full uninterrupted coverage starting from early morning bridal and groom preparation through to your grand departure at the reception. Our package includes two principal photographers, aerial drone portraits where permitted, and delivery of over 600 fully retouched, high-resolution photographs in a private digital gallery with full print rights.',
    status: 'Active',
    views: 142,
    inquiries: 11,
    createdAt: '2025-11-10',
  },
  {
    id: 'lst-002',
    title: 'Engagement Session – Outdoor',
    category: 'Photography',
    price: 22000,
    description:
      '2-hour outdoor couple shoot at a location of your choice. Includes 80+ edited images and a free print package.',
    fullDescription:
      'Celebrate your engagement with a relaxed, romantic 2-hour outdoor photo session. Pick any picturesque location across Sri Lanka — botanical gardens, tea estates, or golden beaches. We provide personalized posing guidance, outfit consultation, 80+ expertly retouched images, and a complementary A3 signature print for your wedding entrance display.',
    status: 'Active',
    views: 98,
    inquiries: 7,
    createdAt: '2025-11-18',
  },
  {
    id: 'lst-003',
    title: 'Luxury Floral Table Centrepiece Package',
    category: 'Decorations',
    price: 35000,
    description:
      'Customisable floral centrepieces for up to 20 tables. Flowers sourced fresh on the event morning. Includes setup and teardown by our team.',
    fullDescription:
      'Elevate your guest tables with bespoke floral artistry designed to match your wedding color palette. Each centerpiece is handcrafted using premium fresh-cut blooms sourced directly from hill-country growers on event morning. The package includes styling for up to 20 banquet tables, premium glass compotes or gold candelabras, tea-light votives, full on-site setup, and next-day teardown.',
    status: 'Active',
    views: 73,
    inquiries: 5,
    createdAt: '2025-12-02',
  },
  {
    id: 'lst-004',
    title: 'Balloon & Ribbon Archway',
    category: 'Decorations',
    price: 12500,
    description:
      'Elegant balloon archway in your chosen colour palette — perfect for ceremony entrances or photobooth backdrops. Assembly included.',
    fullDescription:
      'An organic balloon and satin ribbon archway customized to your event theme. Built with 100% biodegradable latex balloons in matte, chrome, and pastel tones with delicate silk foliage accents. Perfect for ceremony entrance gates, cake cutting backdrops, or welcome photobooths. Full assembly and on-site framing included.',
    status: 'Draft',
    views: 14,
    inquiries: 1,
    createdAt: '2026-01-05',
  },
  {
    id: 'lst-005',
    title: 'Sri Lankan Buffet Reception Catering',
    category: 'Catering',
    price: null,
    description:
      'Traditional Sri Lankan wedding buffet tailored for 100–500 guests. Menu designed with the couple; includes vegetarian and vegan options. Price quoted per head.',
    fullDescription:
      'An authentic culinary experience featuring heritage Sri Lankan recipes alongside contemporary fusion presentations. Our comprehensive catering service accommodates 100 to 500 guests with live hopper stations, slow-cooked claypot curries, fresh seafood grills, and dessert spreads. Includes professional banquet staff, chafing dishes, premium cutlery, and tailored vegetarian/halal options.',
    status: 'Active',
    views: 210,
    inquiries: 19,
    createdAt: '2025-10-28',
  },
  {
    id: 'lst-006',
    title: 'Live Acoustic Band – Ceremony & Cocktail Hour',
    category: 'Music',
    price: 45000,
    description:
      '3-piece acoustic ensemble performing curated sets during the ceremony processional and cocktail reception. Repertoire spans classical, pop, and Sinhala classics.',
    fullDescription:
      'Enchant your guests with timeless acoustic melodies performed live by our seasoned trio (vocals/acoustic guitar, cello/violin, and cajón percussion). We curate a bespoke 2-hour setlist covering your ceremony processional, ring exchange, register signing, and cocktail hour. We provide our own compact Bose PA sound system and wireless microphones.',
    status: 'Active',
    views: 56,
    inquiries: 4,
    createdAt: '2026-02-14',
  },
  {
    id: 'lst-008',
    title: 'The Grand Sapphire Ballroom & Gardens',
    category: 'Hotel / Venue',
    price: 350000,
    description:
      'Luxurious colonial-style ballroom and scenic landscaped garden marquee overlooking the coastline. Perfect for grand receptions up to 600 guests.',
    fullDescription:
      'The Grand Sapphire stands as one of the premier colonial luxury wedding destinations on the western coastline. Boasting high vaulted ceilings, handcrafted crystal chandeliers, state-of-the-art acoustic architecture, and expansive manicured garden lawns extending toward sunset ocean vistas. Includes private bridal dressing suites, complimentary executive bridal car parking, uninterrupted backup generators, and professional banquet manager coordination.',
    status: 'Active',
    views: 312,
    inquiries: 28,
    createdAt: '2026-01-12',
    details: {
      spaces: [
        {
          id: 'space-1',
          name: 'Sapphire Grand Ballroom',
          type: 'Indoor Ballroom',
          capacitySeated: '450',
          capacityFloating: '650',
          isAirConditioned: true,
          description: 'High ceilings, crystal chandeliers, integrated audio-visual setup and private bridal green room.',
        },
        {
          id: 'space-2',
          name: 'Emerald Garden & Poolside Marquee',
          type: 'Outdoor Lawn / Garden',
          capacitySeated: '200',
          capacityFloating: '350',
          isAirConditioned: false,
          description: 'Open-air manicured lawn with fairy lighting and panoramic sunset backdrop.',
        },
      ],
    },
  },
];

const STORAGE_KEY = 'owp_vendor_listings_mock';

/**
 * Retrieve listings from localStorage, falling back to initialListings.
 */
export function getStoredListings() {
  if (typeof window === 'undefined') return initialListings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored listings', e);
  }
  return initialListings;
}

/**
 * Insert or update a listing in localStorage.
 */
export function saveStoredListing(listing) {
  const current = getStoredListings();
  const idx = current.findIndex((l) => l.id === listing.id);
  let updated;
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...listing };
  } else {
    updated = [listing, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist listing', e);
  }
  return updated;
}

/**
 * Delete a listing from localStorage.
 */
export function deleteStoredListing(id) {
  const current = getStoredListings();
  const updated = current.filter((l) => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete stored listing', e);
  }
  return updated;
}
