import { forwardRef } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 dark:text-slate-200 text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'input appearance-none pr-10 cursor-pointer',
            error && 'border-accent-danger focus:ring-accent-danger',
            className
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none dark:text-slate-400 text-slate-500" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
