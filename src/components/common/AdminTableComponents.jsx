import React from 'react';
import { Search } from 'lucide-react';

// =========================================================================
// STANDARDIZED ADMIN PAGE & TABLE COMPONENTS
// Extracted from AdminManagementPage.jsx (Reference Standard)
// =========================================================================

/**
 * Standardized Admin Page Header
 * Typography scale: 24px (text-2xl) Playfair Display title, 14px (text-sm) neutral subtitle
 */
export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1
          className="text-2xl font-bold text-[#333]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#737373] mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Standardized Admin Stat Card
 * Visual style: white card, #F1E5EC border, p-5 padding, uppercase tracking-wider 12px label,
 * 30px (text-3xl) bold metric number, 32px circular icon container with 16px icon.
 */
export function AdminStatCard({
  label,
  value,
  icon: Icon,
  iconColor = '#8E406F',
  iconBg = 'bg-[#8E406F]/10',
  valueColor = 'text-[#333]',
  delta,
  deltaColor = 'text-[#888]',
}) {
  return (
    <div className="bg-white rounded-xl border border-[#F1E5EC] p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#999] font-semibold uppercase tracking-wider">{label}</p>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
            style={{ color: iconColor }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
      {delta && <p className={`text-xs ${deltaColor} mt-1 font-medium`}>{delta}</p>}
    </div>
  );
}

/**
 * Standardized Table Card Container
 * Visual style: white background, rounded-xl (12px), #F1E5EC border, shadow-sm
 */
export function AdminTableCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-[#F1E5EC] overflow-hidden shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/**
 * Standardized Table Toolbar (Search bar + Filter selects + Action buttons)
 * Visual style: px-6 py-4 padding, border-b border-[#F1E5EC], light gray rounded input
 */
export function AdminTableToolbar({ searchProps, filters, actions, leftContent }) {
  return (
    <div className="px-6 py-4 border-b border-[#F1E5EC] flex flex-col sm:flex-row items-center justify-between gap-4">
      {searchProps ? (
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
          <input
            {...searchProps}
            className="w-full pl-10 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#F8FAFC] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
          />
        </div>
      ) : leftContent ? (
        <div className="w-full sm:w-auto">{leftContent}</div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
        {filters}
        {actions}
      </div>
    </div>
  );
}

/**
 * Standardized Table Element & Structure
 * Header: bg-[#FAFBFC] text-[#999] text-xs uppercase tracking-wider border-b border-[#F1E5EC]
 * Header cell: px-6 py-3.5 font-semibold
 * Body row: divide-y divide-[#F1E5EC] hover:bg-[#FDF0F4]/40 transition-colors
 * Body cell: px-6 py-3.5 text-sm
 */
export function AdminTable({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHeader({ children }) {
  const childrenArray = React.Children.toArray(children);
  const hasTr = childrenArray.some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === 'tr' ||
        child.type === AdminTableRow ||
        child?.type?.name === 'AdminTableRow' ||
        child.props?.className?.includes('border-b'))
  );

  return (
    <thead>
      {hasTr ? (
        children
      ) : (
        <tr className="bg-[#FAFBFC] text-[#999] text-xs uppercase tracking-wider border-b border-[#F1E5EC]">
          {children}
        </tr>
      )}
    </thead>
  );
}

export function AdminTableHead({ children, className = '', align = 'left', ...props }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`px-3.5 py-3.5 font-semibold ${alignClass} ${className}`} {...props}>
      {children}
    </th>
  );
}

export function AdminTableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-[#F1E5EC] bg-white ${className}`}>
      {children}
    </tbody>
  );
}

export function AdminTableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[#FDF0F4]/40 transition-colors ${className}`}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className = '', align = 'left', ...props }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td className={`px-3.5 py-3.5 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
}

/**
 * Standardized Table Pagination Footer
 * Visual style: px-6 py-3.5 border-t border-[#F1E5EC] bg-[#FAFBFC]
 */
export function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showingLabel = 'items',
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-6 py-3.5 border-t border-[#F1E5EC] bg-[#FAFBFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373]">
      <div>
        Showing <strong className="font-semibold text-[#333]">{start}–{end}</strong> of{' '}
        <strong className="font-semibold text-[#333]">{totalItems}</strong> {showingLabel}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
        >
          Previous
        </button>
        <span className="px-2 font-medium text-[#555]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#555] hover:bg-[#FDF0F4] hover:text-[#8E406F] hover:border-[#8E406F]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Standardized Action Icon Button
 * Matches AdminManagementPage action button styling (16px icon, 6px padding, subtle hover background)
 */
export function AdminIconButton({
  icon: Icon,
  onClick,
  title,
  ariaLabel,
  variant = 'default',
  disabled = false,
  label,
  className = '',
  children,
}) {
  let colorClass = 'text-gray-600 hover:text-[#8E406F] hover:bg-[#FDF0F4] border border-transparent hover:border-[#8E406F]/20';
  if (variant === 'danger') {
    colorClass = 'text-gray-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200';
  } else if (variant === 'success') {
    colorClass = 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200';
  } else if (variant === 'warning') {
    colorClass = 'text-gray-600 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors text-xs shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${colorClass} ${className}`}
    >
      {Icon ? <Icon size={13} className="shrink-0" /> : children}
      {label && <span className="font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
}
