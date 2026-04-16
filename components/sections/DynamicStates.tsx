'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function DynamicStates() {
  const states = [
    { label: 'Default', color: 'from-purple-500 to-purple-600' },
    { label: 'Hover', color: 'from-pink-500 to-pink-600' },
    { label: 'Active', color: 'from-blue-500 to-blue-600' },
    { label: 'Disabled', color: 'from-gray-500 to-gray-600' },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Handle All Design States
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From default to interactive states, we maintain design intent everywhere
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {states.map((state, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover glow="blue" className="p-8 text-center h-full flex flex-col items-center justify-center">
                <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${state.color} mb-6 shadow-lg`}></div>
                <p className="text-gray-300 font-medium">{state.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard glow="purple" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Consistent Across All Interactions</h3>
            <p className="text-gray-400 mb-6">
              Every state preserves your design intent—from micro-interactions to complex user flows.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {['Buttons', 'Forms', 'Cards', 'Modals', 'Dropdowns', 'Inputs', 'Toasts', 'Tooltips'].map((item) => (
                <div key={item} className="px-3 py-2 bg-white/5 rounded border border-white/10">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
