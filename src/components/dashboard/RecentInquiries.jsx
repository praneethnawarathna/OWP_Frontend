import { ArrowRight } from 'lucide-react';
import { recentInquiries } from '../../mock/dashboardData';

export default function RecentInquiries() {
  return (
    <section aria-label="Recent customer inquiries" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1E5EC]">
        <h2
          className="text-base font-semibold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Recent Customer Inquiries
        </h2>
      </div>

      {/* Inquiry rows */}
      <div className="flex-1 divide-y divide-[#F9F0F5]">
        {recentInquiries.map((inq) => (
          <div
            key={inq.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-[#FDF0F4]/40 transition-colors"
          >
            {/* Avatar */}
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: inq.avatarBg, color: inq.avatarText }}
              aria-hidden="true"
            >
              {inq.coupleInitials}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E293B] leading-tight">{inq.couple}</p>
              <p className="text-xs text-[#999] mt-0.5">
                Inquiring for: <span className="text-[#737373]">{inq.inquiryFor}</span>
              </p>
            </div>

            {/* Event date */}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-[#999]">Event Date</p>
              <p className="text-xs font-semibold text-[#8E406F]">{inq.eventDate}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#F1E5EC]">
        <button className="flex items-center gap-1 text-xs text-[#8E406F] font-medium hover:gap-2 transition-all">
          Manage All Customers <ArrowRight size={12} />
        </button>
      </div>
    </section>
  );
}
