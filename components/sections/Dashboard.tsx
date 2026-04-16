'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function Dashboard() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Intuitive Design Interface
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A beautiful dashboard that makes design intention clear and actionable
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <GlassCard glow="blue" className="overflow-hidden">
            <div className="relative h-96 md:h-[600px]">
              {/* Simulated Dashboard Content */}
              <div className="w-full h-full bg-gradient-to-b from-white/5 to-white/0 p-6 md:p-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-48"></div>
                    <div className="h-2 bg-white/5 rounded w-32"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-white/10 rounded w-20"></div>
                    <div className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded w-20"></div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {/* Left Panel */}
                  <div className="space-y-4">
                    <div className="h-32 bg-white/5 rounded-lg"></div>
                    <div className="h-24 bg-white/5 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                      <div className="h-3 bg-white/10 rounded w-4/5"></div>
                      <div className="h-3 bg-white/10 rounded w-3/5"></div>
                    </div>
                  </div>

                  {/* Right Panel - Main Canvas */}
                  <div className="space-y-4">
                    <div className="h-56 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/20"></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 bg-white/5 rounded"></div>
                      <div className="h-12 bg-white/5 rounded"></div>
                      <div className="h-12 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-8 grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-2 bg-white/10 rounded w-16"></div>
                      <div className="h-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Features Grid Below Dashboard */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Real-time Collaboration', desc: 'Work with your team simultaneously' },
            { title: 'AI Suggestions', desc: 'Smart recommendations based on intent' },
            { title: 'Version History', desc: 'Track all design decisions and changes' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover className="p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
