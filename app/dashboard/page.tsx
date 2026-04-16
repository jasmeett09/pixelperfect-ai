import Link from 'next/link'
import { ArrowRight, Clock3, ScanLine, ShieldCheck } from 'lucide-react'

import { AppShell } from '@/components/sections/AppShell'
import { GlassCard } from '@/components/sections/GlassCard'
import { ReviewWorkspace } from '@/components/sections/ReviewWorkspace'

export default function DashboardPage() {
  return (
    <AppShell
      active="dashboard"
      eyebrow="Product Dashboard"
      title="Review design drift from one working cockpit."
      description="Connect Figma, capture deployed pages, run comparison, and triage CSS fixes without returning to the landing page."
    >
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-4 md:grid-cols-3">
          <DashboardCard
            icon={<ScanLine className="h-5 w-5 text-cyan-300" />}
            title="Live diff workspace"
            text="Open the dedicated side-by-side Figma and website comparison page."
            href="/diff"
          />
          <DashboardCard
            icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
            title="Real data pipeline"
            text="Figma import, Playwright capture, mismatch detection, and CSS fixes are wired to API routes."
          />
          <DashboardCard
            icon={<Clock3 className="h-5 w-5 text-red-300" />}
            title="Webhook ready"
            text="Connected files can reimport and rerun sync when future Figma update events arrive."
          />
        </div>
      </section>

      <ReviewWorkspace showIntro={false} />
    </AppShell>
  )
}

function DashboardCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode
  title: string
  text: string
  href?: string
}) {
  const content = (
    <GlassCard className="h-full p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          {icon}
        </div>
        {href ? <ArrowRight className="h-4 w-4 text-slate-400" /> : null}
      </div>
      <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </GlassCard>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      {content}
    </Link>
  )
}
