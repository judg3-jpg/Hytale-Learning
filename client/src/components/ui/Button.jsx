import { forwardRef } from 'react'
import clsx from 'clsx'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  warning: 'btn-warning',
  success: 'btn-success',
  info: 'btn-info',
  ghost: 'btn-ghost',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
