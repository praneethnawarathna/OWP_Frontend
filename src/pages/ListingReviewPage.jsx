import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Download, Eye, ToggleLeft, ToggleRight, X,
  MapPin, Mail, Phone, Star, Image, Tag,
  DollarSign, Store, CheckCircle2, AlertCircle, Calendar,
} from "lucide-react";
import { allListings, listingCategories } from "../mock/dashboardData";

const PAGE_SIZE = 7;
const AVATAR_COLORS = ["#8E406F","#4A7C6B","#3B6EA5","#7C5CBF","#C8612F","#2E7D8C","#A05C3C"];
const CATEGORY_COLORS = {
  Hotels:      { bg:"#EDE9FE", text:"#6D28D9" },
  DJ:          { bg:"#FEF3C7", text:"#92400E" },
  Catering:    { bg:"#D1FAE5", text:"#065F46" },
  Photography: { bg:"#DBEAFE", text:"#1E40AF" },
  Decoration:  { bg:"#FCE7F3", text:"#9D174D" },
};

function Avatar({ initials, index, size = "md" }) {
  const bg  = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const cls = size === "lg" ? "h-14 w-14 text-base" : "h-9 w-9 text-xs";
  return (
    <div className={`${cls} rounded-full flex items-center justify-center shrink-0 font-bold shadow-sm text-white`}
      style={{ backgroundColor: bg }}>{initials}</div>
  );
}

function CategoryPill({ category }) {
  const s = CATEGORY_COLORS[category] ?? { bg:"#F3F4F6", text:"#374151" };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}>{category}</span>
  );
}

function StatusBadge({ status }) {
  const ok = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      ok ? "bg-[#E6F4EE] text-[#1A7F4B] border-[#A3D9B8]"
         : "bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-[#1A7F4B]" : "bg-[#9CA3AF]"}`} />
      {status}
    </span>
  );
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-xs text-[#aaa]">-</span>;
  return (
    <div className="flex items-center gap-1">
      <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
      <span className="text-xs font-semibold text-[#333]">{rating.toFixed(1)}</span>
    </div>
  );
}

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, delta }) {
  return (
    <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#1E293B] leading-tight">{value}</p>
        <p className="text-xs text-[#737373] mt-0.5 leading-snug">{label}</p>
        {delta && <p className="text-xs text-[#8E406F] font-medium mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}

function ViewModal({ listing, index, onClose, onToggleStatus }) {
  if (!listing) return null;
  const isActive = listing.status === "Active";
  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#8E406F] to-[#73325A] px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar initials={listing.initials} index={index} size="lg" />
            <div>
              <h2 className="text-white font-bold text-lg leading-snug">{listing.vendor}</h2>
              <div className="flex items-center gap-1 mt-1 text-white/70 text-xs">
                <MapPin size={10} /><span>{listing.location}</span>
              </div>
              <div className="mt-2"><CategoryPill category={listing.category} /></div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          <div className="flex items-center justify-between bg-[#FDF0F4] rounded-xl px-4 py-3 border border-[#F6DCE6]">
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">Listing Status</span>
            <StatusBadge status={listing.status} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide mb-1.5">About This Listing</p>
            <p className="text-sm text-[#555] leading-relaxed">{listing.description}</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Contact Information</p>
            <div className="flex items-center gap-3 text-sm text-[#333]">
              <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#8E406F]" />
              </div>
              <span className="truncate">{listing.contact}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#333]">
              <div className="h-8 w-8 rounded-lg bg-[#FDF0F4] border border-[#F6DCE6] flex items-center justify-center shrink-0">
                <Phone size={14} className="text-[#8E406F]" />
              </div>
              <span>{listing.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Price",   value: listing.price,                             icon: DollarSign },
              { label:"Rating",  value: listing.rating ? `${listing.rating} / 5.0` : "No rating", icon: Star },
              { label:"Listed",  value: listing.submittedDate,                     icon: Calendar  },
              { label:"Gallery", value: `${listing.images} photos`,                icon: Image     },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-[#8E406F]" />
                  <p className="text-[10px] font-semibold text-[#8E406F] uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#F6DCE6] px-6 py-4 flex gap-3">
          <button
            onClick={onToggleStatus}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
              isActive ? "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                       : "bg-[#8E406F] text-white hover:bg-[#73325A]"}`}
          >
            {isActive
              ? <><ToggleRight size={15} />Set Inactive</>
              : <><ToggleLeft  size={15} />Set Active</>}
          </button>
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#F6DCE6] text-[#737373] text-sm font-medium hover:bg-[#FDF0F4] transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  if (!message) return null;
  const ok = type !== "error";
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
      ok ? "bg-white border-[#A3D9B8] text-[#1A7F4B]" : "bg-white border-[#FECDCA] text-[#D92D20]"}`}>
      {ok ? <CheckCircle2 size={16} className="text-[#1A7F4B] shrink-0" />
          : <AlertCircle   size={16} className="text-[#D92D20] shrink-0" />}
      {message}
      <button onClick={onDismiss} className="ml-2 text-[#999] hover:text-[#555]" aria-label="Dismiss"><X size={14} /></button>
    </div>
  );
}

export default function ListingReviewPage() {
  const [listingList,  setListingList]  = useState(allListings);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [categoryTab,  setCategoryTab]  = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [toast,        setToast]        = useState({ message:"", type:"success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message:"", type:"success" }), 3500);
  };

  const handleToggleStatus = (listing) => {
    const next = listing.status === "Active" ? "Inactive" : "Active";
    setListingList(prev => prev.map(l => l.id === listing.id ? { ...l, status: next } : l));
    if (viewTarget?.listing?.id === listing.id) {
      setViewTarget(v => ({ ...v, listing: { ...v.listing, status: next } }));
    }
    showToast(`"${listing.vendor}" set to ${next}.`);
  };

  const metrics = useMemo(() => ({
    total:    listingList.length,
    active:   listingList.filter(l => l.status === "Active").length,
    inactive: listingList.filter(l => l.status === "Inactive").length,
  }), [listingList]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return listingList.filter(l => {
      const matchSearch = l.vendor.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
      const matchCat    = categoryTab  === "All" || l.category === categoryTab;
      const matchStatus = statusFilter === "All" || l.status   === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [listingList, searchQuery, categoryTab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage  = () => setCurrentPage(1);

  const handleExport = () => {
    const headers = ["ID","Vendor","Category","Location","Price","Rating","Status","Listed Date","Contact"];
    const rows = filtered.map(l =>
      [l.id, `"${l.vendor}"`, l.category, `"${l.location}"`, l.price, l.rating ?? "", l.status, l.submittedDate, l.contact].join(",")
    );
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "listings.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily:"'Playfair Display', serif" }}>
          Listing Review
        </h1>
        <p className="text-sm text-[#8E406F] mt-0.5">
          Review vendor listings across all categories. Toggle listing visibility between Active and Inactive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={Store}        iconBg="#F6DCE6" iconColor="#8E406F" label="Total Listings"    value={metrics.total}    delta={`${listingCategories.length - 1} categories`} />
        <MetricCard icon={CheckCircle2} iconBg="#D1FAE5" iconColor="#059669" label="Active Listings"   value={metrics.active}   delta="Visible to couples" />
        <MetricCard icon={AlertCircle}  iconBg="#FEF3F2" iconColor="#D92D20" label="Inactive Listings" value={metrics.inactive} delta="Hidden from couples" />
      </div>

      <div className="flex flex-wrap gap-2">
        {listingCategories.map(cat => (
          <button key={cat}
            onClick={() => { setCategoryTab(cat); resetPage(); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              categoryTab === cat
                ? "bg-[#8E406F] text-white border-[#8E406F] shadow-sm"
                : "bg-white text-[#555] border-[#F6DCE6] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]"}`}>
            {cat}
            {cat !== "All" && (
              <span className={`ml-1.5 text-xs font-bold ${categoryTab === cat ? "text-white/80" : "text-[#8E406F]"}`}>
                {listingList.filter(l => l.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#FDF0F4] border border-[#F6DCE6] rounded-2xl shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
            <input id="listing-search" type="search" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
              placeholder="Search vendor or location..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all" />
          </div>
          <div className="relative">
            <select id="listing-status-filter" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
          </div>
          <div className="flex-1 hidden sm:block" />
          <button id="export-listings-btn" onClick={handleExport}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#8E406F] text-[#8E406F] text-sm font-medium hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all whitespace-nowrap">
            <Download size={14} />Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F6DCE6] bg-[#FAE8F0]">
                {["Vendor","Category","Location","Price","Rating","Listed","Status","Actions"].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6DCE6]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#aaa] text-sm">
                    <Store size={36} className="mx-auto mb-3 text-[#e8c4d8]" />
                    No listings match your filters.
                  </td>
                </tr>
              ) : paginated.map((listing, idx) => {
                const absIdx   = (currentPage - 1) * PAGE_SIZE + idx;
                const isActive = listing.status === "Active";
                return (
                  <tr key={listing.id} className="bg-white hover:bg-[#FDF0F4] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={listing.initials} index={absIdx} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1E293B] truncate">{listing.vendor}</p>
                          <div className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><CategoryPill category={listing.category} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#555] text-xs">{listing.location}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[#1E293B] font-medium text-xs">
                        <Tag size={11} className="text-[#8E406F]" />{listing.price}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StarRating rating={listing.rating} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#737373]">{listing.submittedDate}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={listing.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button aria-label={`View ${listing.vendor}`}
                          onClick={() => setViewTarget({ listing, index: absIdx })}
                          title="View Details"
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F] transition-all">
                          <Eye size={14} />
                        </button>
                        <button
                          aria-label={`Toggle status for ${listing.vendor}`}
                          onClick={() => handleToggleStatus(listing)}
                          title={isActive ? "Set Inactive" : "Set Active"}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${
                            isActive
                              ? "border-[#D1D5DB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] hover:border-[#9CA3AF]"
                              : "border-[#A3D9B8] text-[#1A7F4B] hover:bg-[#E6F4EE] hover:text-[#15653B] hover:border-[#6DC49A]"}`}>
                          {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#F6DCE6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white">
          <p className="text-xs text-[#737373]">
            Showing{" "}
            <span className="font-semibold text-[#1E293B]">{filtered.length === 0 ? 0 : (currentPage-1)*PAGE_SIZE+1}</span>
            {" "}-{" "}
            <span className="font-semibold text-[#1E293B]">{Math.min(currentPage*PAGE_SIZE, filtered.length)}</span>
            {" "}of{" "}
            <span className="font-semibold text-[#1E293B]">{filtered.length}</span> listings
          </p>
          <div className="flex items-center gap-1">
            <button id="prev-listing-page"
              onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_,i) => i+1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center h-7 w-7 rounded-lg text-xs font-medium transition-colors border ${
                  page===currentPage ? "bg-[#8E406F] text-white border-[#8E406F]"
                                     : "border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]"}`}>
                {page}
              </button>
            ))}
            <button id="next-listing-page"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}
              className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {viewTarget && (
        <ViewModal
          listing={viewTarget.listing}
          index={viewTarget.index}
          onClose={() => setViewTarget(null)}
          onToggleStatus={() => handleToggleStatus(viewTarget.listing)}
        />
      )}

      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message:"", type:"success" })} />
    </div>
  );
}
