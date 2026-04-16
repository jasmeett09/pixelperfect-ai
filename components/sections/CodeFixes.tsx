'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function CodeFixes() {
  const codeBlocks = [
    {
      language: 'React',
      title: 'Auto-Generated Components',
      code: `export function Button({ intent, size }) {
  return (
    <button className={intent.className}>
      {intent.label}
    </button>
  )
}`,
    },
    {
      language: 'Tailwind',
      title: 'Responsive Classes',
      code: `className="md:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6 lg:gap-8
  p-4 md:p-6 lg:p-8
  text-sm md:text-base lg:text-lg"`,
    },
    {
      language: 'CSS',
      title: 'Design Tokens',
      code: `:root {
  --primary: hsl(280 85% 55%);
  --secondary: hsl(320 80% 60%);
  --radius: 0.875rem;
}`,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-40 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Export Production-Ready Code
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get clean, optimized code in your preferred framework
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {codeBlocks.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard glow="purple" className="overflow-hidden flex flex-col h-full">
                <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <p className="text-sm font-mono text-purple-300">{block.language}</p>
                  <h3 className="text-white font-semibold mt-1">{block.title}</h3>
                </div>
                <pre className="flex-1 p-6 overflow-auto">
                  <code className="text-sm text-gray-300 font-mono leading-relaxed">
                    {block.code}
                  </code>
                </pre>
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
          <GlassCard hover glow="blue" className="p-8 inline-block">
            <p className="text-gray-300 mb-4">Supports all major frameworks:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['React', 'Vue', 'Svelte', 'Angular', 'Next.js', 'Nuxt'].map((fw) => (
                <span key={fw} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-medium">
                  {fw}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
