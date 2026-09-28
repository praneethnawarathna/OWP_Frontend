import { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  RotateCcw,
  Star,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import VendorDocumentsSection from './VendorDocumentsSection';

export default function VendorDetailsModal({
  vendor,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  onHold,
  onSuspend,
  onBan,
  onUnban,
}) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showBanBox, setShowBanBox] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendBox, setShowSuspendBox] = useState(false);

  const isPending = vendor.status === 'Pending';
  const isApproved = vendor.status === 'Approved';
  const isSuspended = vendor.status === 'Suspended';
  const isBanned = vendor.status === 'Banned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{vendor.businessName}</h2>
            <p className="text-xs text-gray-500">
              {vendor.id} &middot; {vendor.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={vendor.status} />
              {vendor.businessLicenseVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ShieldCheck size={14} /> License verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                  <ShieldAlert size={14} /> License not verified
                </span>
              )}
            </div>
            {vendor.statusChangedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock size={13} /> Updated: {vendor.statusChangedAt}
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Owner" value={vendor.ownerName} />
            <Detail label="Email" value={vendor.email} />
            <Detail label="Phone" value={vendor.phone} />
            <Detail label="Tax ID" value={vendor.taxId} />
            <Detail label="Years in business" value={vendor.yearsInBusiness} />
            <Detail label="Applied" value={vendor.appliedDate} />
            {vendor.statusChangedAt && (
              <Detail label="Status Changed At" value={vendor.statusChangedAt} />
            )}
            {(vendor.statusChangeReason || vendor.suspendReason || vendor.banReason || vendor.rejectReason) && (
              <Detail label="Status Change Reason" value={vendor.statusChangeReason || vendor.suspendReason || vendor.banReason || vendor.rejectReason} span={!vendor.statusChangedAt} />
            )}
            <Detail label="Address" value={vendor.businessAddress} span />
          </dl>

          {vendor.whyApplied && (
            <div className="mt-4 rounded-md bg-[#FDF0F4] p-3">
              <p className="text-xs font-medium text-[#8E406F]">Why they applied</p>
              <p className="mt-1 text-sm italic text-gray-700">&ldquo;{vendor.whyApplied}&rdquo;</p>
            </div>
          )}

          <VendorDocumentsSection
            vendorId={vendor.vendorId || vendor.id}
            initialDocs={vendor.verificationDocs}
          />

          {isApproved && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="Listings" value={vendor.listingsCount ?? 0} />
              <Stat
                label="Rating"
                value={vendor.rating ? `${vendor.rating} ★` : '—'}
              />
              <Stat
                label="Revenue"
                value={vendor.revenue ? `LKR ${vendor.revenue.toLocaleString()}` : '—'}
              />
            </div>
          )}

          {(vendor.statusChangeReason || vendor.statusChangedAt || vendor.banReason || vendor.suspendReason || vendor.rejectReason) && (
            <div className={`mt-4 rounded-md p-3 text-sm border ${
              isBanned
                ? 'bg-red-50 text-red-800 border-red-200'
                : isSuspended
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : vendor.status === 'Rejected'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : vendor.status === 'Approved'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-gray-50 text-gray-800 border-gray-200'
            }`}>
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> Status History ({vendor.status})
                </span>
                {(vendor.statusChangedAt || vendor.banDate || vendor.suspendedDate) && (
                  <span className="text-xs font-normal opacity-80">
                    {vendor.statusChangedAt || vendor.banDate || vendor.suspendedDate}
                  </span>
                )}
              </div>
              {(vendor.statusChangeReason || vendor.banReason || vendor.suspendReason || vendor.rejectReason) && (
                <p className="mt-1 text-xs">
                  <span className="font-semibold">Reason: </span>
                  <span className="italic">{vendor.statusChangeReason || vendor.banReason || vendor.suspendReason || vendor.rejectReason}</span>
                </p>
              )}
            </div>
          )}

          {showRejectBox && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
                placeholder="Explain why this application is being rejected..."
              />
            </div>
          )}

          {showSuspendBox && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-amber-800">
                Reason for suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-amber-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                placeholder="Explain why this vendor is being suspended..."
              />
            </div>
          )}

          {showBanBox && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Reason for ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
                placeholder="Explain the policy violation..."
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-6 py-4">
          {isPending && !showRejectBox && (
            <>
              <ActionButton icon={Clock} label="Temporary hold" onClick={() => onHold(vendor)} />
              <ActionButton
                icon={FileText}
                label="Request info"
                onClick={() => onRequestInfo(vendor)}
              />
              <ActionButton
                icon={XCircle}
                label="Reject"
                tone="danger"
                onClick={() => setShowRejectBox(true)}
              />
              <ActionButton
                icon={CheckCircle2}
                label="Approve"
                tone="primary"
                onClick={() => onApprove(vendor)}
              />
            </>
          )}

          {isPending && showRejectBox && (
            <>
              <button
                onClick={() => setShowRejectBox(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(vendor, rejectReason)}
                disabled={!rejectReason.trim()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                Confirm rejection
              </button>
            </>
          )}

          {isApproved && !showSuspendBox && !showBanBox && (
            <>
              <ActionButton icon={ShieldAlert} label="Suspend" onClick={() => setShowSuspendBox(true)} />
              <ActionButton
                icon={Ban}
                label="Ban vendor"
                tone="danger"
                onClick={() => setShowBanBox(true)}
              />
            </>
          )}

          {showSuspendBox && (
            <>
              <button
                onClick={() => setShowSuspendBox(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSuspend(vendor, suspendReason)}
                disabled={!suspendReason.trim()}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-40"
              >
                Confirm suspension
              </button>
            </>
          )}

          {isSuspended && !showBanBox && (
            <>
              <ActionButton
                icon={RotateCcw}
                label="Reactivate"
                tone="primary"
                onClick={() => onApprove(vendor)}
              />
              <ActionButton
                icon={Ban}
                label="Ban vendor"
                tone="danger"
                onClick={() => setShowBanBox(true)}
              />
            </>
          )}

          {showBanBox && (
            <>
              <button
                onClick={() => setShowBanBox(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onBan(vendor, banReason)}
                disabled={!banReason.trim()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                Confirm ban
              </button>
            </>
          )}

          {isBanned && (
            <ActionButton
              icon={RotateCcw}
              label="Unban"
              tone="primary"
              onClick={() => onUnban(vendor)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, span }) {
  if (!value) return null;
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-gray-100 py-2">
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, tone }) {
  const toneClass =
    tone === 'primary'
      ? 'bg-[#8E406F] text-white hover:bg-[#75325a]'
      : tone === 'danger'
      ? 'border border-red-200 text-red-600 hover:bg-red-50'
      : 'border border-gray-200 text-gray-600 hover:bg-gray-50';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${toneClass}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
