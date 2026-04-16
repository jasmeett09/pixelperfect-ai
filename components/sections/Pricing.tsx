'use client'

import { motion } from 'framer-motion'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual designers',
      highlighted: false,
      features: [
        'Up to 5 projects',
        'Design intent detection',
        'Basic AI suggestions',
        'Export to React',
        'Community support',
      ],
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/month',
      description: 'For professional design teams',
      highlighted: true,
      features: [
        'Unlimited projects',
        'Advanced AI features',
        'Real-time collaboration',
        'Export to all frameworks',
        'API access',
        'Priority support',
        'Custom design tokens',
        'Team management',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Quote',
      description: 'For large organizations',
      highlighted: false,
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'SSO & SAML',
        'Advanced security',
        'On-premise option',
        'SLA guarantee',
        'Training & onboarding',
      ],
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard
                hover
                glow={plan.highlighted ? 'purple' : 'blue'}
                className={`p-8 flex flex-col h-full ${
                  plan.highlighted ? 'border-purple-500/50 bg-purple-500/5' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>

                <Button
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full mb-8"
                >
                  Get Started
                </Button>

                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-300 text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard glow="blue" className="p-8 inline-block">
            <p className="text-gray-300">All plans include a 14-day free trial. No credit card required.</p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
