'use client'

import { motion, Variants } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { Caveat } from 'next/font/google'
import SectionBackground from '@/components/landing/SectionBackground'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const checkCircleVariants = (highlight: boolean): Variants => ({
  initial: {
    scale: 1,
    backgroundColor: highlight ? 'rgba(0, 135, 81, 0.2)' : 'rgba(255,255,255,0.06)',
    borderColor: highlight ? 'rgba(0, 135, 81, 0.4)' : 'var(--border-secondary)',
    color: highlight ? 'var(--brand)' : 'var(--text-muted)',
  },
  hover: {
    scale: 1.25,
    backgroundColor: highlight ? 'rgba(0, 135, 81, 0.3)' : 'rgba(0, 135, 81, 0.2)',
    borderColor: highlight ? 'var(--brand)' : 'rgba(0, 135, 81, 0.4)',
    color: 'var(--brand)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 12 }
  }
})

const checkTextVariants = (highlight: boolean): Variants => ({
  initial: {
    color: highlight ? 'var(--text-highlight-feature)' : 'var(--text-muted)',
    x: 0
  },
  hover: {
    color: highlight ? 'var(--text-highlight-price)' : 'var(--text-primary)',
    x: 3,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
  }
})

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

      <style>{`
        .blueprint-main {
          width: clamp(120px, 20vw, 280px);
          height: clamp(120px, 20vw, 280px);
          opacity: 0.12;
        }
        .blueprint-secondary, .blueprint-tertiary {
          display: block;
          width: clamp(120px, 20vw, 280px);
          height: clamp(120px, 20vw, 280px);
          opacity: 0.12;
        }
        @media (min-width: 992px) {
          .blueprint-main {
            width: 280px;
            height: 280px;
            opacity: 0.22;
          }
          .blueprint-secondary, .blueprint-tertiary {
            width: 280px;
            height: 280px;
            opacity: 0.22;
          }
        }
        @media (max-width: 991px) {
          .blueprint-secondary, .blueprint-tertiary {
            display: none !important;
          }
        }
      `}</style>

      {/* Background Blueprint 1 - Scaling Grid (Main) */}
      <div
        className="blueprint-main"
        style={{
          position: "absolute",
          top: "15%",
          right: "3vw",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <line x1="20" y1="260" x2="280" y2="260" stroke="var(--brand)" strokeWidth="1.5" />
          <line x1="40" y1="20" x2="40" y2="280" stroke="var(--brand)" strokeWidth="1.5" />

          <line x1="40" y1="200" x2="280" y2="200" stroke="var(--brand)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="40" y1="140" x2="280" y2="140" stroke="var(--brand)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="40" y1="80" x2="280" y2="80" stroke="var(--brand)" strokeWidth="0.5" strokeDasharray="3 3" />

          <rect x="70" y="220" width="30" height="40" stroke="var(--brand)" strokeWidth="1" />
          <rect x="130" y="160" width="30" height="100" stroke="var(--brand)" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="190" y="100" width="30" height="160" stroke="var(--brand)" strokeWidth="1" />

          <path d="M 85,220 L 145,160 L 205,100 L 265,50" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="85" cy="220" r="3" fill="var(--brand)" />
          <circle cx="145" cy="160" r="3" fill="var(--brand)" />
          <circle cx="205" cy="100" r="3" fill="var(--brand)" />
        </svg>
      </div>

      {/* Background Blueprint 2 - Feature Document List (Secondary) */}
      <div
        className="blueprint-secondary"
        style={{
          position: "absolute",
          top: "25%",
          left: "3vw",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="60" y="60" width="180" height="180" rx="4" stroke="var(--brand)" strokeWidth="1.5" />
          <circle cx="90" cy="100" r="5" stroke="var(--brand)" strokeWidth="1" />
          <path d="M 88,100 L 90,102 L 93,98" stroke="var(--brand)" strokeWidth="1" fill="none" />
          <line x1="110" y1="100" x2="210" y2="100" stroke="var(--brand)" strokeWidth="1" />
          <circle cx="90" cy="140" r="5" stroke="var(--brand)" strokeWidth="1" />
          <path d="M 88,140 L 90,142 L 93,138" stroke="var(--brand)" strokeWidth="1" fill="none" />
          <line x1="110" y1="140" x2="210" y2="140" stroke="var(--brand)" strokeWidth="1" />
          <circle cx="90" cy="180" r="5" stroke="var(--brand)" strokeWidth="1" />
          <path d="M 88,180 L 90,182 L 93,178" stroke="var(--brand)" strokeWidth="1" fill="none" />
          <line x1="110" y1="180" x2="210" y2="180" stroke="var(--brand)" strokeWidth="1" />
        </svg>
      </div>

      {/* Background Blueprint 3 - Growth Line Nodes (Tertiary) */}
      <div
        className="blueprint-tertiary"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "35vw",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 50,220 C 120,200 180,100 250,80" stroke="var(--brand)" strokeWidth="1.5" />
          <circle cx="50" cy="220" r="4" fill="var(--brand)" />
          <circle cx="150" cy="160" r="4" fill="var(--brand)" />
          <circle cx="250" cy="80" r="4" fill="var(--brand)" />
          <line x1="50" y1="220" x2="50" y2="250" stroke="var(--brand)" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="150" y1="160" x2="150" y2="250" stroke="var(--brand)" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="250" y1="80" x2="250" y2="250" stroke="var(--brand)" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="30" y1="250" x2="270" y2="250" stroke="var(--brand)" strokeWidth="1" />
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'clamp(48px, 6vw, 80px)', textAlign: 'center' }}
        >
          <div
            className={caveat.className}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'clamp(24px, 5vw, 42px)',
              fontWeight: 700,
              color: 'var(--brand)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
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
              whileHover="hover"
              variants={{
                hover: {
                  y: -8,
                  transition: { duration: 0.4 },
                },
              }}
              style={{
                borderRadius: 'var(--radius-sm)',
                border: plan.highlight
                  ? '1px solid var(--border-highlight)'
                  : '1px solid var(--border-primary)',
                backgroundColor: plan.highlight
                  ? 'var(--bg-highlight)'
                  : 'var(--bg-secondary)',
                padding: 'clamp(28px, 3.5vw, 40px)',
                position: 'relative' as const,
                overflow: 'hidden',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Background Analytics Grid/Graph inside cards */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  opacity: plan.highlight ? 0.12 : 0.04,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                  {/* Clean trend line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    d="M0,60 Q75,50 150,35 T300,15"
                    stroke="var(--brand)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  {/* Dotted helper line */}
                  <line x1="0" y1="40" x2="300" y2="40" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="150" cy="35" r="2.5" fill="var(--brand)" />
                  <circle cx="300" cy="15" r="2.5" fill="var(--brand)" />
                </svg>
              </div>
              {/* badge */}
              {plan.badge && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '3px',
                  backgroundColor: 'var(--brand)',
                  fontSize: '10px', fontWeight: 700,
                  color: '#fff', letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  marginBottom: '16px',
                }}>
                  <motion.div
                    variants={{
                      hover: {
                        scale: [1, 1.3, 0.9, 1.1, 1],
                        rotate: [0, -15, 15, 0],
                        transition: { duration: 0.5 },
                      },
                    }}
                    style={{ display: 'inline-flex' }}
                  >
                    <Zap size={10} />
                  </motion.div>
                  {plan.badge}
                </div>
              )}

              {/* plan name */}
              <div style={{
                fontSize: '13px', fontWeight: 700,
                color: plan.highlight ? 'var(--text-highlight-title)' : 'var(--text-muted)',
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
                  color: plan.highlight ? 'var(--text-highlight-price)' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: plan.highlight ? 'var(--text-highlight-desc)' : 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {plan.period}
                </span>
              </div>

              <p style={{
                fontSize: '13px',
                color: plan.highlight ? 'var(--text-highlight-desc)' : 'var(--text-muted)',
                lineHeight: 1.6, marginBottom: '28px',
              }}>
                {plan.desc}
              </p>

              {/* CTA */}
              <Link href={plan.ctaHref} style={{ textDecoration: 'none', display: 'block', marginBottom: '28px' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: '14px 22px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: plan.highlight ? '1px solid var(--brand)' : '1px solid var(--border-secondary)',
                    backgroundColor: plan.highlight ? 'var(--brand)' : 'transparent',
                    color: plan.highlight ? '#fff' : 'var(--text-primary)',
                    boxShadow: 'none',
                    position: 'relative' as const,
                  }}
                >
                  {plan.cta}
                </motion.button>
              </Link>

              {/* divider */}
              <div style={{
                height: '1px',
                backgroundColor: 'var(--border-primary)',
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
                    whileHover="hover"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'default' }}
                  >
                    <motion.div
                      variants={checkCircleVariants(plan.highlight)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }}
                    >
                      <Check
                        size={10}
                        color="currentColor"
                        strokeWidth={3}
                      />
                    </motion.div>
                    <motion.span
                      variants={checkTextVariants(plan.highlight)}
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.6,
                        fontWeight: plan.highlight ? 500 : 400,
                      }}
                    >
                      {feature}
                    </motion.span>
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