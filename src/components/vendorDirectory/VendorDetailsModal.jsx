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
          <div className="mb-4 flex items-center gap-2">
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

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Owner" value={vendor.ownerName} />
            <Detail label="Email" value={vendor.email} />
            <Detail label="Phone" value={vendor.phone} />
            <Detail label="Tax ID" value={vendor.taxId} />
            <Detail label="Years in business" value={vendor.yearsInBusiness} />
            <Detail label="Applied" value={vendor.appliedDate} />
            <Detail label="Address" value={vendor.businessAddress} span />
          </dl>

          {vendor.whyApplied && (
            <div className="mt-4 rounded-md bg-[#FDF0F4] p-3">
              <p className="text-xs font-medium text-[#8E406F]">Why they applied</p>
              <p className="mt-1 text-sm italic text-gray-700">&ldquo;{vendor.whyApplied}&rdquo;</p>
            </div>
          )}

          {vendor.verificationDocs?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Verification documents
              </p>
              <ul className="space-y-1">
                {vendor.verificationDocs.map((doc) => (
                  <li
                    key={doc.name}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <FileText size={14} className="text-gray-400" />
                      {doc.name}
                    </span>
                    <button className="text-xs font-medium text-[#8E406F] hover:underline">
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          {isBanned && vendor.banReason && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Banned {vendor.banDate && `on ${vendor.banDate}`}</p>
              <p>{vendor.banReason}</p>
            </div>
          )}

          {isSuspended && vendor.suspendReason && (
            <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
              <p className="font-medium">
                Suspended {vendor.suspendedDate && `on ${vendor.suspendedDate}`}
              </p>
              <p>{vendor.suspendReason}</p>
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

          {isApproved && (
            <>
              <ActionButton icon={ShieldAlert} label="Suspend" onClick={() => onSuspend(vendor)} />
              <ActionButton
                icon={Ban}
                label="Ban vendor"
                tone="danger"
                onClick={() => setShowBanBox(true)}
              />
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
