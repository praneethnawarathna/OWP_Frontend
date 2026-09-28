const STATUS_STYLES = {
  Open: 'bg-amber-50 text-amber-700',
  UnderReview: 'bg-blue-50 text-blue-700',
  Dismissed: 'bg-gray-100 text-gray-600',
  ContentRemoved: 'bg-red-50 text-red-700',
};

const STATUS_LABELS = {
  Open: 'Open',
  UnderReview: 'Under review',
  Dismissed: 'Dismissed',
  ContentRemoved: 'Content removed',
};

const SEVERITY_STYLES = {
  High: 'bg-red-50 text-red-700',
  Medium: 'bg-orange-50 text-orange-700',
  Low: 'bg-gray-100 text-gray-600',
};

export function FlagStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {severity}
    </span>
  );
}
