import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Eye,
  Heart,
  Image as ImageIcon,
} from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#F1E5EC] bg-white p-3 shadow-lg text-xs">
        <p className="font-semibold text-[#1E293B] mb-1">{label}</p>
        <p className="flex items-center gap-1.5 font-bold text-[#8E406F]">
          <Eye size={13} />
          {payload[0].value} {payload[0].value === 1 ? 'view' : 'views'}
        </p>
      </div>
    );
  }
  return null;
}

export default function TrafficChart({
  chartData = [],
  topListings = [],
  favoritedListings = [],
  range = '30',
  onRangeChange,
  trafficLoading = false,
  trafficError = null,
  favoritesLoading = false,
  favoritesError = null,
}) {
  const totalViewsInRange = chartData.reduce(
    (acc, curr) => acc + (curr.views || 0),
    0
  );

  return (
    <section aria-label="Traffic Analytics" className="space-y-6">
      {/* ── Main Chart Card ── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 sm:p-6 shadow-sm">
        {/* Header with Title and Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F1E5EC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF0F4] text-[#8E406F]">
                <TrendingUp size={16} aria-hidden="true" />
              </span>
              <h2
                className="text-base font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Traffic Trends
              </h2>
            </div>
            <p className="text-xs text-[#737373] mt-1 pl-10">
              Views per day over a selectable timeframe ·{' '}
              <span className="font-semibold text-[#8E406F]">
                {totalViewsInRange.toLocaleString()} total views
              </span>
            </p>
          </div>

          {/* Timeframe Selector Pills */}
          <div
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-[#F1E5EC] bg-[#FCFAFB] p-1"
            role="group"
            aria-label="Select traffic date range"
          >
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onRangeChange?.(option.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  range === option.id
                    ? 'bg-[#8E406F] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#8E406F] hover:bg-[#FDF0F4]'
                }`}
                aria-pressed={range === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-6 h-72 w-full relative">
          {trafficLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
              <div className="h-6 w-6 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin" />
            </div>
          )}
          {trafficError && !trafficLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-rose-500 text-sm">
              Failed to load traffic data: {trafficError}
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F9F0F5"
              />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#F1E5EC' }}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 11 }}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#8E406F"
                strokeWidth={2.5}
                dot={{ fill: '#8E406F', r: 3, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: '#8E406F',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top Performing & Most Favorited Listings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Listings */}
        <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm flex flex-col relative min-h-[250px]">
          {trafficLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
              <div className="h-6 w-6 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin" />
            </div>
          )}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F1E5EC] mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF0F4] text-[#8E406F]">
                <Eye size={16} />
              </span>
              <div>
                <h3
                  className="text-sm font-bold text-[#1E293B]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Top Performing Listings
                </h3>
                <p className="text-[11px] text-[#737373]">
                  Ranked by total customer impressions
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#F9F0F5] flex-1">
            {trafficError && !trafficLoading ? (
              <div className="py-8 text-center text-rose-500 text-xs">Error loading data</div>
            ) : topListings.length === 0 && !trafficLoading ? (
              <div className="py-8 text-center text-[#999] text-xs">No listings found in this period</div>
            ) : (
              topListings.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 group"
                >
                  {/* Rank indicator */}
                  <span className="text-xs font-bold text-[#999] w-4 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  {/* Cover Image Thumbnail */}
                  <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-[#F1E5EC] relative flex items-center justify-center">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: item.coverImage ? 'none' : 'flex' }}
                      className="h-full w-full flex-col items-center justify-center bg-[#FDF0F4] text-[#8E406F]/40"
                    >
                      <ImageIcon size={16} />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1E293B] truncate group-hover:text-[#8E406F] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#737373] mt-0.5">
                      {item.category}
                    </p>
                  </div>

                  {/* View Count */}
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF0F4] px-2.5 py-1 text-xs font-bold text-[#8E406F]">
                      <Eye size={12} />
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Favorited Listings */}
        <div className="rounded-2xl border border-[#F1E5EC] bg-white p-5 shadow-sm flex flex-col relative min-h-[250px]">
          {favoritesLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
              <div className="h-6 w-6 rounded-full border-2 border-[#8E406F] border-t-transparent animate-spin" />
            </div>
          )}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F1E5EC] mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF0F4] text-[#8E406F]">
                <Heart size={16} className="fill-[#8E406F]" />
              </span>
              <div>
                <h3
                  className="text-sm font-bold text-[#1E293B]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Most Favorited Listings
                </h3>
                <p className="text-[11px] text-[#737373]">
                  Services saved to couples' wishlists
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#F9F0F5] flex-1">
            {favoritesError && !favoritesLoading ? (
              <div className="py-8 text-center text-rose-500 text-xs">Error loading data</div>
            ) : favoritedListings.length === 0 && !favoritesLoading ? (
              <div className="py-8 text-center text-[#999] text-xs">No favorites found</div>
            ) : (
              favoritedListings.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 group"
                >
                  {/* Rank indicator */}
                  <span className="text-xs font-bold text-[#999] w-4 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  {/* Cover Image Thumbnail */}
                  <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-[#F1E5EC] relative flex items-center justify-center">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: item.coverImage ? 'none' : 'flex' }}
                      className="h-full w-full flex-col items-center justify-center bg-[#FDF0F4] text-[#8E406F]/40"
                    >
                      <ImageIcon size={16} />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1E293B] truncate group-hover:text-[#8E406F] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#737373] mt-0.5">
                      {item.category}
                    </p>
                  </div>

                  {/* Favorite Count */}
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF0F4] px-2.5 py-1 text-xs font-bold text-[#8E406F]">
                      <Heart size={12} className="fill-[#8E406F]" />
                      {item.favorites.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
