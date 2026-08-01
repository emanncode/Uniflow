'use client'

import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import SectionBackground from '@/components/landing/SectionBackground'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for small universities getting started with Uniflow.',
    highlight: false,
    cta: 'Get started free',
    ctaHref: '/register',
    features: [
      'Up to 500 students',
      'Up to 20 lecturers',
      '1 faculty, 5 departments',
      'Real-time class updates',
      'Push notifications',
      'Basic timetable management',
      'Resource sharing',
      'Email support',
    ],
    missing: [
      'Conflict detection',
      'Advanced analytics',
      'Priority support',
      'Custom subdomain branding',
    ],
  },
  {
    name: 'Institution',
    price: '$49',
    period: 'per month',
    desc: 'For growing universities that need the full Uniflow experience.',
    highlight: true,
    cta: 'Start free trial',
    ctaHref: '/register',
    badge: 'Most Popular',
    features: [
      'Unlimited students',
      'Unlimited lecturers',
      'Unlimited faculties & departments',
      'Real-time class updates',
      'Push notifications',
      'Full timetable management',
      'Smart conflict detection',
      'Resource sharing',
      'Advanced analytics dashboard',
      'Custom subdomain branding',
      'Priority email & chat support',
    ],
    missing: [],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    desc: 'For large universities or consortiums with special requirements.',
    highlight: false,
    cta: 'Contact sales',
    ctaHref: '/register',
    features: [
      'Everything in Institution',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Custom integrations',
      'On-premise deployment option',
      'Dedicated account manager',
      'Training & onboarding',
      'White-label option',
    ],
    missing: [],
  },
]

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        padding: 'clamp(80px, 20vw, 120px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SectionBackground />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'clamp(48px, 6vw, 80px)', textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '999px',
            border: '1px solid rgba(0, 135, 81,0.2)',
            backgroundColor: 'rgba(0, 135, 81,0.06)',
            fontSize: '11px', fontWeight: 600,
            color: 'var(--brand)', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, marginBottom: '20px',
          }}>
            Pricing
          </div>

          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(32px, 5vw, 60px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: 'var(--text-primary)',
                margin: '0 0 16px',
              }}
            >
              Simple, honest{' '}
              <span style={{ color: 'var(--brand)', textShadow: '0 0 30px rgba(0, 135, 81,0.3)' }}>
                pricing.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: 'var(--text-muted)',
              lineHeight: 1.75,
              margin: '0 auto',
              maxWidth: '480px',
            }}
          >
            Start free. Upgrade when you&apos;re ready.
            No hidden fees, no long-term contracts.
          </motion.p>
        </motion.div>

        {/* ── plans grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4 } }}
              style={{
                borderRadius: 'var(--radius-xl)',
                border: plan.highlight
                  ? '1px solid rgba(0, 135, 81,0.4)'
                  : '1px solid var(--border-primary)',
                backgroundColor: plan.highlight
                  ? 'rgba(0, 135, 81,0.09)'
                  : 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 'clamp(28px, 3.5vw, 40px)',
                position: 'relative' as const,
                overflow: 'hidden',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                boxShadow: plan.highlight ? '0 12px 48px rgba(0, 135, 81,0.12)' : '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* glow for highlighted plan */}
              {plan.highlight && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '220px', height: '220px',
                    background: 'radial-gradient(circle, rgba(0, 135, 81,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* badge */}
              {plan.badge && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '999px',
                  backgroundColor: 'var(--brand)',
                  fontSize: '10px', fontWeight: 700,
                  color: '#fff', letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  marginBottom: '16px',
                }}>
                  <Zap size={10} />
                  {plan.badge}
                </div>
              )}

              {/* plan name */}
              <div style={{
                fontSize: '13px', fontWeight: 700,
                color: plan.highlight ? 'var(--brand)' : 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                marginBottom: '12px',
              }}>
                {plan.name}
              </div>

              {/* price */}
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {plan.period}
                </span>
              </div>

              <p style={{
                fontSize: '13px', color: 'var(--text-muted)',
                lineHeight: 1.6, marginBottom: '28px',
              }}>
                {plan.desc}
              </p>

              {/* CTA */}
              <Link href={plan.ctaHref} style={{ textDecoration: 'none', display: 'block', marginBottom: '28px' }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: plan.highlight ? '0 0 32px rgba(0, 135, 81,0.35)' : '0 4px 20px rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: '14px 22px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: plan.highlight ? '1px solid var(--brand)' : '1.5px solid var(--border-secondary)',
                    backgroundColor: plan.highlight ? 'var(--brand)' : 'transparent',
                    color: plan.highlight ? '#fff' : 'var(--text-primary)',
                    boxShadow: plan.highlight ? '0 8px 32px rgba(0, 135, 81,0.3)' : 'none',
                    position: 'relative' as const,
                  }}
                >
                  {plan.cta}
                </motion.button>
              </Link>

              {/* divider */}
              <div style={{
                height: '1px',
                backgroundColor: plan.highlight
                  ? 'rgba(0, 135, 81,0.15)'
                  : 'var(--border-primary)',
                marginBottom: '24px',
              }} />

              {/* features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((feature, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + j * 0.05 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                        backgroundColor: plan.highlight
                          ? 'rgba(0, 135, 81,0.2)'
                          : 'rgba(255,255,255,0.06)',
                        border: plan.highlight
                          ? '1px solid rgba(0, 135, 81,0.4)'
                          : '1px solid var(--border-secondary)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                      <Check
                        size={10}
                        color={plan.highlight ? 'var(--brand)' : 'var(--text-muted)'}
                        strokeWidth={3}
                      />
                    </motion.div>
                    <span style={{
                      fontSize: '13px',
                      color: plan.highlight ? 'var(--text-secondary)' : 'var(--text-muted)',
                      lineHeight: 1.6,
                      fontWeight: plan.highlight ? 500 : 400,
                    }}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── bottom note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginTop: '40px',
            lineHeight: 1.6,
          }}
        >
          All plans include a 30-day free trial. No credit card required to get started.{' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            Need a custom plan for your consortium?{' '}
          </span>
          <Link href="/register" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
            Talk to us →
          </Link>
        </motion.p>

      </div>
    </section>
  )
}