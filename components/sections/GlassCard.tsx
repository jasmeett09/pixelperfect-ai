import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'pink' | 'blue' | 'none'
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  glow = 'none',
}: GlassCardProps) {
  const baseClasses = hover ? 'glass-card-hover' : 'glass-card'
  const glowClasses = {
    purple: 'glow-purple',
    pink: 'glow-pink',
    blue: 'glow-blue',
    none: '',
  }

  return (
    <div className={`${baseClasses} ${glowClasses[glow]} ${className}`}>
      {children}
    </div>
  )
}
