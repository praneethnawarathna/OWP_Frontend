import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';

// Mini bar chart for Total Inquiries card
function MiniBarChart() {
  const bars = [3, 5, 4, 7, 5, 8, 6];
  const max = 8;
  return (
    <div className="flex items-end gap-0.5 h-6 mt-3">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[#8E406F]"
          style={{ height: `${(h / max) * 100}%`, opacity: i === bars.length - 1 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

export default function MetricCards() {
  const [metrics, setMetrics] = useState({
    activeListings: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/listing-reviews/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            activeListings: data.activeListings || 0,
            pendingReviews: data.pendingReviews || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <>
      {/* Card 1: Total Published Listings */}
      <article
        aria-label={`Total Published Listings: ${metrics.activeListings}`}
        className="bg-[#FDF0F4] rounded-2xl border border-[#F1E5EC] p-5"
      >
        <p className="text-xs text-[#737373] font-medium mb-3">Total Published Listings</p>
        <p
          className="text-4xl font-bold text-[#8E406F] leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {metrics.activeListings}
        </p>
        <div className="mt-3 h-[2px] w-10 rounded-full bg-[#8E406F]/30" />
      </article>

      {/* Card 2: Pending Reviews */}
      <article
        aria-label={`Pending Reviews: ${metrics.pendingReviews} — Urgent`}
        className="bg-[#FDF0F4] rounded-2xl border border-[#F1E5EC] p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-[#737373] font-medium">Pending Reviews</p>
          {metrics.pendingReviews > 0 && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 leading-none">
              URGENT
            </span>
          )}
        </div>
        <p
          className="text-4xl font-bold text-[#1E293B] leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {metrics.pendingReviews}
        </p>
        <p className="mt-2 text-[11px] text-[#737373]">Live data from backend</p>
      </article>

      {/* Card 3: Total Inquiries */}
      <article
        aria-label="Total Inquiries: 1,240"
        className="bg-[#FDF0F4] rounded-2xl border border-[#F1E5EC] p-5"
      >
        <p className="text-xs text-[#737373] font-medium mb-3">Total Inquiries</p>
        <p
          className="text-4xl font-bold text-[#1E293B] leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          1,240
        </p>
        <MiniBarChart />
      </article>

      {/* Card 4: Active Categories */}
      <article
        aria-label="Active Categories: 5"
        className="bg-[#FDF0F4] rounded-2xl border border-[#F1E5EC] p-5"
      >
        <p className="text-xs text-[#737373] font-medium mb-3">Active Categories</p>
        <p
          className="text-4xl font-bold text-[#1E293B] leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          5
        </p>
        <p className="mt-2 text-[11px] text-[#737373]">Hotels, DJ, Catering…</p>
      </article>
    </>
  );
}
