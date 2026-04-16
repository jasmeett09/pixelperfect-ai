'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function Collaboration() {
  const collaborationFeatures = [
    {
      title: 'Real-time Sync',
      description: 'See changes instantly across all team members without any delay.',
      icon: '⚡',
    },
    {
      title: 'Smart Comments',
      description: 'Leave AI-powered contextual feedback that understands design intent.',
      icon: '💬',
    },
    {
      title: 'Version Control',
      description: 'Track every iteration and easily revert to previous design versions.',
      icon: '📚',
    },
    {
      title: 'Team Workspaces',
      description: 'Organize projects, manage permissions, and scale across teams.',
      icon: '👥',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Collaboration Built In
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Work together seamlessly with your design team
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {collaborationFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover glow="pink" className="p-8">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Collaboration Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <GlassCard glow="blue" className="p-8">
            <div className="h-64 flex flex-col items-center justify-center gap-6">
              {/* Avatars */}
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-white/20 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-center">
                3 team members collaborating in real-time
              </p>
              <div className="flex gap-3">
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-xs font-medium">
                  Sarah editing
                </div>
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-xs font-medium">
                  Mike viewing
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
