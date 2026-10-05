import { useEffect, useRef } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

export default function PendingApprovalModal({ open, vendorStatus, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isPending = vendorStatus === 'Pending';
  const Icon = isPending ? Clock : ShieldAlert;
  const title = isPending ? 'Verification pending' : 'Listing saved as draft';
  const body = isPending
    ? "Your profile verification is still pending. You can publish your listing once you're approved. Until then, your listing will be saved as a draft."
    : "Your vendor account can't publish listings right now, so your listing was saved as a draft. Please contact support for help.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-approval-title"
      aria-describedby="pending-approval-desc"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-[#FDF0F4] mb-4">
            <Icon className="w-6 h-6 text-[#8E406F]" />
          </div>
          
          <h2 id="pending-approval-title" className="text-xl font-semibold text-[#1E293B] mb-2 font-display">
            {title}
          </h2>
          
          <p id="pending-approval-desc" className="text-sm text-[#737373] leading-relaxed mb-8">
            {body}
          </p>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#8E406F] hover:bg-[#722856] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E406F]/50 focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
