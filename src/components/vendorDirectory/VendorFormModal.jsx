import { useState } from 'react';
import { X, Image, Trash2, AlertCircle } from 'lucide-react';
import { VENDOR_CATEGORIES } from '../../mock/vendorDirectoryData';
import VendorDocumentsSection from './VendorDocumentsSection';

const MAX_DESCRIPTION = 600;

const emptyVendor = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  category: 'Photography',
  status: 'Pending',
  businessAddress: '',
  taxId: '',
  yearsInBusiness: '',
  description: '',
};

// Sri Lankan mobile format: +94 7XXXXXXXX (9 digits after country code, starts with 7)
const PHONE_PATTERN = /^\+94\s?7\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_DEFINITIONS = [
  { key: 'businessName', label: 'Business Name', isIdentity: true, getOld: (v) => v.businessName },
  { key: 'ownerName', label: 'Owner Name', isIdentity: true, getOld: (v) => v.ownerName },
  { key: 'category', label: 'Category', isIdentity: true, getOld: (v) => v.category },
  { key: 'email', label: 'Email', isIdentity: true, getOld: (v) => v.email },
  { key: 'phone', label: 'Phone', isIdentity: true, getOld: (v) => v.phone },
  { key: 'businessAddress', label: 'Business Address', isIdentity: true, getOld: (v) => v.businessAddress || v.address },
  { key: 'description', label: 'Description', isIdentity: true, getOld: (v) => v.description },
  { key: 'yearsInBusiness', label: 'Years in Business', isIdentity: false, getOld: (v) => (v.yearsInBusiness !== null && v.yearsInBusiness !== undefined ? String(v.yearsInBusiness) : '') },
  { key: 'status', label: 'Status', isIdentity: false, getOld: (v) => v.status || 'Pending' },
];

function getFieldDiffs(originalVendor, currentForm) {
  if (!originalVendor) return [];
  const diffs = [];
  for (const def of FIELD_DEFINITIONS) {
    const oldVal = (def.getOld(originalVendor) ?? '').toString().trim();
    const newVal = (currentForm[def.key] ?? '').toString().trim();
    if (oldVal !== newVal) {
      diffs.push({
        key: def.key,
        label: def.label,
        isIdentity: def.isIdentity,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }
  return diffs;
}

// vendor: existing vendor object to edit, or null to create a new one
export default function VendorFormModal({ vendor, onClose, onSave, onImageRemoved, loading = false }) {
  const isEdit = Boolean(vendor);
  const [form, setForm] = useState(
    vendor ? { description: '', ...vendor } : emptyVendor
  );
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const initialImg = vendor?.imageUrl || vendor?.imagePreviewUrl || vendor?.logoUrl || vendor?.coverImageUrl || '';
  const [currentImage, setCurrentImage] = useState(initialImg);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleRemoveImage() {
    const id = vendor?.vendorId || (vendor?.id ? parseInt(String(vendor.id).replace(/\D/g, ''), 10) : null);
    if (!id) {
      setCurrentImage('');
      setForm((prev) => ({ ...prev, imageUrl: null, logoUrl: null, coverImageUrl: null, imagePreviewUrl: '' }));
      return;
    }

    if (!window.confirm(`Are you sure you want to remove the image for "${form.businessName || 'this vendor'}"?`)) {
      return;
    }

    setIsRemovingImage(true);
    try {
      const res = await fetch(`http://localhost:5131/api/admin/vendors/${id}/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || errData.title || 'Failed to remove vendor image.');
        return;
      }

      setCurrentImage('');
      setForm((prev) => ({
        ...prev,
        imageUrl: null,
        logoUrl: null,
        coverImageUrl: null,
        imagePreviewUrl: '',
      }));

      if (onImageRemoved) {
        onImageRemoved();
      }
    } catch (err) {
      alert(err.message || 'Error removing vendor image.');
    } finally {
      setIsRemovingImage(false);
    }
  }

  function validate() {
    const next = {};

    if (!form.businessName.trim()) next.businessName = 'Business name is required';
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required';
    if (!form.category) next.category = 'Select a category';

    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }

    if (!form.phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (!PHONE_PATTERN.test(form.phone.trim())) {
      next.phone = 'Use the format +94 7XXXXXXXX';
    }

    if (form.yearsInBusiness === '' || form.yearsInBusiness === null) {
      next.yearsInBusiness = 'Years in business is required';
    } else {
      const years = Number(form.yearsInBusiness);
      if (!Number.isInteger(years) || years < 0) {
        next.yearsInBusiness = 'Enter a whole number, 0 or greater';
      } else if (years >= 100) {
        next.yearsInBusiness = 'Years in business must be below 100';
      }
    }

    if (!form.description.trim()) {
      next.description = 'Add a short description of the service';
    } else if (form.description.trim().length < 20) {
      next.description = 'Description should be at least 20 characters';
    } else if (form.description.length > MAX_DESCRIPTION) {
      next.description = `Description must be under ${MAX_DESCRIPTION} characters`;
    }

    const currentDiffs = isEdit ? getFieldDiffs(vendor, form) : [];
    const hasIdentity = isEdit && currentDiffs.some((d) => d.isIdentity);
    if (isEdit && hasIdentity && !reason.trim()) {
      next.reason = 'Please enter a reason for modifying identity fields';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const diffs = isEdit ? getFieldDiffs(vendor, form) : [];
  const hasIdentityChanges = isEdit && diffs.some((d) => d.isIdentity);
  const changedIdentityLabels = diffs
    .filter((d) => d.isIdentity)
    .map((d) => d.label)
    .join(', ');

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, {
      changedFields: diffs,
      reason: reason.trim(),
      hasIdentityChanges,
    });
  }

  const isFormFilled =
    form.businessName.trim() &&
    form.ownerName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.yearsInBusiness !== '' &&
    form.description.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Vendor' : 'Add Vendor'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {/* Vendor Image Management */}
          <div className="mb-5">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Vendor image
            </span>
            {currentImage ? (
              <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                  <img
                    src={currentImage}
                    alt={form.businessName || 'Vendor image'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">
                    Active vendor profile image
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Images are uploaded directly by vendors via their portal. Admins can remove inappropriate or outdated images.
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isRemovingImage}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    <Trash2 size={13} />
                    {isRemovingImage ? 'Removing image...' : 'Remove image'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3.5 text-xs text-gray-500">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 shadow-sm">
                  <Image size={22} />
                </div>
                <div>
                  <p className="font-medium text-gray-700">No vendor image set</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Vendor images are uploaded and managed directly by the vendor through their vendor portal.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Business name" error={errors.businessName} className="col-span-2">
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                className={inputClass(errors.businessName)}
                placeholder="e.g. Bloom & Petal Decor"
              />
            </Field>

            <Field label="Category" error={errors.category}>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className={inputClass(errors.category)}
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Owner name" error={errors.ownerName}>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => update('ownerName', e.target.value)}
                className={inputClass(errors.ownerName)}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass(errors.email)}
                placeholder="name@business.com"
              />
            </Field>

            <Field label="Phone" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass(errors.phone)}
                placeholder="+94 7XXXXXXXX"
              />
            </Field>

            {/* Tax ID — Read-only / Sourced from verified vendor documents */}
            <Field label="Tax ID / Business Registration">
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-mono text-xs font-semibold text-gray-800">
                  {form.taxId || vendor?.taxId || 'Pending document verification'}
                </span>
                <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  Read-only
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Identity & legal data is verified from vendor-uploaded business documents.
              </p>
            </Field>

            <Field label="Years in business" error={errors.yearsInBusiness}>
              <input
                type="number"
                min="0"
                max="99"
                value={form.yearsInBusiness}
                onChange={(e) => update('yearsInBusiness', e.target.value)}
                className={inputClass(errors.yearsInBusiness)}
                placeholder="0–99"
              />
            </Field>

            <Field label="Business address" className="col-span-2">
              <input
                type="text"
                value={form.businessAddress}
                onChange={(e) => update('businessAddress', e.target.value)}
                className={inputClass()}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className={inputClass()}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>

            <Field
              label="Service description"
              error={errors.description}
              className="col-span-2"
            >
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                maxLength={MAX_DESCRIPTION}
                className={inputClass(errors.description)}
                placeholder="Describe what this vendor offers for weddings — packages, specialties, coverage area..."
              />
              <span className="mt-1 block text-right text-[11px] text-gray-400">
                {form.description.length}/{MAX_DESCRIPTION}
              </span>
            </Field>
          </div>

          {isEdit && (
            <VendorDocumentsSection
              vendorId={vendor?.vendorId || vendor?.id}
              initialDocs={vendor?.verificationDocs}
            />
          )}

          {/* Mandatory Reason for Identity/Profile Field Changes */}
          {isEdit && hasIdentityChanges && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label htmlFor="identity-change-reason" className="block text-sm font-semibold text-amber-900">
                    Reason for identity changes <span className="text-red-500">*</span>
                  </label>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Modifying identity data ({changedIdentityLabels}) requires an audit reason for the activity log.
                  </p>
                  <input
                    id="identity-change-reason"
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
                    }}
                    placeholder="e.g. Updated legal business name per revised registration certificate"
                    className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-1 ${
                      errors.reason
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-amber-300 focus:border-[#8E406F] focus:ring-[#8E406F]'
                    }`}
                  />
                  {errors.reason && (
                    <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} /> {errors.reason}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormFilled || loading || (isEdit && hasIdentityChanges && !reason.trim())}
              className="rounded-md bg-[#8E406F] px-4 py-2 text-sm font-medium text-white hover:bg-[#75325a] disabled:cursor-not-allowed disabled:opacity-40 transition"
            >
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Add vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </label>
  );
}

function inputClass(error) {
  return `w-full rounded-md border px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F] ${
    error ? 'border-red-300' : 'border-gray-200'
  }`;
}
