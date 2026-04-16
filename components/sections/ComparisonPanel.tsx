import { GlassCard } from './GlassCard'

interface ComparisonItem {
  label: string
  value: string | boolean
}

interface ComparisonPanelProps {
  title: string
  items: ComparisonItem[]
  highlighted?: boolean
  badge?: string
  className?: string
}

export function ComparisonPanel({
  title,
  items,
  highlighted = false,
  badge,
  className = '',
}: ComparisonPanelProps) {
  return (
    <GlassCard
      hover
      glow={highlighted ? 'purple' : 'none'}
      className={`p-6 relative ${highlighted ? 'border-purple-500/50 bg-purple-500/5' : ''} ${className}`}
    >
      {badge && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-semibold">
          {badge}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-6 pr-20">{title}</h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-gray-300">{item.label}</span>
            {typeof item.value === 'boolean' ? (
              <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-sm ${item.value ? 'bg-green-500/30 border border-green-500' : 'bg-red-500/30 border border-red-500'}`}>
                {item.value ? '✓' : '✕'}
              </div>
            ) : (
              <span className="text-purple-300 font-semibold">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
