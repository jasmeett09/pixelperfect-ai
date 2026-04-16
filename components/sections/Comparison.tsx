'use client'

import { motion } from 'framer-motion'
import { ComparisonPanel } from './ComparisonPanel'

export function Comparison() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            PixelPerfect vs Traditional Design
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how AI-powered design intent detection changes everything
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <ComparisonPanel
              title="Traditional Design"
              items={[
                { label: 'Design Time', value: '2-4 weeks' },
                { label: 'Communication Overhead', value: true },
                { label: 'Revision Cycles', value: true },
                { label: 'Intent Preservation', value: false },
                { label: 'Cost Effective', value: false },
                { label: 'Production Ready', value: false },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">VS</div>
              <p className="text-gray-400 text-sm">Choose your approach</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ComparisonPanel
              title="PixelPerfect AI"
              highlighted
              badge="Recommended"
              items={[
                { label: 'Design Time', value: 'Minutes' },
                { label: 'Communication Overhead', value: false },
                { label: 'Revision Cycles', value: false },
                { label: 'Intent Preservation', value: true },
                { label: 'Cost Effective', value: true },
                { label: 'Production Ready', value: true },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
