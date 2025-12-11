import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
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
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-slate-400 text-slate-500" />
        )}
        <input
          ref={ref}
          className={clsx(
            'input',
            Icon && 'pl-10',
            error && 'border-accent-danger focus:ring-accent-danger',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
