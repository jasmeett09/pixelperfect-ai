'use client'

import Link from 'next/link'
import { LayoutDashboard, ScanSearch, Sparkles } from 'lucide-react'
import { GradientText } from './GradientText'

type AppShellProps = {
  active: 'dashboard' | 'diff'
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}

export function AppShell({ active, eyebrow, title, description, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 font-bold">
              PP
            </div>
            <span className="text-lg font-bold">
              <GradientText variant="rainbow">PixelPerfect</GradientText>
            </span>
          </Link>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            <AppNavLink href="/dashboard" active={active === 'dashboard'} icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </AppNavLink>
            <AppNavLink href="/diff" active={active === 'diff'} icon={<ScanSearch className="h-4 w-4" />}>
              Diff
            </AppNavLink>
          </div>
        </div>
      </div>

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_32%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex max-w-4xl flex-col gap-4">
            <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
          </div>
        </div>
      </section>

      {children}
    </main>
  )
}

function AppNavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
