import { useState } from 'react';
import { X } from 'lucide-react';
import { VENDOR_CATEGORIES } from '../../mock/vendorDirectoryData';

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
};

// vendor: existing vendor object to edit, or null to create a new one
export default function VendorFormModal({ vendor, onClose, onSave }) {
  const isEdit = Boolean(vendor);
  const [form, setForm] = useState(vendor ? { ...vendor } : emptyVendor);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.businessName.trim()) next.businessName = 'Business name is required';
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.category) next.category = 'Select a category';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
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

            <Field label="Tax ID" className="col-span-2">
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => update('taxId', e.target.value)}
                className={inputClass()}
                placeholder="BR/2026/XXX"
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

            <Field label="Years in business">
              <input
                type="number"
                min="0"
                value={form.yearsInBusiness}
                onChange={(e) => update('yearsInBusiness', e.target.value)}
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
              className="rounded-md bg-[#8E406F] px-4 py-2 text-sm font-medium text-white hover:bg-[#75325a]"
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
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function inputClass(error) {
  return `w-full rounded-md border px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F] ${
    error ? 'border-red-300' : 'border-gray-200'
  }`;
}
