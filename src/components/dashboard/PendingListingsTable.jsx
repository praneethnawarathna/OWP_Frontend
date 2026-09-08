import { pendingListings } from '../../mock/dashboardData';

const badgeStyles = {
  photography: 'bg-purple-50 text-purple-700 border-purple-200',
  hotels:      'bg-blue-50   text-blue-700   border-blue-200',
  dj:          'bg-green-50  text-green-700  border-green-200',
  catering:    'bg-rose-50   text-rose-700   border-rose-200',
};

export default function PendingListingsTable() {
  return (
    <section aria-label="Pending listings for review" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1E5EC]">
        <h2
          className="text-base font-semibold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Pending Listings for Review
        </h2>
        <button className="text-xs text-[#8E406F] font-medium hover:underline">View All</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-[#F1E5EC]">
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999]">Vendor Name</th>
              <th scope="col" className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999]">Category</th>
              <th scope="col" className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999]">Date Submitted</th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#999]">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingListings.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-[#F9F0F5] hover:bg-[#FDF0F4]/40 transition-colors ${idx === pendingListings.length - 1 ? 'border-none' : ''}`}
              >
                {/* Vendor */}
                <td className="px-6 py-3.5">
                  <p className="text-[#8E406F] font-semibold text-sm leading-tight">{item.vendor}</p>
                  <p className="text-[#999] text-xs">{item.location}</p>
                </td>

                {/* Category badge */}
                <td className="px-3 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyles[item.badgeColor] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {item.category}
                  </span>
                </td>

                {/* Date */}
                <td className="px-3 py-3.5 text-[#555] text-sm">{item.submittedDate}</td>

                {/* Action */}
                <td className="px-6 py-3.5">
                  <button
                    aria-label={`Review ${item.vendor}`}
                    className="px-3 py-1.5 rounded-lg border border-[#8E406F] text-[#8E406F] text-xs font-medium hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
