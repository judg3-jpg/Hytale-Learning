import { forwardRef } from 'react'
import clsx from 'clsx'

const Textarea = forwardRef(({
  label,
  error,
  className,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 dark:text-slate-200 text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'input resize-none',
          error && 'border-accent-danger focus:ring-accent-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
