import { GlassCard } from './GlassCard'

interface StatCardProps {
  stat: string
  label: string
  company?: string
  className?: string
}

export function StatCard({ stat, label, company, className = '' }: StatCardProps) {
  return (
    <GlassCard hover glow="blue" className={`p-8 text-center ${className}`}>
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-bold gradient-text">{stat}</p>
        <p className="text-gray-300 text-sm font-medium">{label}</p>
        {company && <p className="text-gray-500 text-xs mt-2">{company}</p>}
      </div>
    </GlassCard>
  )
}
