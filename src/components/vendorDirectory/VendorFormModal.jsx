import { useState, useRef } from 'react';
import { X, ImagePlus, Trash2, AlertCircle } from 'lucide-react';
import { VENDOR_CATEGORIES } from '../../mock/vendorDirectoryData';

const MAX_IMAGE_MB = 5;
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
  imageFile: null,
  imagePreviewUrl: '',
};

// Sri Lankan mobile format: +94 7XXXXXXXX (9 digits after country code, starts with 7)
const PHONE_PATTERN = /^\+94\s?7\d{8}$/;
// e.g. BR/2026/001
const TAX_ID_PATTERN = /^[A-Za-z]{2,4}\/\d{4}\/[A-Za-z0-9]{1,6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// vendor: existing vendor object to edit, or null to create a new one
export default function VendorFormModal({ vendor, onClose, onSave }) {
  const isEdit = Boolean(vendor);
  const [form, setForm] = useState(
    vendor ? { imageFile: null, imagePreviewUrl: vendor.imagePreviewUrl || '', description: '', ...vendor } : emptyVendor
  );
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg';
    if (!isJpg) {
      setErrors((prev) => ({ ...prev, image: 'Only .jpg / .jpeg images are allowed' }));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: `Image must be under ${MAX_IMAGE_MB}MB` }));
      e.target.value = '';
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imagePreviewUrl: previewUrl }));
  }

  function removeImage() {
    if (form.imagePreviewUrl) URL.revokeObjectURL(form.imagePreviewUrl);
    setForm((prev) => ({ ...prev, imageFile: null, imagePreviewUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
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

    if (!form.taxId.trim()) {
      next.taxId = 'Tax ID is required';
    } else if (!TAX_ID_PATTERN.test(form.taxId.trim())) {
      next.taxId = 'Use the format BR/2026/XXX';
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

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const isFormFilled =
    form.businessName.trim() &&
    form.ownerName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.taxId.trim() &&
    form.yearsInBusiness !== '' &&
    form.description.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit vendor' : 'Add vendor'}
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
          {/* Image upload */}
          <div className="mb-5">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Vendor image <span className="font-normal text-gray-400">(.jpg, optional)</span>
            </span>
            <div className="flex items-center gap-4">
              {form.imagePreviewUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={form.imagePreviewUrl}
                    alt="Vendor preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#8E406F] hover:text-[#8E406F]"
                >
                  <ImagePlus size={20} />
                  <span className="text-[11px]">Upload</span>
                </button>
              )}

              <div className="text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-[#8E406F] hover:underline"
                >
                  {form.imagePreviewUrl ? 'Replace image' : 'Choose a .jpg file'}
                </button>
                <p className="mt-1">JPG only, up to {MAX_IMAGE_MB}MB</p>
                {errors.image && (
                  <p className="mt-1 flex items-center gap-1 text-red-600">
                    <AlertCircle size={12} /> {errors.image}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,.jpg,.jpeg"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
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

            <Field label="Tax ID" error={errors.taxId}>
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => update('taxId', e.target.value)}
                className={inputClass(errors.taxId)}
                placeholder="BR/2026/XXX"
              />
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
              disabled={!isFormFilled}
              className="rounded-md bg-[#8E406F] px-4 py-2 text-sm font-medium text-white hover:bg-[#75325a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEdit ? 'Save changes' : 'Add vendor'}
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
