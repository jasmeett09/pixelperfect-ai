import { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'purple' | 'pink' | 'blue' | 'rainbow'
}

const variants = {
  purple: 'bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent',
  pink: 'bg-gradient-to-r from-pink-400 to-rose-600 bg-clip-text text-transparent',
  blue: 'bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent',
  rainbow: 'gradient-text',
}

export function GradientText({
  children,
  className = '',
  variant = 'rainbow',
}: GradientTextProps) {
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
