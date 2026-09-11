import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Star,
} from 'lucide-react';

// ============================================================
// SAMPLE DATA — Lumina Photography
// ============================================================
const SUMMARY_STATS = [
  {
    id: 'views',
    label: 'Profile Views',
    value: '1,248',
    subtext: '+12% this month',
    trendPositive: true,
    icon: Eye,
  },
  {
    id: 'inquiries',
    label: 'New Inquiries',
    value: '24',
    subtext: '+5 this week',
    trendPositive: true,
    icon: MessageCircle,
  },
  {
    id: 'bookings',
    label: 'Upcoming Bookings',
    value: '8',
    subtext: '3 this week',
    trendPositive: false,
    icon: CalendarDays,
  },
  {
    id: 'rating',
    label: 'Average Rating',
    value: '4.8 ★',
    subtext: '126 Reviews',
    isRating: true,
    icon: Star,
  },
];

const RECENT_INQUIRIES = [
  {
    id: 1,
    initials: 'SM',
    customer: 'Sarah & Michael',
    service: 'Wedding Photography',
    eventDate: 'June 15, 2026',
    received: '2 hours ago',
    status: 'New',
    statusStyle: 'bg-[#FDF0F4] text-[#8E406F] border-[#E8C4D8]',
    avatarBg: 'bg-[#8E406F]',
    avatarText: 'text-white',
  },
  {
    id: 2,
    initials: 'GM',
    customer: 'Gayan & Minoli',
    service: 'Wedding Photography',
    eventDate: 'September 28, 2026',
    received: 'Yesterday',
    status: 'Responded',
    statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    avatarBg: 'bg-[#E8C4D8]',
    avatarText: 'text-[#8E406F]',
  },
  {
    id: 3,
    initials: 'SD',
    customer: 'Samantha & Daniel',
    service: 'Wedding Photography & Video',
    eventDate: 'November 12, 2026',
    received: '3 days ago',
    status: 'Pending',
    statusStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    avatarBg: 'bg-[#FDF0F4]',
    avatarText: 'text-[#8E406F]',
  },
];

const UPCOMING_BOOKINGS = [
  {
    id: 1,
    initials: 'SM',
    couple: 'Sarah & Michael',
    date: 'June 15, 2026',
    service: 'Wedding Photography',
    venue: 'Grand Plaza, New York',
    status: 'Confirmed',
  },
  {
    id: 2,
    initials: 'GM',
    couple: 'Gayan & Minoli',
    date: 'September 28, 2026',
    service: 'Wedding Photography',
    venue: 'The Grand Pavilion, Long Island',
    status: 'Pending',
  },
];

const PERFORMANCE_DATA = [
  { month: 'Jan', views: 210, inquiries: 14, bookings: 4 },
  { month: 'Feb', views: 245, inquiries: 18, bookings: 5 },
  { month: 'Mar', views: 290, inquiries: 20, bookings: 6 },
  { month: 'Apr', views: 330, inquiries: 25, bookings: 7 },
  { month: 'May', views: 375, inquiries: 29, bookings: 8 },
  { month: 'Jun', views: 420, inquiries: 35, bookings: 10 },
];

const QUICK_ACTIONS = [
  { label: 'Edit My Listing', icon: Pencil, desc: 'Update photos & details' },
  { label: 'Add Service', icon: Plus, desc: 'Create new package' },
  { label: 'View Inquiries', icon: MessageCircle, desc: 'Check customer chats' },
  { label: 'View Calendar', icon: Calendar, desc: 'Check upcoming dates' },
];

// ============================================================
// SUBCOMPONENTS
// ============================================================

// Header for card containers
function SectionHeader({ title, actionText, onAction }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1E5EC] px-6 py-4">
      <h2
        className="text-base font-semibold text-[#1E293B]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="group flex items-center gap-1 text-xs font-medium text-[#8E406F] transition-all hover:text-[#73325A] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 rounded px-1.5 py-0.5"
        >
          <span>{actionText}</span>
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

// Top Metric Cards
function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <article
      aria-label={`${stat.label}: ${stat.value}`}
      className="group relative overflow-hidden rounded-2xl border border-[#F1E5EC] bg-[#FDF0F4] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#737373]">{stat.label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8E406F] shadow-sm border border-[#F1E5EC] transition-transform group-hover:scale-110">
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <p
        className="text-3xl sm:text-4xl font-bold text-[#1E293B] leading-none"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {stat.value}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {stat.trendPositive ? (
          <span className="inline-flex items-center gap-0.5 font-medium text-[#8E406F]">
            <ArrowUpRight size={13} aria-hidden="true" />
            {stat.subtext}
          </span>
        ) : stat.isRating ? (
          <span className="text-[#737373] font-medium flex items-center gap-1">
            <Star size={12} className="fill-[#8E406F] text-[#8E406F]" aria-hidden="true" />
            {stat.subtext}
          </span>
        ) : (
          <span className="text-[#737373] font-medium">{stat.subtext}</span>
        )}
      </div>

      {/* Subtle bottom decorative bar */}
      <div className="mt-3 h-[2px] w-10 rounded-full bg-[#8E406F]/30 transition-all group-hover:w-16" />
    </article>
  );
}

// Inquiries list card
function InquiriesWidget() {
  const filteredInquiries = RECENT_INQUIRIES;

  return (
    <section
      aria-label="Recent customer inquiries"
      className="flex flex-col h-full rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden"
    >
      <SectionHeader
        title="Recent Customer Inquiries"
        actionText="View All Inquiries →"
        onAction={() => {}}
      />

      {/* Inquiry rows */}
      <div className="flex-1 divide-y divide-[#F9F0F5]">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 transition-colors hover:bg-[#FDF0F4]/40"
          >
            {/* Left: Avatar + Details */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${inq.avatarBg} ${inq.avatarText}`}
                aria-hidden="true"
              >
                {inq.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1E293B] truncate">{inq.customer}</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inq.statusStyle}`}
                  >
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-[#737373] mt-0.5">{inq.service}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#999]">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} className="text-[#8E406F]" aria-hidden="true" />
                    {inq.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={12} aria-hidden="true" />
                    {inq.received}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                className="rounded-lg border border-[#F1E5EC] bg-white px-3 py-1.5 text-xs font-medium text-[#555] transition-all hover:border-[#8E406F] hover:text-[#8E406F] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20"
              >
                View
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-[#8E406F] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#73325A] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8E406F]/40"
              >
                <MessageCircle size={12} aria-hidden="true" />
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div className="border-t border-[#F1E5EC] px-6 py-3 bg-[#FCFCFD] flex items-center justify-between">
        <span className="text-xs text-[#999]">
          Showing {filteredInquiries.length} of 24 inquiries
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#8E406F] hover:text-[#73325A] transition-colors"
        >
          View All Inquiries <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

// Bookings list card
function BookingsWidget() {
  return (
    <section
      aria-label="Upcoming bookings"
      className="flex flex-col h-full rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden"
    >
      <SectionHeader
        title="Upcoming Bookings"
        actionText="View All Bookings →"
        onAction={() => {}}
      />

      <div className="flex-1 divide-y divide-[#F9F0F5]">
        {UPCOMING_BOOKINGS.map((b) => {
          const isConfirmed = b.status === 'Confirmed';
          return (
            <div
              key={b.id}
              className="p-5 transition-colors hover:bg-[#FDF0F4]/40 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF0F4] text-xs font-bold text-[#8E406F] border border-[#F1E5EC]"
                    aria-hidden="true"
                  >
                    {b.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B] leading-tight">{b.couple}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{b.service}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    isConfirmed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#737373] pl-13">
                <p className="flex items-center gap-1.5 text-xs text-[#8E406F] font-medium">
                  <CalendarDays size={13} className="shrink-0 text-[#8E406F]" aria-hidden="true" />
                  {b.date}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-[#999]">
                  <MapPin size={13} className="shrink-0 text-[#999]" aria-hidden="true" />
                  {b.venue}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F9F0F5] flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#8E406F] hover:text-[#73325A] hover:underline focus:outline-none"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#F1E5EC] px-6 py-3 bg-[#FCFCFD] flex items-center justify-between">
        <span className="text-xs text-[#999]">8 confirmed this season</span>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#8E406F] hover:text-[#73325A] transition-colors"
        >
          View All Bookings <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

// Business Performance Chart
function PerformanceWidget() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Maximum view count for relative scaling
  const maxViews = 450;
  const maxInquiries = 40;
  const maxBookings = 12;

  return (
    <section
      aria-label="Business performance analytics"
      className="flex flex-col h-full rounded-2xl border border-[#F1E5EC] bg-white shadow-sm overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1E5EC] px-6 py-4 gap-2">
        <div>
          <h2
            className="text-base font-semibold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Business Performance
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Profile views, inquiries & confirmed bookings trend
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#555]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#8E406F]" aria-hidden="true" />
            Profile Views
          </span>
          <span className="flex items-center gap-1.5 text-[#555]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#C5A3B8]" aria-hidden="true" />
            Inquiries
          </span>
          <span className="flex items-center gap-1.5 text-[#555]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#E8C4D8]" aria-hidden="true" />
            Bookings
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-6 flex-1 flex flex-col justify-end">
        {/* Bars Container */}
        <div className="relative h-56 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 border-b border-[#F1E5EC]">
          {/* Subtle Background Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-[#F1E5EC] w-full" />
            <div className="border-b border-dashed border-[#F1E5EC] w-full" />
            <div className="border-b border-dashed border-[#F1E5EC] w-full" />
          </div>

          {PERFORMANCE_DATA.map((item, idx) => {
            const viewsHeight = Math.round((item.views / maxViews) * 100);
            const inqHeight = Math.round((item.inquiries / maxInquiries) * 100);
            const bookHeight = Math.round((item.bookings / maxBookings) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative flex-1 flex flex-col items-center justify-end h-full z-10 cursor-pointer"
              >
                {/* Floating tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 bg-[#1E293B] text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-20 pointer-events-none animate-in fade-in">
                    <p className="font-semibold text-center mb-0.5">{item.month} 2026</p>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-[#E8C4D8]">👁 {item.views}</span>
                      <span className="text-[#C5A3B8]">💬 {item.inquiries}</span>
                      <span className="text-white">📅 {item.bookings}</span>
                    </div>
                  </div>
                )}

                {/* Bars group */}
                <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                  {/* Views bar */}
                  <div
                    className="w-1/3 max-w-[14px] rounded-t bg-[#8E406F] transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${viewsHeight}%` }}
                    title={`${item.views} views`}
                  />
                  {/* Inquiries bar */}
                  <div
                    className="w-1/3 max-w-[14px] rounded-t bg-[#C5A3B8] transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${inqHeight}%` }}
                    title={`${item.inquiries} inquiries`}
                  />
                  {/* Bookings bar */}
                  <div
                    className="w-1/3 max-w-[14px] rounded-t bg-[#E8C4D8] transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${bookHeight}%` }}
                    title={`${item.bookings} bookings`}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`text-xs mt-2 transition-colors ${
                    isHovered ? 'font-bold text-[#8E406F]' : 'text-[#737373]'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Profile Status Section
function ProfileStatusWidget() {
  return (
    <section
      aria-label="Vendor profile status"
      className="flex flex-col justify-between h-full rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] border border-[#F1E5EC] shadow-sm">
              <Camera size={22} />
            </div>
            <div>
              <h2
                className="text-base font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Lumina Photography
              </h2>
              <p className="text-xs text-[#737373]">Photography & Videography</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 size={12} />
            Published
          </span>
        </div>

        <div className="space-y-2.5 rounded-xl bg-[#FDF0F4]/50 border border-[#F1E5EC] p-4 text-xs text-[#555]">
          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#8E406F]" /> Location:
            </span>
            <span className="font-medium text-[#1E293B]">New York, NY</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <Star size={13} className="text-[#8E406F] fill-[#8E406F]" /> Reputation:
            </span>
            <span className="font-semibold text-[#1E293B]">4.8 ★ (126 Reviews)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <HeartHandshake size={13} className="text-[#8E406F]" /> Client Match:
            </span>
            <span className="font-medium text-emerald-700">98% High Response Rate</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#8E406F] bg-white py-2.5 text-xs font-semibold text-[#8E406F] shadow-sm transition-all hover:bg-[#8E406F] hover:text-white active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#8E406F]/30"
        >
          <span>View Public Listing</span>
          <ExternalLink
            size={13}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </section>
  );
}

// Quick Actions Section
function QuickActionsSection() {
  return (
    <section aria-label="Quick actions" className="pt-2">
      <h2
        className="text-base font-semibold text-[#1E293B] mb-3"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(({ label, icon: Icon, desc }) => (
          <button
            key={label}
            type="button"
            className="group flex items-center justify-between rounded-2xl border border-[#F1E5EC] bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8E406F]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F] transition-transform group-hover:scale-105">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#8E406F] transition-colors">
                  {label}
                </p>
                <p className="text-[10px] text-[#999]">{desc}</p>
              </div>
            </div>
            <ArrowRight
              size={14}
              className="text-[#bbb] transition-transform group-hover:translate-x-1 group-hover:text-[#8E406F]"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function VendorDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-[#1E293B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#8E406F] mt-0.5">
            Manage your business, bookings, and customer inquiries.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#F1E5EC] bg-white px-3.5 py-1.5 text-xs font-medium text-[#737373] shadow-sm transition-all hover:border-[#8E406F]/30 hover:text-[#8E406F] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20"
          >
            <CalendarRange size={13} className="text-[#8E406F]" aria-hidden="true" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* ── Section 1: Summary Metric Cards (4 cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUMMARY_STATS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* ── Row 2: Inquiries (65%) + Bookings (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6 items-stretch">
        <InquiriesWidget />
        <BookingsWidget />
      </div>

      {/* ── Row 3: Business Performance (65%) + Profile Status (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6 items-stretch">
        <PerformanceWidget />
        <ProfileStatusWidget />
      </div>

      {/* ── Row 4: Quick Actions ── */}
      <QuickActionsSection />
    </div>
  );
}