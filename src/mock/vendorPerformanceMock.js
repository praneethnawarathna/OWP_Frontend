// ============================================================
// OWP – Vendor Performance & Analytics Mock Data
// Used by VendorPerformancePage and its child components.
// ============================================================

/**
 * 1. Active Listings Summary Counters
 * Displays: Total, Active/Published, Pending, Rejected, Flagged
 */
export const mockActiveListingsSummary = {
  total: 12,
  active: 8,
  pending: 2,
  rejected: 1,
  flagged: 1,
};

/**
 * 2. Traffic Data (views per day over selectable range: 7, 30, 90 days)
 */
export const mockTrafficData = {
  '7': [
    { date: 'Sep 19', views: 34 },
    { date: 'Sep 20', views: 42 },
    { date: 'Sep 21', views: 58 },
    { date: 'Sep 22', views: 47 },
    { date: 'Sep 23', views: 63 },
    { date: 'Sep 24', views: 79 },
    { date: 'Sep 25', views: 68 },
  ],
  '30': [
    { date: 'Aug 27', views: 22 },
    { date: 'Aug 29', views: 28 },
    { date: 'Aug 31', views: 35 },
    { date: 'Sep 02', views: 30 },
    { date: 'Sep 04', views: 44 },
    { date: 'Sep 06', views: 52 },
    { date: 'Sep 08', views: 48 },
    { date: 'Sep 10', views: 61 },
    { date: 'Sep 12', views: 54 },
    { date: 'Sep 14', views: 67 },
    { date: 'Sep 16', views: 73 },
    { date: 'Sep 18', views: 65 },
    { date: 'Sep 20', views: 82 },
    { date: 'Sep 22', views: 75 },
    { date: 'Sep 24', views: 91 },
    { date: 'Sep 25', views: 84 },
  ],
  '90': [
    { date: 'Jul 01', views: 18 },
    { date: 'Jul 10', views: 24 },
    { date: 'Jul 20', views: 31 },
    { date: 'Jul 30', views: 29 },
    { date: 'Aug 09', views: 42 },
    { date: 'Aug 19', views: 48 },
    { date: 'Aug 29', views: 55 },
    { date: 'Sep 08', views: 69 },
    { date: 'Sep 18', views: 78 },
    { date: 'Sep 25', views: 84 },
  ],
};

/**
 * 2b. Top Performing Listings (by View Count)
 */
export const mockTopPerformingListings = [
  {
    id: 1,
    title: 'Full-Day Luxury Wedding Photography & Highlights',
    category: 'Photography',
    coverImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    views: 1248,
    badgeText: 'Highest Views',
  },
  {
    id: 2,
    title: 'Grand Ballroom & Sunset Garden Reception Venue',
    category: 'Venue',
    coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    views: 940,
    badgeText: 'Trending',
  },
  {
    id: 3,
    title: 'Cinematic 4K Drone Wedding Highlight Reel',
    category: 'Videography',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    views: 682,
    badgeText: 'Popular',
  },
  {
    id: 4,
    title: 'Pre-Wedding Sunset Coastal Portrait Session',
    category: 'Photography',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    views: 512,
    badgeText: 'Steady',
  },
];

/**
 * 2c. Most Favorited Listings (by Favorite Count)
 */
export const mockMostFavoritedListings = [
  {
    id: 1,
    title: 'Full-Day Luxury Wedding Photography & Highlights',
    category: 'Photography',
    coverImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    favorites: 184,
  },
  {
    id: 2,
    title: 'Grand Ballroom & Sunset Garden Reception Venue',
    category: 'Venue',
    coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    favorites: 142,
  },
  {
    id: 3,
    title: 'Cinematic 4K Drone Wedding Highlight Reel',
    category: 'Videography',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    favorites: 96,
  },
  {
    id: 4,
    title: 'Pre-Wedding Sunset Coastal Portrait Session',
    category: 'Photography',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    favorites: 67,
  },
];

/**
 * 3. AI Suggestions
 * Per-listing card/row: listing title, suggestion count, expandable reasoning text entries.
 * Default is strictly EMPTY to test the realistic empty state.
 */
export const mockAiSuggestions = [];

/*
// ============================================================
// VISUAL REFERENCE EXAMPLE ONLY (Populated State)
// ============================================================
export const samplePopulatedAiSuggestions = [
  {
    listingId: 1,
    listingTitle: 'Full-Day Luxury Wedding Photography & Highlights',
    suggestionCount: 3,
    suggestions: [
      {
        id: 'sug-1',
        suggestedAt: '2026-09-24T14:30:00Z',
        customerContext: 'Sarah & Michael (Wedding Date: Jun 2027)',
        reasoning: 'Recommended based on couple preference for documentary-style photography and budget tier matching your package.',
        matchConfidence: '96%',
      },
      {
        id: 'sug-2',
        suggestedAt: '2026-09-22T09:15:00Z',
        customerContext: 'Gayan & Minoli (Wedding Date: Sep 2026)',
        reasoning: 'Matched due to high inquiry demand for New York coastal wedding packages.',
        matchConfidence: '91%',
      },
      {
        id: 'sug-3',
        suggestedAt: '2026-09-18T16:40:00Z',
        customerContext: 'Samantha & Daniel (Wedding Date: Nov 2026)',
        reasoning: 'Suggested as a top-rated photography package in the Greater Metro area.',
        matchConfidence: '88%',
      },
    ],
  },
  {
    listingId: 2,
    listingTitle: 'Cinematic 4K Drone Wedding Highlight Reel',
    suggestionCount: 1,
    suggestions: [
      {
        id: 'sug-4',
        suggestedAt: '2026-09-21T11:20:00Z',
        customerContext: 'Kavindi & Dulaj (Wedding Date: Dec 2026)',
        reasoning: 'AI matched couple inquiry specifically seeking drone 4K videography add-ons.',
        matchConfidence: '93%',
      },
    ],
  },
];
*/
