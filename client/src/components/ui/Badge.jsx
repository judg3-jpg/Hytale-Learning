import clsx from 'clsx'

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  default: 'badge-default',
}

function Badge({ children, variant = 'default', className, dot }) {
  return (
    <span className={clsx(variants[variant], className)}>
      {dot && (
        <span className={clsx(
          'h-1.5 w-1.5 rounded-full',
          variant === 'success' && 'bg-green-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'info' && 'bg-cyan-400',
          variant === 'default' && 'bg-slate-400',
        )} />
      )}
      {children}
    </span>
  )
}

export default Badge
