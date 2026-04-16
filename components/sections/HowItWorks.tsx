'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Share Your Vision',
      description: 'Upload your design mockups, sketches, or share your design intent through our intuitive interface.',
    },
    {
      number: '02',
      title: 'AI Analyzes Intent',
      description: 'Our AI engine reads your design patterns, colors, typography, and overall aesthetic direction.',
    },
    {
      number: '03',
      title: 'Generate Variations',
      description: 'Get multiple design variations that respect your intent while exploring new possibilities.',
    },
    {
      number: '04',
      title: 'Refine & Export',
      description: 'Refine details with smart feedback, then export production-ready assets and code.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How PixelPerfect Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A simple workflow from vision to execution
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <GlassCard hover glow="blue" className="p-8">
                  <div className="text-5xl font-bold gradient-text mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
