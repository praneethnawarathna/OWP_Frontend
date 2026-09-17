import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Maximize2,
  Navigation,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';

const API_BASE = 'http://localhost:5131/api/vendor-profile';
const FILE_HOST = 'http://localhost:5131';

const CATEGORIES = [
  'Decorations',
  'Photography',
  'Music',
  'Catering',
];

const DEFAULT_DAYS = [
  { day: 'Monday', isClosed: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'Tuesday', isClosed: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'Wednesday', isClosed: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'Thursday', isClosed: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'Friday', isClosed: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'Saturday', isClosed: false, openTime: '10:00', closeTime: '17:00' },
  { day: 'Sunday', isClosed: true, openTime: '10:00', closeTime: '16:00' },
];

// Sri Lanka cities with postal codes and provinces
const SL_CITIES = [
  { city: 'Colombo', postalCode: '00100', province: 'Western' },
  { city: 'Sri Jayawardenepura Kotte', postalCode: '10100', province: 'Western' },
  { city: 'Dehiwala-Mount Lavinia', postalCode: '10350', province: 'Western' },
  { city: 'Moratuwa', postalCode: '10400', province: 'Western' },
  { city: 'Negombo', postalCode: '11500', province: 'Western' },
  { city: 'Kandy', postalCode: '20000', province: 'Central' },
  { city: 'Matale', postalCode: '21000', province: 'Central' },
  { city: 'Nuwara Eliya', postalCode: '22200', province: 'Central' },
  { city: 'Galle', postalCode: '80000', province: 'Southern' },
  { city: 'Matara', postalCode: '81000', province: 'Southern' },
  { city: 'Hambantota', postalCode: '82000', province: 'Southern' },
  { city: 'Jaffna', postalCode: '40000', province: 'Northern' },
  { city: 'Vavuniya', postalCode: '43000', province: 'Northern' },
  { city: 'Kilinochchi', postalCode: '44000', province: 'Northern' },
  { city: 'Trincomalee', postalCode: '31000', province: 'Eastern' },
  { city: 'Batticaloa', postalCode: '30000', province: 'Eastern' },
  { city: 'Ampara', postalCode: '32000', province: 'Eastern' },
  { city: 'Kurunegala', postalCode: '60000', province: 'North Western' },
  { city: 'Puttalam', postalCode: '61300', province: 'North Western' },
  { city: 'Anuradhapura', postalCode: '50000', province: 'North Central' },
  { city: 'Polonnaruwa', postalCode: '51000', province: 'North Central' },
  { city: 'Badulla', postalCode: '90000', province: 'Uva' },
  { city: 'Monaragala', postalCode: '91000', province: 'Uva' },
  { city: 'Ratnapura', postalCode: '70000', province: 'Sabaragamuwa' },
  { city: 'Kegalle', postalCode: '71000', province: 'Sabaragamuwa' },
  { city: 'Kalutara', postalCode: '12000', province: 'Western' },
  { city: 'Gampaha', postalCode: '11000', province: 'Western' },
];

const SL_PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
];

const DOCUMENT_TYPES = [
  'Business Registration (BR)',
  'Owner NIC / Passport',
  'Tax Identification / VAT',
  'Professional License / Certificate',
  'Public Liability Insurance',
];

export default function VendorProfilePage() {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Profile data
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    categories: [],
    tagline: '',
    description: '',
    ownerName: '',
    contactNumber: '',
    altPhoneNumber: '',
    email: '',
    websiteUrl: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka',
    serviceAreas: '',
    travelPolicy: '',
    yearsInBusiness: '',
    businessHours: DEFAULT_DAYS,
    socialLinks: {
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      pinterest: '',
      website: '',
    },
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Category multi-select dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseCategories = (catStr) => {
    if (!catStr) return [];
    return catStr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => CATEGORIES.includes(c) || c.length > 0);
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
    setHasUnsavedChanges(true);
  };

  const selectAllCategories = () => {
    setFormData((prev) => ({ ...prev, categories: [...CATEGORIES] }));
    setHasUnsavedChanges(true);
  };

  const clearCategories = () => {
    setFormData((prev) => ({ ...prev, categories: [] }));
    setHasUnsavedChanges(true);
  };

  // Modals & previews
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadGalleryOpen, setUploadGalleryOpen] = useState(false);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Edit Gallery Modal
  const [editingImage, setEditingImage] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);

  // Document Upload Modal
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Cover & Logo input refs
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Load Profile on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load vendor profile');
      const data = await res.json();
      setProfile(data);

      setFormData({
        businessName: data.businessName || '',
        categories: parseCategories(data.category),
        tagline: data.tagline || '',
        description: data.description || '',
        ownerName: data.ownerName || '',
        contactNumber: data.contactNumber || '',
        altPhoneNumber: data.altPhoneNumber || '',
        email: data.email || '',
        websiteUrl: data.websiteUrl || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || 'Sri Lanka',
        serviceAreas: data.serviceAreas || '',
        travelPolicy: data.travelPolicy || '',
        yearsInBusiness: data.yearsInBusiness ?? '',
        businessHours: data.businessHours?.length ? data.businessHours : DEFAULT_DAYS,
        socialLinks: {
          instagram: data.socialLinks?.instagram || '',
          facebook: data.socialLinks?.facebook || '',
          tiktok: data.socialLinks?.tiktok || '',
          youtube: data.socialLinks?.youtube || '',
          pinterest: data.socialLinks?.pinterest || '',
          website: data.socialLinks?.website || '',
        },
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Could not load profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  // Form Change Handler
  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSocialChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
    setHasUnsavedChanges(true);
  };

  const handleHoursChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.businessHours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, businessHours: updated };
    });
    setHasUnsavedChanges(true);
  };

  const applyWeekdayPreset = () => {
    setFormData((prev) => ({
      ...prev,
      businessHours: prev.businessHours.map((h, i) =>
        i < 5
          ? { ...h, isClosed: false, openTime: '09:00', closeTime: '18:00' }
          : h
      ),
    }));
    setHasUnsavedChanges(true);
  };

  // Save All Changes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const payload = {
        ...formData,
        category: formData.categories.join(', '),
        yearsInBusiness: formData.yearsInBusiness === '' ? null : Number(formData.yearsInBusiness),
      };

      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error updating profile');
      }

      const updated = await res.json();
      setProfile(updated);
      setHasUnsavedChanges(false);
      setStatusMessage({ type: 'success', text: 'Business profile saved successfully!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  // Discard / Reset
  const handleDiscardChanges = () => {
    if (!profile) return;
    setFormData({
      businessName: profile.businessName || '',
      categories: parseCategories(profile.category),
      tagline: profile.tagline || '',
      description: profile.description || '',
      ownerName: profile.ownerName || '',
      contactNumber: profile.contactNumber || '',
      altPhoneNumber: profile.altPhoneNumber || '',
      email: profile.email || '',
      websiteUrl: profile.websiteUrl || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      postalCode: profile.postalCode || '',
      country: profile.country || 'Sri Lanka',
      serviceAreas: profile.serviceAreas || '',
      travelPolicy: profile.travelPolicy || '',
      yearsInBusiness: profile.yearsInBusiness ?? '',
      businessHours: profile.businessHours?.length ? profile.businessHours : DEFAULT_DAYS,
      socialLinks: profile.socialLinks || {},
    });
    setHasUnsavedChanges(false);
    setStatusMessage({ type: 'info', text: 'Changes discarded.' });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  // Cover Image Upload / Remove
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);

    try {
      setStatusMessage({ type: 'info', text: 'Uploading cover image...' });
      const res = await fetch(`${API_BASE}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) throw new Error('Cover upload failed');
      const data = await res.json();
      setProfile((prev) => ({ ...prev, coverImageUrl: data.coverUrl }));
      setStatusMessage({ type: 'success', text: 'Cover image updated!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleRemoveCover = async () => {
    if (!window.confirm('Remove your cover image?')) return;
    try {
      const res = await fetch(`${API_BASE}/cover`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove cover');
      setProfile((prev) => ({ ...prev, coverImageUrl: null }));
      setStatusMessage({ type: 'success', text: 'Cover image removed.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Logo Upload / Remove
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);

    try {
      setStatusMessage({ type: 'info', text: 'Uploading logo...' });
      const res = await fetch(`${API_BASE}/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) throw new Error('Logo upload failed');
      const data = await res.json();
      setProfile((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      setStatusMessage({ type: 'success', text: 'Logo updated successfully!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Remove your business logo?')) return;
    try {
      const res = await fetch(`${API_BASE}/logo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove logo');
      setProfile((prev) => ({ ...prev, logoUrl: null }));
      setStatusMessage({ type: 'success', text: 'Logo removed.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Gallery Management
  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if (!galleryFile) return;
    setUploadingGallery(true);
    const body = new FormData();
    body.append('file', galleryFile);
    if (galleryCaption) body.append('caption', galleryCaption);
    if (galleryCategory) body.append('category', galleryCategory);

    try {
      const res = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) throw new Error('Failed to upload image');
      const newImg = await res.json();
      setProfile((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), newImg],
      }));
      setUploadGalleryOpen(false);
      setGalleryFile(null);
      setGalleryCaption('');
      setGalleryCategory('');
      setStatusMessage({ type: 'success', text: 'Photo added to your gallery!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingGallery(false);
    }
  };

  const openEditGalleryModal = (img) => {
    setEditingImage(img);
    setEditCaption(img.caption || '');
    setEditCategory(img.category || '');
    setEditFeatured(img.isFeatured || false);
  };

  const handleUpdateGalleryImage = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    setUpdatingImage(true);

    try {
      const res = await fetch(`${API_BASE}/gallery/${editingImage.imageId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: editCaption,
          category: editCategory,
          isFeatured: editFeatured,
        }),
      });
      if (!res.ok) throw new Error('Failed to update image');
      const updated = await res.json();
      setProfile((prev) => ({
        ...prev,
        galleryImages: prev.galleryImages.map((g) =>
          g.imageId === updated.imageId ? updated : g
        ),
      }));
      setEditingImage(null);
      setStatusMessage({ type: 'success', text: 'Image details updated.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingImage(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      const res = await fetch(`${API_BASE}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete image');
      setProfile((prev) => ({
        ...prev,
        galleryImages: prev.galleryImages.filter((g) => g.imageId !== imageId),
      }));
      setStatusMessage({ type: 'success', text: 'Photo deleted.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Verification Document Management
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) return;
    setUploadingDoc(true);
    const body = new FormData();
    body.append('file', docFile);
    body.append('documentName', docName || docFile.name);
    body.append('documentType', docType);

    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) throw new Error('Failed to upload document');
      const newDoc = await res.json();
      setProfile((prev) => ({
        ...prev,
        documents: [newDoc, ...(prev.documents || [])],
      }));
      setUploadDocOpen(false);
      setDocFile(null);
      setDocName('');
      setStatusMessage({ type: 'success', text: 'Document uploaded for verification!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this verification document?')) return;
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete document');
      setProfile((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.documentId !== docId),
      }));
      setStatusMessage({ type: 'success', text: 'Document removed.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#8E406F]" />
        <p className="text-sm font-medium text-[#737373]">Loading Business Profile...</p>
      </div>
    );
  }

  const coverUrl = profile?.coverImageUrl ? `${FILE_HOST}${profile.coverImageUrl}` : null;
  const logoUrl = profile?.logoUrl ? `${FILE_HOST}${profile.logoUrl}` : null;
  const verificationStatus = profile?.verificationStatus || 'Pending';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-24">

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverUpload}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoUpload}
        accept=".jpg,.jpeg,.png,.webp,.svg"
        className="hidden"
      />

      {/* Toast / Notification Banner */}
      {statusMessage.text && (
        <div
          role="status"
          className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${statusMessage.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : statusMessage.type === 'info'
                ? 'bg-sky-50 border border-sky-200 text-sky-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── 1. Profile Overview Hero Banner ── */}
      <section className="relative overflow-hidden rounded-3xl border border-[#F1E5EC] bg-white shadow-sm">
        {/* Cover Photo Area */}
        <div className="relative h-64 w-full bg-gradient-to-r from-[#FDF0F4] via-[#F8E7F0] to-[#EBD2DF] overflow-hidden group">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Business Cover"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-[#8E406F]/60">
              <ImageIcon size={44} strokeWidth={1.5} className="mb-2 opacity-60" />
              <p className="text-xs font-semibold tracking-wide uppercase">Add a Cover Image</p>
              <p className="text-[11px] text-[#999]">Recommended: 1400 × 400 px</p>
            </div>
          )}

          {/* Cover Action Overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#8E406F] text-xs font-semibold shadow hover:bg-white transition-all active:scale-95"
            >
              <Camera size={14} />
              <span>{coverUrl ? 'Change Cover' : 'Upload Cover'}</span>
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/80 backdrop-blur-md text-white text-xs font-medium hover:bg-rose-600 transition-all shadow"
                title="Remove cover"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Details & Floating Logo */}
        <div className="px-8 pb-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Logo Badge */}
            <div className="flex items-end gap-5">
              <div className="relative group">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-white ring-2 ring-[#F1E5EC] overflow-hidden flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={formData.businessName}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-[#FDF0F4] flex flex-col items-center justify-center text-[#8E406F]">
                      <Store size={36} strokeWidth={1.75} />
                    </div>
                  )}
                </div>

                {/* Logo Change Overlay Button */}
                <div className="absolute inset-1.5 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="p-2 rounded-lg bg-white text-[#8E406F] hover:bg-[#FDF0F4] transition shadow"
                    title="Change Logo"
                  >
                    <Camera size={16} />
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition shadow"
                      title="Remove Logo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-3">
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-[#1E293B]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {formData.businessName || 'Your Business Name'}
                  </h1>
                  {/* Profile Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verificationStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : verificationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                  >
                    <ShieldCheck size={13} />
                    {verificationStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#737373]">
                  {formData.categories.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {formData.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FDF0F4] text-[#8E406F] font-semibold text-xs border border-[#F1E5EC]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#999] italic">No categories selected</span>
                  )}
                  {formData.city && <span>• {formData.city}</span>}
                  {formData.yearsInBusiness && (
                    <span>• {formData.yearsInBusiness} Yrs in Business</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8DDE4] bg-white text-sm font-medium text-[#555] hover:bg-slate-50 transition active:scale-95"
                >
                  <RotateCcw size={15} />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Form Grid: Basic Information & Contact ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Basic Business Information */}
        <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F1E5EC] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Basic Business Information
              </h2>
              <p className="text-xs text-[#737373]">Core details visible on your public storefront.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleFieldChange('businessName', e.target.value)}
                placeholder="e.g. Lumina Wedding Photography"
                className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={categoryDropdownRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider">
                    Categories <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#8E406F] font-medium">
                    {formData.categories.length} of {CATEGORIES.length} selected
                  </span>
                </div>

                {/* Multi-Select Trigger Button */}
                <div
                  tabIndex={0}
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCategoryDropdownOpen((prev) => !prev);
                    }
                  }}
                  className={`w-full min-h-[42px] cursor-pointer rounded-xl border px-3 py-1.5 text-sm transition flex items-center justify-between gap-2 ${categoryDropdownOpen
                      ? 'border-[#8E406F] bg-white ring-2 ring-[#8E406F]/15'
                      : 'border-[#E8DDE4] bg-[#F8FAFC]/50 hover:bg-white'
                    }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 py-0.5">
                    {formData.categories.length > 0 ? (
                      formData.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FDF0F4] text-[#8E406F] text-xs font-semibold border border-[#F1E5EC]"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(cat);
                          }}
                        >
                          {cat}
                          <span className="text-[#8E406F]/70 hover:text-[#8E406F] ml-0.5">&times;</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#999]">Select categories (e.g. Photography, Catering)...</span>
                    )}
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-[#8E406F] shrink-0 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </div>

                {/* Dropdown Menu Panel */}
                {categoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border border-[#F1E5EC] bg-white p-3 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F1E5EC] text-xs text-[#737373]">
                      <span className="font-semibold text-[#1E293B]">Select categories:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllCategories}
                          className="text-[11px] font-semibold text-[#8E406F] hover:underline"
                        >
                          Select All
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={clearCategories}
                          className="text-[11px] font-semibold text-[#999] hover:text-rose-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {CATEGORIES.map((cat) => {
                        const isSelected = formData.categories.includes(cat);
                        return (
                          <div
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold transition select-none ${isSelected
                                ? 'bg-[#FDF0F4] text-[#8E406F]'
                                : 'text-[#333] hover:bg-[#F8FAFC]'
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`h-4 w-4 rounded-md border flex items-center justify-center transition ${isSelected
                                    ? 'bg-[#8E406F] border-[#8E406F] text-white'
                                    : 'border-[#CCC] bg-white'
                                  }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </div>
                              <span>{cat}</span>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#8E406F]">
                                Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#F1E5EC] flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="px-3 py-1 rounded-lg bg-[#8E406F] text-white text-xs font-semibold hover:bg-[#73325A] transition"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                  placeholder="e.g. Michael Perera"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="e.g. Capturing timeless wedding moments"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Years in Business
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.yearsInBusiness}
                  onChange={(e) => handleFieldChange('yearsInBusiness', e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                About Business & Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Share your business story, wedding style, awards, and what makes your services unique..."
                className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
              />
            </div>
          </div>
        </section>

        {/* Contact Information & Location */}
        <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F1E5EC] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Contact & Location
              </h2>
              <p className="text-xs text-[#737373]">How clients can connect with and find your studio.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Primary Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Secondary / Mobile
                </label>
                <input
                  type="tel"
                  value={formData.altPhoneNumber}
                  onChange={(e) => handleFieldChange('altPhoneNumber', e.target.value)}
                  placeholder="e.g. +94 11 234 5678"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Business Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="e.g. hello@luminaphoto.com"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleFieldChange('websiteUrl', e.target.value)}
                  placeholder="https://www.luminaphoto.com"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                Studio / Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="e.g. 142 Galle Road, Bambalapitiya"
                className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* City Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1">
                  City
                </label>
                <div className="relative">
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      const selectedCity = SL_CITIES.find((c) => c.city === e.target.value);
                      handleFieldChange('city', e.target.value);
                      if (selectedCity) {
                        handleFieldChange('postalCode', selectedCity.postalCode);
                        handleFieldChange('state', selectedCity.province);
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3 py-2 text-sm text-[#1E293B] focus:border-[#8E406F] focus:outline-none pr-8"
                  >
                    <option value="">Select city…</option>
                    {SL_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E406F]" />
                </div>
              </div>

              {/* Province / State Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1">
                  Province
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3 py-2 text-sm text-[#1E293B] focus:border-[#8E406F] focus:outline-none pr-8"
                  >
                    <option value="">Select province…</option>
                    {SL_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E406F]" />
                </div>
              </div>

              {/* Postal Code (auto-filled) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                  placeholder="Auto-filled"
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3 py-2 text-sm text-[#1E293B] focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              {/* Country – Fixed to Sri Lanka */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1">
                  Country
                </label>
                <div className="w-full rounded-xl border border-[#E8DDE4] bg-[#F1F5F9] px-3 py-2 text-sm text-[#475569] flex items-center gap-1.5 cursor-not-allowed select-none">
                  <span>🇱🇰</span>
                  <span className="font-medium">Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── 3. Service Areas & Business Hours ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Service Areas & Travel */}
        <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F1E5EC] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
              <Navigation size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Service Areas & Travel
              </h2>
              <p className="text-xs text-[#737373]">Define where you operate and destination policies.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                Service Areas & Cities Served
              </label>
              <input
                type="text"
                value={formData.serviceAreas}
                onChange={(e) => handleFieldChange('serviceAreas', e.target.value)}
                placeholder="e.g. Colombo, Kandy, Galle, Negombo, Bentota"
                className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
              />
              <p className="text-[11px] text-[#999] mt-1">Separate multiple cities/districts with commas.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                Travel Policy & Radius
              </label>
              <textarea
                rows={3}
                value={formData.travelPolicy}
                onChange={(e) => handleFieldChange('travelPolicy', e.target.value)}
                placeholder="e.g. Complimentary travel within 40 km of Colombo. Island-wide & destination weddings available with lodging/fuel covered by client."
                className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/15 transition"
              />
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1E5EC] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Business Hours
                </h2>
                <p className="text-xs text-[#737373]">Set standard times when couples can visit or consult.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={applyWeekdayPreset}
              className="text-[11px] font-semibold text-[#8E406F] hover:underline"
            >
              Preset Mon-Fri 9-6
            </button>
          </div>

          <div className="space-y-2">
            {formData.businessHours.map((item, index) => (
              <div
                key={item.day}
                className="flex items-center justify-between gap-3 p-2 rounded-xl border border-[#F1E5EC] bg-[#F8FAFC]/50 text-xs text-[#333]"
              >
                <span className="w-24 font-semibold text-[#1E293B]">{item.day}</span>
                <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isClosed}
                    onChange={(e) => handleHoursChange(index, 'isClosed', e.target.checked)}
                    className="rounded border-[#E8DDE4] text-[#8E406F] focus:ring-[#8E406F]"
                  />
                  <span>Closed</span>
                </label>

                {!item.isClosed ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={item.openTime}
                      onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                      className="rounded-lg border border-[#E8DDE4] bg-white px-2 py-1 text-xs focus:outline-none focus:border-[#8E406F]"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={item.closeTime}
                      onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                      className="rounded-lg border border-[#E8DDE4] bg-white px-2 py-1 text-xs focus:outline-none focus:border-[#8E406F]"
                    />
                  </div>
                ) : (
                  <span className="text-[#999] italic">Closed / By Appt</span>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── 4. Social Media Links ── */}
      <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[#F1E5EC] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Social Media & Web Links
            </h2>
            <p className="text-xs text-[#737373]">Link your portfolios so couples can explore your latest work.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
            { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
            { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourprofile' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
            { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourboards' },
            { key: 'website', label: 'Blog / Portfolio', placeholder: 'https://portfolio.yourbrand.com' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider">
                {label}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={formData.socialLinks[key] || ''}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-[#E8DDE4] bg-[#F8FAFC]/50 px-3 py-2 text-xs text-[#1E293B] focus:border-[#8E406F] focus:bg-white focus:outline-none transition"
                />
                {formData.socialLinks[key] && (
                  <a
                    href={formData.socialLinks[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#FDF0F4] text-[#8E406F] hover:bg-[#8E406F] hover:text-white transition"
                    title="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Portfolio & Gallery Management ── */}
      <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1E5EC] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Portfolio & Gallery Management
              </h2>
              <p className="text-xs text-[#737373]">
                Upload, edit captions, and showcase your finest wedding moments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUploadGalleryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-xs font-semibold shadow transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Photos</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {profile?.galleryImages?.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#F1E5EC] bg-[#FDF0F4]/30 p-10 text-center">
            <ImageIcon size={38} className="mx-auto text-[#8E406F]/50 mb-2" />
            <p className="text-sm font-semibold text-[#1E293B]">No gallery photos uploaded yet</p>
            <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
              Showcase high-resolution wedding photos to attract more couples.
            </p>
            <button
              type="button"
              onClick={() => setUploadGalleryOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F] text-xs font-semibold shadow-sm hover:bg-[#FDF0F4] transition"
            >
              <Upload size={14} />
              <span>Upload First Photo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile?.galleryImages?.map((img) => (
              <div
                key={img.imageId}
                className="group relative rounded-2xl overflow-hidden border border-[#F1E5EC] bg-slate-50 shadow-sm aspect-square"
              >
                <img
                  src={`${FILE_HOST}${img.imageUrl}`}
                  alt={img.caption || 'Gallery photo'}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Featured Badge */}
                {img.isFeatured && (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8E406F] text-white text-[10px] font-bold shadow">
                    <Sparkles size={11} />
                    Featured
                  </span>
                )}

                {/* Category Tag */}
                {img.category && (
                  <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] backdrop-blur-sm">
                    {img.category}
                  </span>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(`${FILE_HOST}${img.imageUrl}`)}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition"
                      title="Preview"
                    >
                      <Maximize2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditGalleryModal(img)}
                      className="p-1.5 rounded-lg bg-white/90 text-[#8E406F] hover:bg-white transition"
                      title="Edit Caption"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img.imageId)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {img.caption && (
                    <p className="text-[11px] text-white font-medium line-clamp-2 drop-shadow">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 6. Verification Documents ── */}
      <section className="rounded-3xl border border-[#F1E5EC] bg-white p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1E5EC] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]">
              <FileCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Business Verification Documents
              </h2>
              <p className="text-xs text-[#737373]">
                Upload BR, tax, or ID documents to obtain the Verified Vendor badge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUploadDocOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F] hover:bg-[#FDF0F4] text-xs font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto"
          >
            <Upload size={14} />
            <span>Upload Document</span>
          </button>
        </div>

        {profile?.documents?.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#F1E5EC] bg-[#FDF0F4]/30 p-8 text-center">
            <FileText size={36} className="mx-auto text-[#8E406F]/50 mb-2" />
            <p className="text-sm font-semibold text-[#1E293B]">No verification documents submitted</p>
            <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
              Uploading official documents builds trust and fast-tracks approval by our admin team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile?.documents?.map((doc) => (
              <div
                key={doc.documentId}
                className="flex items-center justify-between p-4 rounded-2xl border border-[#F1E5EC] bg-[#F8FAFC]/60 hover:bg-[#FDF0F4]/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E8DDE4] text-[#8E406F]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B] truncate">{doc.documentName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                      <span>{doc.documentType}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${doc.status === 'Verified'
                            ? 'text-emerald-700'
                            : doc.status === 'Rejected'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${FILE_HOST}${doc.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-[#737373] hover:text-[#8E406F] hover:bg-white transition"
                    title="View Document"
                  >
                    <Eye size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.documentId)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Sticky Bottom Bar for Unsaved Changes ── */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-6 px-6 py-3.5 rounded-2xl bg-[#1E293B] text-white shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-4 w-[90%] max-w-2xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>You have unsaved changes</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-xs font-semibold shadow transition"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Upload Gallery Image ── */}
      {uploadGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#F1E5EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1E5EC]">
              <h3 className="font-bold text-base text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Add Photo to Gallery
              </h3>
              <button
                type="button"
                onClick={() => setUploadGalleryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGalleryImage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Select Photo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FDF0F4] file:text-[#8E406F] hover:file:bg-[#F8E7F0] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Caption / Title
                </label>
                <input
                  type="text"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  placeholder="e.g. Sunset Bridal Portrait"
                  className="w-full rounded-xl border border-[#E8DDE4] px-3.5 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Category / Tag
                </label>
                <input
                  type="text"
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  placeholder="e.g. Ceremony, Decor, Portraits"
                  className="w-full rounded-xl border border-[#E8DDE4] px-3.5 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1E5EC]">
                <button
                  type="button"
                  onClick={() => setUploadGalleryOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DDE4] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingGallery || !galleryFile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {uploadingGallery ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>Upload Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Gallery Image ── */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#F1E5EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1E5EC]">
              <h3 className="font-bold text-base text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Edit Photo Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateGalleryImage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Caption
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="e.g. Traditional Poruwa Ceremony"
                  className="w-full rounded-xl border border-[#E8DDE4] px-3.5 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Category / Tag
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g. Poruwa, Stage, Reception"
                  className="w-full rounded-xl border border-[#E8DDE4] px-3.5 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="rounded border-[#E8DDE4] text-[#8E406F] focus:ring-[#8E406F]"
                />
                <span className="text-xs font-semibold text-slate-700">Set as Featured photo</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1E5EC]">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8DDE4] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingImage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {updatingImage ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Upload Document ── */}
      {uploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#F1E5EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1E5EC]">
              <h3 className="font-bold text-base text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Upload Verification Document
              </h3>
              <button
                type="button"
                onClick={() => setUploadDocOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Document Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-[#E8DDE4] px-3 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Business Registration Certificate 2024"
                  className="w-full rounded-xl border border-[#E8DDE4] px-3.5 py-2 text-sm focus:border-[#8E406F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Choose File (PDF, PNG, JPG) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FDF0F4] file:text-[#8E406F] hover:file:bg-[#F8E7F0] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1E5EC]">
                <button
                  type="button"
                  onClick={() => setUploadDocOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DDE4] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !docFile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8E406F] hover:bg-[#73325A] text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {uploadingDoc ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Lightbox / Image Preview ── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
