'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from './Button'
import { GradientText } from './GradientText'

export function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-pink-600/10 to-blue-600/10 -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Your Design Intent Into <GradientText variant="rainbow">Reality</GradientText>
          </h2>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of designers who are already using PixelPerfect AI to create pixel-perfect designs in minutes, not weeks.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                Open Dashboard
              </Button>
            </Link>
            <Link href="/diff">
              <Button variant="outline" size="lg">
                Run Live Diff
              </Button>
            </Link>
          </motion.div>

          <motion.p
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            No credit card required. Get started in less than a minute.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
