import { useState } from 'react';
import { X, Sparkles, CheckCircle2, Trash2, Eye } from 'lucide-react';
import { FlagStatusBadge, SeverityBadge } from './FlagBadges';

export default function FlagDetailsModal({ flag, onClose, onMarkReview, onDismiss, onRemove }) {
  // noteMode: null | 'dismiss' | 'remove'
  const [noteMode, setNoteMode] = useState(null);
  const [note, setNote] = useState('');

  const isResolved = flag.status === 'Dismissed' || flag.status === 'ContentRemoved';

  function confirmNote() {
    if (!note.trim()) return;
    if (noteMode === 'dismiss') onDismiss(flag, note.trim());
    if (noteMode === 'remove') onRemove(flag, note.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{flag.contentTitle}</h2>
            <p className="text-xs text-gray-500">
              {flag.id} &middot; {flag.contentType} &middot; {flag.vendorName}
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
            <FlagStatusBadge status={flag.status} />
            <SeverityBadge severity={flag.severity} />
          </div>

          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Flagged content
            </p>
            <p className="mt-1 text-sm text-gray-800">{flag.contentSnippet}</p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Reason" value={flag.reason} />
            <Detail label="Reported by" value={flag.reportedBy} />
            <Detail label="Reported on" value={flag.reportedAt} />
            {flag.reviewedAt && <Detail label="Reviewed on" value={flag.reviewedAt} />}
          </dl>

          {flag.aiSuggestion && (
            <div className="mt-4 rounded-md bg-[#FDF0F4] p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-[#8E406F]">
                <Sparkles size={12} /> AI suggestion (you make the final decision)
              </p>
              <p className="mt-1 text-sm text-gray-800">
                {flag.aiSuggestion.action} &middot; {flag.aiSuggestion.confidence}% confidence
              </p>
              <p className="mt-0.5 text-xs text-gray-600">{flag.aiSuggestion.note}</p>
            </div>
          )}

          {isResolved && flag.resolutionNote && (
            <div className="mt-4 rounded-md border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-400">Resolution note</p>
              <p className="mt-1 text-sm text-gray-800">{flag.resolutionNote}</p>
            </div>
          )}

          {noteMode && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                {noteMode === 'remove' ? 'Reason for removing this content' : 'Reason for dismissing this flag'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]"
                placeholder="This note is saved with the decision..."
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-6 py-4">
          {!isResolved && !noteMode && (
            <>
              {flag.status === 'Open' && (
                <ActionButton icon={Eye} label="Mark under review" onClick={() => onMarkReview(flag)} />
              )}
              <ActionButton
                icon={CheckCircle2}
                label="Dismiss flag"
                onClick={() => setNoteMode('dismiss')}
              />
              <ActionButton
                icon={Trash2}
                label="Remove content"
                tone="danger"
                onClick={() => setNoteMode('remove')}
              />
            </>
          )}

          {!isResolved && noteMode && (
            <>
              <button
                onClick={() => {
                  setNoteMode(null);
                  setNote('');
                }}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmNote}
                disabled={!note.trim()}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40 ${
                  noteMode === 'remove' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#8E406F] hover:bg-[#75325a]'
                }`}
              >
                {noteMode === 'remove' ? 'Confirm removal' : 'Confirm dismissal'}
              </button>
            </>
          )}

          {isResolved && (
            <button
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, tone }) {
  const toneClass =
    tone === 'danger'
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
