'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from './Button'
import { GradientText } from './GradientText'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -z-10"></div>

      <motion.div
        className="max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial={false}
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          className="mb-8 inline-block"
          variants={itemVariants}
        >
          <div className="px-4 py-2 rounded-full bg-white/5 border border-purple-500/30 backdrop-blur">
            <p className="text-sm text-purple-300 font-medium">
              AI-Powered Design Intent Detection
            </p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          variants={itemVariants}
        >
          Your Design Intent,{' '}
          <GradientText variant="rainbow">Perfectly Executed</GradientText>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          PixelPerfect AI keeps Figma intent, design tokens, and coded UI in sync so teams can catch drift before it ships.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          variants={itemVariants}
        >
          <Link href="/diff">
            <Button variant="primary" size="lg">
              Start Live Review
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Open Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          className="mt-16 relative h-96 md:h-[500px] rounded-2xl overflow-hidden"
          variants={itemVariants}
        >
          <div className="glass-card-hover w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/workflow-diagram.jpg"
              alt="PixelPerfect AI design-to-dev workflow diagram"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
