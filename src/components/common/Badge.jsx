// Badge.jsx — Reusable pill badge component
// Variants: status | category | urgent | count

const variantMap = {
  // Status variants
  pending:    'bg-amber-50   text-amber-700  border border-amber-200',
  active:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  replied:    'bg-blue-50    text-blue-700   border border-blue-200',
  new:        'bg-[#FDF0F4]  text-[#8E406F]  border border-[#e8c4d8]',
  urgent:     'bg-red-50     text-red-600    border border-red-200 font-semibold',
  stable:     'bg-slate-50   text-slate-600  border border-slate-200',

  // Category variants
  photography: 'bg-purple-50  text-purple-700 border border-purple-200',
  venue:        'bg-blue-50    text-blue-700   border border-blue-200',
  dj:           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  catering:     'bg-rose-50    text-rose-700   border border-rose-200',
  default:      'bg-slate-100  text-slate-600  border border-slate-200',
};

export default function Badge({ children, variant = 'default', className = '', size = 'sm' }) {
  const classes = variantMap[variant?.toLowerCase()] ?? variantMap.default;
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium leading-none ${sizeClass} ${classes} ${className}`}
    >
      {children}
    </span>
  );
}
