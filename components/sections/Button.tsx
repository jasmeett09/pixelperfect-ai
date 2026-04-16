import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 active:scale-95',
  secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/40 active:scale-95',
  outline: 'border-2 border-purple-400 text-purple-300 hover:bg-purple-500/10 active:scale-95',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-semibold transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  )
}
