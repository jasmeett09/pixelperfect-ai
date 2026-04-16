'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { GradientText } from './GradientText'

export function Problem() {
  const issues = [
    {
      icon: '🎨',
      title: 'Design Intent Lost',
      description: 'Your vision gets diluted through communication and feedback cycles.',
    },
    {
      icon: '⏱️',
      title: 'Wasted Time',
      description: 'Hours spent explaining what you want instead of building what matters.',
    },
    {
      icon: '🔄',
      title: 'Endless Revisions',
      description: 'Back-and-forth feedback loops without reaching the desired outcome.',
    },
    {
      icon: '❌',
      title: 'Pixel Imperfection',
      description: 'Details get lost, compromises are made, perfection becomes impossible.',
    },
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
            The Design Problem No One Talks About
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Traditional design workflows break down when <GradientText>intent meets execution</GradientText>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map((issue, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover glow="pink" className="p-6 h-full">
                <div className="text-4xl mb-4">{issue.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{issue.title}</h3>
                <p className="text-gray-400">{issue.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
