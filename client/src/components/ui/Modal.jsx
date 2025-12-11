import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={clsx(
          'relative w-full mx-4 rounded-xl shadow-2xl animate-scaleIn',
          'dark:bg-dark-secondary bg-light-secondary',
          'border dark:border-dark-border border-light-border',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-dark-border border-light-border">
            <h2 className="text-lg font-semibold dark:text-white text-slate-900">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors dark:hover:bg-dark-tertiary hover:bg-light-tertiary dark:text-slate-400 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
