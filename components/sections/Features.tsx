'use client'

import { motion } from 'framer-motion'
import { FeatureCard } from './FeatureCard'

export function Features() {
  const features = [
    {
      icon: '📊',
      title: 'Figma Data Extraction',
      description: 'Automatically extract design tokens (colors, typography, spacing, shadows) and component structure directly from Figma files via API.',
    },
    {
      icon: '📸',
      title: 'Dual Input Modes',
      description: 'Upload screenshots for static designs or connect live URLs using Puppeteer/Playwright for dynamic design states.',
    },
    {
      icon: '🤖',
      title: 'AI Intent Engine',
      description: 'Multi-level analysis: pixel-perfect matching, token validation, DOM structure mapping, and design system hierarchy checking.',
    },
    {
      icon: '🔍',
      title: 'Mismatch Detection',
      description: 'Identify implementation gaps in spacing, typography, colors, borders, and interactive states with severity-based ranking.',
    },
    {
      icon: '📋',
      title: 'Smart Feedback Dashboard',
      description: 'Visual issue lists, root cause analysis, AI-generated code fixes, and comparison snapshots all in one place.',
    },
    {
      icon: '🔔',
      title: 'Drift Tracking & Alerts',
      description: 'Real-time Figma webhook sync that monitors design changes and alerts teams to implementation drift automatically.',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            End-to-End Design-to-Dev Workflow
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Complete pipeline from Figma extraction through implementation validation and drift detection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
