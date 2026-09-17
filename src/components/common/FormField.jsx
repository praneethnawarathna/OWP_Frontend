// FormField.jsx — Standard form input wrapper with label, helper, and error state

export default function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="flex items-center justify-between text-xs font-semibold text-[#1E293B]">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </span>
          {hint && !error && <span className="text-[11px] font-normal text-[#94A3B8]">{hint}</span>}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}
