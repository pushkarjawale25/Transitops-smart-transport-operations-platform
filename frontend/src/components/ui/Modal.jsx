import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { Button } from './Button'

export function Modal({ isOpen, onClose, title, children, className }) {
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border',
          'animate-fade-in max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
