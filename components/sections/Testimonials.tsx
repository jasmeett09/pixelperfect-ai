'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

export function Testimonials() {
  const testimonials = [
    {
      quote: 'PixelPerfect AI understood my design vision instantly. What would have taken weeks now takes hours.',
      author: 'Sarah Chen',
      title: 'Design Lead at TechVision',
      avatar: '🎨',
    },
    {
      quote: 'The AI suggestions are so intelligent. It&apos;s like having a senior designer on my team 24/7.',
      author: 'Marcus Johnson',
      title: 'Founder at DesignStudio',
      avatar: '✨',
    },
    {
      quote: 'Team collaboration improved dramatically. Real-time feedback and version control saved us countless meetings.',
      author: 'Emily Rodriguez',
      title: 'Creative Director at ByteDesign',
      avatar: '🚀',
    },
    {
      quote: 'The exported code quality is production-ready. Our developers love how clean and well-organized it is.',
      author: 'Alex Kim',
      title: 'Tech Lead at WebWorks',
      avatar: '💻',
    },
  ]

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by Designers Worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what design professionals are saying about PixelPerfect
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover glow="pink" className="p-8 flex flex-col h-full">
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-200 mb-6 flex-1 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
