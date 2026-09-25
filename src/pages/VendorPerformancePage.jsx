import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import ActiveListingsSummary from '../components/vendor-performance/ActiveListingsSummary';
import TrafficChart from '../components/vendor-performance/TrafficChart';
import AiSuggestionsList from '../components/vendor-performance/AiSuggestionsList';

const API_BASE = 'http://localhost:5131/api/vendor-performance';
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

function SectionLoader() {
  return (
    <div className="flex justify-center py-10 border border-[#F1E5EC] bg-white rounded-2xl shadow-sm">
      <div className="h-6 w-6 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin" />
    </div>
  );
}

function SectionError({ error }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
      <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-rose-800">Failed to load section</p>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      </div>
    </div>
  );
}

export default function VendorPerformancePage() {
  // 1. Active Listings State
  const [activeListings, setActiveListings] = useState(null);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState(null);

  // 2. Traffic State
  const [trafficRange, setTrafficRange] = useState('30');
  const [trafficChartData, setTrafficChartData] = useState([]);
  const [topListings, setTopListings] = useState([]);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [trafficError, setTrafficError] = useState(null);

  // 3. Favorites State
  const [favoritedListings, setFavoritedListings] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);

  // 4. AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  // --- Fetch Active Listings ---
  useEffect(() => {
    const fetchActiveListings = async () => {
      try {
        setActiveLoading(true);
        setActiveError(null);
        const res = await fetch(`${API_BASE}/active-listings`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load active listings');
        const data = await res.json();
        
        const byStatus = data.byStatus || [];
        const getCount = (status) => byStatus.find(s => s.status === status)?.count || 0;
        
        setActiveListings({
          total: data.totalListings || 0,
          active: getCount('Active') + getCount('Published'),
          pending: getCount('Pending'),
          rejected: getCount('Rejected'),
          flagged: getCount('Flagged'),
        });
      } catch (err) {
        setActiveError(err.message);
      } finally {
        setActiveLoading(false);
      }
    };
    fetchActiveListings();
  }, []);

  // --- Fetch Traffic (depends on range) ---
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        setTrafficLoading(true);
        setTrafficError(null);
        
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - parseInt(trafficRange));
        
        const fromStr = fromDate.toISOString();
        const toStr = toDate.toISOString();
        
        const res = await fetch(`${API_BASE}/traffic?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load traffic data');
        const data = await res.json();
        
        const mappedChartData = (data.dailyViews || []).map(dv => {
          const dateObj = new Date(dv.date);
          const formattedDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
          return { date: formattedDate, views: dv.views };
        });
        setTrafficChartData(mappedChartData);
        
        const mappedTopListings = (data.topListings || []).map(tl => ({
          id: tl.serviceId,
          title: tl.serviceName,
          category: 'Listing', 
          coverImage: tl.coverImageUrl,
          views: tl.viewCount,
        }));
        setTopListings(mappedTopListings);
        
      } catch (err) {
        setTrafficError(err.message);
      } finally {
        setTrafficLoading(false);
      }
    };
    fetchTraffic();
  }, [trafficRange]);

  // --- Fetch Favorites ---
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setFavoritesLoading(true);
        setFavoritesError(null);
        const res = await fetch(`${API_BASE}/favorites`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load favorites');
        const data = await res.json();
        
        const mappedFavorites = data.map(fl => ({
          id: fl.serviceId,
          title: fl.serviceName,
          category: 'Listing',
          coverImage: fl.coverImageUrl,
          favorites: fl.favoriteCount,
        }));
        setFavoritedListings(mappedFavorites);
      } catch (err) {
        setFavoritesError(err.message);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // --- Fetch AI Suggestions ---
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      try {
        setAiLoading(true);
        setAiError(null);
        const res = await fetch(`${API_BASE}/ai-suggestions`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load AI suggestions');
        const data = await res.json();
        
        const mappedAi = (data.byListing || []).map(bl => ({
          listingId: bl.serviceId,
          listingTitle: bl.serviceName,
          suggestionCount: bl.suggestionCount,
          suggestions: (bl.entries || []).map(entry => ({
            id: entry.suggestionId,
            suggestedAt: entry.suggestedAt,
            customerContext: 'Customer Match', 
            reasoning: entry.reasoning,
          }))
        }));
        setAiSuggestions(mappedAi);
      } catch (err) {
        setAiError(err.message);
      } finally {
        setAiLoading(false);
      }
    };
    fetchAiSuggestions();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF0F4] border border-[#F1E5EC]">
            <BarChart3 size={20} className="text-[#8E406F]" aria-hidden="true" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Performance & Analytics
            </h1>
            <p className="text-sm text-[#737373] mt-0.5">
              Monitor listing health, audience traffic, and AI recommendation performance.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Active Listings Summary ── */}
      {activeLoading ? (
        <SectionLoader />
      ) : activeError ? (
        <SectionError error={activeError} />
      ) : (
        <ActiveListingsSummary summary={activeListings} />
      )}

      {/* ── Section 2: Traffic Trends & Top Performing Listings ── */}
      <TrafficChart
        chartData={trafficChartData}
        topListings={topListings}
        favoritedListings={favoritedListings}
        range={trafficRange}
        onRangeChange={setTrafficRange}
        trafficLoading={trafficLoading}
        trafficError={trafficError}
        favoritesLoading={favoritesLoading}
        favoritesError={favoritesError}
      />

      {/* ── Section 3: AI Recommendation Insights ── */}
      {aiLoading ? (
        <SectionLoader />
      ) : aiError ? (
        <SectionError error={aiError} />
      ) : (
        <AiSuggestionsList suggestions={aiSuggestions} />
      )}
    </div>
  );
}
