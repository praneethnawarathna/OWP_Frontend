// ============================================================
// VendorListingsPage.jsx
// Feature: Vendor Portal → "My Listings"
// Replaces the old "Business Services" page (same route: vendor-services).
// Pure local-state CRUD against mock data — backend wiring is a
// separate follow-up task.
// ============================================================

import { useState, useMemo, useId, useEffect } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  X,
  Tag,
  DollarSign,
  Layers,
  Eye,
  MessageSquare,
  Package,
  Save,
  AlertTriangle,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import Badge from '../components/common/Badge';

export const LISTING_CATEGORIES = [
  'Hotel / Venue',
  'Photography',
  'Decorations',
  'Catering',
  'Music',
];

export const LISTING_STATUSES = ['Active', 'Draft'];

const API_BASE = 'http://localhost:5131/api/vendor-content';

// ─── helpers ────────────────────────────────────────────────

function formatPrice(price) {
  if (price === null || price === undefined) return 'Price on request';
  return `Rs. ${Number(price).toLocaleString('en-LK')}`;
}

export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  return `http://localhost:5131${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Map category name → Badge variant (falls back to 'default') */
function categoryVariant(cat) {
  const map = {
    'Hotel / Venue':    'venue',
    Hotel:              'venue',
    Venue:              'venue',
    Photography:        'photography',
    Videography:        'photography',
    Decorations:        'stable',
    Catering:           'catering',
    Music:              'active',
    'Flowers & Floral': 'new',
  };
  return map[cat] ?? 'default';
}

// ─── small atoms ────────────────────────────────────────────

function InputField({ label, id, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#444]">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-[#E8DDE4] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#F1E5EC] bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FDF0F4]">
        <Icon size={17} className="text-[#8E406F]" aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-[#1E293B]">{value}</p>
        <p className="text-xs text-[#737373]">{label}</p>
        {sub && <p className="text-[10px] text-[#aaa] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Listing Card (grid view) ────────────────────────────────

function ListingCard({ listing, onEdit, onDelete }) {
  const isActive = listing.status === 'Active';
  const coverUrl = resolveImageUrl(listing.coverImageUrl || listing.images?.[0]?.imageUrl);

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-[#F1E5EC] bg-white overflow-hidden shadow-sm transition hover:shadow-md hover:border-[#e8c4d8]"
      aria-label={`Listing: ${listing.title}`}
    >
      {/* Cover Image Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-[#F1E5EC]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
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
          style={{ display: coverUrl ? 'none' : 'flex' }}
          className="h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDF0F4] to-slate-100 text-[#8E406F]/40"
        >
          <ImageIcon size={32} className="mb-1 text-[#8E406F]/40" />
          <span className="text-[11px] font-medium text-[#737373]/60">{listing.category}</span>
        </div>

        {/* Status Badge overlay on image */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-xs shadow-xs border ${
            isActive
              ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200'
              : 'bg-amber-50/90 text-amber-800 border-amber-200'
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {listing.status}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Title & Category */}
        <div className="mb-2">
          <div className="mb-1.5">
            <Badge variant={categoryVariant(listing.category)} size="xs">
              <Tag size={10} />
              {listing.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-[#1E293B] text-sm leading-snug line-clamp-2">
            {listing.title}
          </h3>
        </div>

        {/* Price */}
        <p className={`mb-2 text-sm font-semibold ${listing.price ? 'text-[#8E406F]' : 'text-[#999] italic'}`}>
          {formatPrice(listing.price)}
        </p>

        {/* Description */}
        <p className="flex-1 text-xs text-[#737373] leading-relaxed line-clamp-3 mb-4">
          {listing.description || 'No description provided.'}
        </p>

        {/* Placeholder stats */}
        <div className="flex items-center gap-3 text-[11px] text-[#aaa] mb-4">
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {listing.views ?? '—'} views
            <span className="ml-0.5 text-[#ccc] text-[9px]">[TODO]</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {listing.inquiries ?? '—'} inquiries
            <span className="ml-0.5 text-[#ccc] text-[9px]">[TODO]</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            id={`edit-listing-${listing.id}`}
            onClick={() => onEdit(listing)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8DDE4] py-1.5 text-xs font-semibold text-[#8E406F] transition hover:bg-[#FDF0F4] hover:border-[#e8c4d8]"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            id={`delete-listing-${listing.id}`}
            onClick={() => onDelete(listing)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-100 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Listing Row (list view) ─────────────────────────────────

function ListingRow({ listing, onEdit, onDelete }) {
  const isActive = listing.status === 'Active';
  const coverUrl = resolveImageUrl(listing.coverImageUrl || listing.images?.[0]?.imageUrl);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#F1E5EC] bg-white p-3 sm:px-4 shadow-sm transition hover:border-[#e8c4d8]">
      {/* Thumbnail */}
      <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-[#E8DDE4] relative flex items-center justify-center">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          style={{ display: coverUrl ? 'none' : 'flex' }}
          className="h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDF0F4] to-slate-100 text-[#8E406F]/40"
        >
          <ImageIcon size={18} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#1E293B] truncate">{listing.title}</span>
          <Badge variant={categoryVariant(listing.category)} size="xs">
            {listing.category}
          </Badge>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {listing.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[#737373] truncate">{listing.description}</p>
      </div>
      <div className="hidden sm:block shrink-0 text-sm font-semibold text-[#8E406F] min-w-[110px] text-right">
        {formatPrice(listing.price)}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onEdit(listing)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E8DDE4] px-2.5 py-1.5 text-xs font-semibold text-[#8E406F] transition hover:bg-[#FDF0F4]"
        >
          <Pencil size={11} /> Edit
        </button>
        <button
          onClick={() => onDelete(listing)}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ────────────────────────────────────────

const EMPTY_FORM = {
  title: '',
  category: LISTING_CATEGORIES[0],
  price: '',
  description: '',
  status: 'Active',
};

function ListingModal({ listing, onClose, onSave }) {
  const [form, setForm] = useState(
    listing
      ? {
          title: listing.title,
          category: listing.category,
          price: listing.price ?? '',
          description: listing.description,
          status: listing.status,
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const uid = useId();

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      ...(listing ?? {}),
      ...form,
      price: form.price === '' ? null : Number(form.price),
      id: listing?.id ?? `lst-${Date.now()}`,
      createdAt: listing?.createdAt ?? new Date().toISOString().slice(0, 10),
      views: listing?.views ?? 0,
      inquiries: listing?.inquiries ?? 0,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-modal-title`}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#F1E5EC] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1E5EC] px-6 py-4">
          <h2 id={`${uid}-modal-title`} className="font-display text-base font-bold text-[#1E293B]">
            {listing ? 'Edit Listing' : 'Add New Listing'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#999] transition hover:bg-[#FDF0F4] hover:text-[#8E406F]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
          {/* Title */}
          <InputField label="Listing title" id={`${uid}-title`} required>
            <input
              id={`${uid}-title`}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Full-Day Wedding Photography"
              className={`${inputCls} ${errors.title ? 'border-rose-400 bg-rose-50/30' : ''}`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-0.5">{errors.title}</p>}
          </InputField>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Category" id={`${uid}-category`}>
              <div className="relative">
                <select
                  id={`${uid}-category`}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`${inputCls} pr-8 appearance-none`}
                >
                  {LISTING_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
              </div>
            </InputField>
            <InputField label="Status" id={`${uid}-status`}>
              <div className="relative">
                <select
                  id={`${uid}-status`}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className={`${inputCls} pr-8 appearance-none`}
                >
                  {LISTING_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
              </div>
            </InputField>
          </div>

          {/* Price */}
          <InputField label="Price (Rs.) — leave blank for 'Price on request'" id={`${uid}-price`}>
            <div className="relative">
              <DollarSign size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                id={`${uid}-price`}
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="Optional"
                className={`${inputCls} pl-8`}
              />
            </div>
          </InputField>

          {/* Description */}
          <InputField label="Short description" id={`${uid}-desc`}>
            <textarea
              id={`${uid}-desc`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Describe what's included, duration, etc."
              className={`${inputCls} resize-none`}
            />
          </InputField>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E8DDE4] px-4 py-2 text-sm font-semibold text-[#555] transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id={listing ? 'update-listing-btn' : 'save-listing-btn'}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8E406F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#73325A] active:scale-95"
            >
              <Save size={14} />
              {listing ? 'Save Changes' : 'Add Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ──────────────────────────────

function DeleteDialog({ listing, onCancel, onConfirm }) {
  const uid = useId();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${uid}-confirm-title`}
      aria-describedby={`${uid}-confirm-desc`}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 mb-4">
          <AlertTriangle size={20} className="text-rose-500" />
        </div>
        <h2 id={`${uid}-confirm-title`} className="text-base font-bold text-[#1E293B] mb-1">
          Delete this listing?
        </h2>
        <p id={`${uid}-confirm-desc`} className="text-sm text-[#737373] mb-5">
          <span className="font-medium text-[#333]">"{listing.title}"</span> will be permanently
          removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#E8DDE4] py-2 text-sm font-semibold text-[#555] transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────

function EmptyState({ filtered, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E8DDE4] bg-white py-16 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF0F4] mb-4">
        <Package size={24} className="text-[#8E406F]" />
      </div>
      <h3 className="font-display text-base font-bold text-[#1E293B] mb-1">
        {filtered ? 'No listings match your search' : 'No listings yet'}
      </h3>
      <p className="text-sm text-[#737373] max-w-xs mb-5">
        {filtered
          ? 'Try adjusting the search term or category filter.'
          : 'Create your first listing so couples can discover your services.'}
      </p>
      {!filtered && (
        <button
          id="empty-add-listing-btn"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#8E406F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#73325A]"
        >
          <Plus size={15} />
          Add Your First Listing
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function VendorListingsPage({ onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [modalListing, setModalListing] = useState(undefined); // undefined = closed; null = new; object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchListings = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/services`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to load listings');
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Sync latest listings from API on mount and whenever window regains focus
  useEffect(() => {
    fetchListings();
    const handleFocus = () => fetchListings();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleOpenAdd = () => {
    if (onNavigate) {
      window.history.pushState({}, '', '/vendor-listing-editor');
      onNavigate('vendor-listing-editor');
    } else {
      setModalListing(null);
    }
  };

  const handleOpenEdit = (listing) => {
    const id = listing.serviceId || listing.id;
    if (onNavigate) {
      window.history.pushState({}, '', `/vendor-listing-editor?id=${id}`);
      onNavigate('vendor-listing-editor');
    } else {
      setModalListing(listing);
    }
  };

  // ── derived stats ──────────────────────────────────────────
  const activeCount = listings.filter((l) => l.status === 'Active').length;
  const categoriesInUse = useMemo(
    () => [...new Set(listings.map((l) => l.category))].length,
    [listings]
  );
  const totalViews = listings.reduce((acc, l) => acc + (l.views ?? 0), 0);
  const totalInquiries = listings.reduce((acc, l) => acc + (l.inquiries ?? 0), 0);

  // ── filtered listings ──────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return listings.filter((l) => {
      const matchSearch = !q || (l.title || '').toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || l.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [listings, search, categoryFilter]);

  // ── CRUD handlers ──────────────────────────────────────────
  const handleSave = async (saved) => {
    const token = localStorage.getItem('token');
    const isExisting = Boolean(saved.serviceId || (saved.id && !String(saved.id).startsWith('lst-')));
    const targetId = saved.serviceId || saved.id;
    const method = isExisting ? 'PUT' : 'POST';
    const url = isExisting ? `${API_BASE}/services/${targetId}` : `${API_BASE}/services`;

    const payload = {
      title: saved.title?.trim() || '',
      category: saved.category,
      price: saved.price === '' || saved.price === null ? null : Number(saved.price),
      priceOnRequest: saved.price === '' || saved.price === null,
      description: saved.description?.trim() || '',
      fullDescription: saved.fullDescription?.trim() || saved.description?.trim() || '',
      status: saved.status || 'Active',
      details: saved.details || null,
      spaces: saved.spaces || null
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save listing');
      }
      await fetchListings();
      setModalListing(undefined);
    } catch (err) {
      alert(`Error saving listing: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('token');
    const targetId = deleteTarget.serviceId || deleteTarget.id;
    try {
      const res = await fetch(`${API_BASE}/services/${targetId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete listing');
      }
      setListings((prev) => prev.filter((l) => (l.serviceId || l.id) !== targetId));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Error deleting listing: ${err.message}`);
    }
  };

  // ── all category pills ─────────────────────────────────────
  const usedCategories = useMemo(
    () => ['All', ...LISTING_CATEGORIES.filter((c) => listings.some((l) => l.category === c))],
    [listings]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF0F4]">
            <Layers size={20} className="text-[#8E406F]" aria-hidden="true" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Listings
            </h1>
            <p className="text-sm text-[#737373]">
              Manage the services and packages you offer to couples.
            </p>
          </div>
        </div>
        <button
          id="add-listing-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8E406F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
        >
          <Plus size={16} />
          Add Listing
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          label="Total listings"
          value={listings.length}
        />
        <StatCard
          icon={Tag}
          label="Active listings"
          value={activeCount}
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={totalViews.toLocaleString()}
          sub="placeholder [TODO]"
        />
        <StatCard
          icon={MessageSquare}
          label="Total inquiries"
          value={totalInquiries.toLocaleString()}
          sub="placeholder [TODO]"
        />
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
            aria-hidden="true"
          />
          <input
            id="listings-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full rounded-xl border border-[#E8DDE4] bg-white pl-9 pr-4 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl border border-[#E8DDE4] bg-white overflow-hidden shrink-0">
          <button
            id="view-grid-btn"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-[#FDF0F4] text-[#8E406F]'
                : 'text-[#999] hover:text-[#8E406F] hover:bg-[#FDF0F4]/50'
            }`}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            id="view-list-btn"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition border-l border-[#E8DDE4] ${
              viewMode === 'list'
                ? 'bg-[#FDF0F4] text-[#8E406F]'
                : 'text-[#999] hover:text-[#8E406F] hover:bg-[#FDF0F4]/50'
            }`}
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {usedCategories.map((cat) => (
          <button
            key={cat}
            id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setCategoryFilter(cat)}
            aria-pressed={categoryFilter === cat}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              categoryFilter === cat
                ? 'border-[#8E406F] bg-[#8E406F] text-white shadow-sm'
                : 'border-[#E8DDE4] bg-white text-[#555] hover:border-[#e8c4d8] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className={`ml-1 opacity-70 ${categoryFilter === cat ? 'text-white/80' : ''}`}>
                ({listings.filter((l) => l.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      {(search || categoryFilter !== 'All') && (
        <p className="text-xs text-[#999]">
          Showing <span className="font-semibold text-[#555]">{filtered.length}</span> of{' '}
          <span className="font-semibold text-[#555]">{listings.length}</span> listings
          {categoryFilter !== 'All' && (
            <> in <span className="font-semibold text-[#8E406F]">{categoryFilter}</span></>
          )}
          {search && (
            <> matching "<span className="font-semibold text-[#333]">{search}</span>"</>
          )}
        </p>
      )}

      {/* ── Main Content: Grid / List / Empty ── */}
      {filtered.length === 0 ? (
        <EmptyState filtered={search !== '' || categoryFilter !== 'All'} onAdd={handleOpenAdd} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.serviceId || listing.id}
              listing={listing}
              onEdit={handleOpenEdit}
              onDelete={(l) => setDeleteTarget(l)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((listing) => (
            <ListingRow
              key={listing.serviceId || listing.id}
              listing={listing}
              onEdit={handleOpenEdit}
              onDelete={(l) => setDeleteTarget(l)}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalListing !== undefined && (
        <ListingModal
          listing={modalListing}
          onClose={() => setModalListing(undefined)}
          onSave={handleSave}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <DeleteDialog
          listing={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
