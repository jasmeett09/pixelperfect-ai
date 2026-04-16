'use client'

import Link from 'next/link'
import { Button } from './Button'
import { GradientText } from './GradientText'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">PP</span>
            </div>
            <span className="text-xl font-bold">
              <GradientText variant="rainbow">PixelPerfect</GradientText>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
              Testimonials
            </a>
            <Link href="/diff" className="text-gray-300 hover:text-white transition-colors">
              Diff
            </Link>
          </div>

          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
