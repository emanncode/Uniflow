"use client";

import { motion, Variants } from 'framer-motion'
import { Building2, CalendarCheck, Smartphone } from 'lucide-react'
import { APP_URL, universityPortalHost } from '@/lib/domain'
import { Caveat } from 'next/font/google'
import SectionBackground from '@/components/landing/SectionBackground'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const stepLabelVariants = {
  initial: { color: 'var(--text-muted)' },
  hover: { color: 'var(--brand)', transition: { duration: 0.3 } }
}

const detailCircleVariants = {
  initial: {
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--border-primary)'
  },
  hover: {
    backgroundColor: '#062216',
    borderColor: 'var(--brand)',
    transition: { duration: 0.3 }
  }
}

const detailDotVariants = {
  initial: { backgroundColor: 'var(--text-muted)' },
  hover: { backgroundColor: 'var(--brand)', transition: { duration: 0.3 } }
}

const detailTextVariants = {
  initial: { color: 'var(--text-muted)' },
  hover: { color: 'var(--text-secondary)', transition: { duration: 0.3 } }
}

const stepIconVariants: Record<string, Variants> = {
  building: {
    initial: {
      color: 'var(--text-secondary)',
      scale: 1,
      y: 0,
    },
    hover: {
      color: 'var(--brand)',
      scale: 1.15,
      y: -2,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
  },
  calendar: {
    initial: {
      color: 'var(--text-secondary)',
      rotate: 0,
      scale: 1,
    },
    hover: {
      color: 'var(--brand)',
      rotate: [0, -10, 10, -5, 5, 0],
      scale: 1.12,
      transition: { duration: 0.5 },
    },
  },
  phone: {
    initial: {
      color: 'var(--text-secondary)',
      rotate: 0,
      scale: 1,
    },
    hover: {
      color: 'var(--brand)',
      rotate: [0, -8, 8, -8, 8, 0],
      scale: 1.15,
      transition: { duration: 0.4 },
    },
  },
};

const steps = [
  {
    number: '01',
    icon: Building2,
    animationKey: 'building' as const,
    title: 'University registers',
    desc: `A university rep signs up on ${APP_URL.replace(/^https?:\/\//, '')}. After Uniflow Admin approves, they get their own portal — ${universityPortalHost('aaua')} — instantly.`,
    role: 'University Admin',
    details: [
      'Fill registration form',
      'Uniflow Admin reviews & approves',
      'Subdomain auto-generated',
      'Login credentials sent by email',
    ],
  },
  {
    number: '02',
    icon: CalendarCheck,
    animationKey: 'calendar' as const,
    title: 'Faculty sets up timetable',
    desc: 'University Admin sets up faculties, departments, and lecturers. The timetable is built, conflict-checked, and published.',
    role: 'University Admin',
    details: [
      'Create faculties and departments',
      'Onboard lecturers and assign courses',
      'Build timetable with conflict detection',
      'Publish — goes live for everyone',
    ],
  },
  {
    number: '03',
    icon: Smartphone,
    animationKey: 'phone' as const,
    title: 'Students & lecturers connect',
    desc: 'Everyone downloads the Uniflow app, selects their university and gets instant access to their live timetable with real-time updates.',
    role: 'Lecturer & Student',
    details: [
      'Download Uniflow mobile app',
      'Select university + department',
      'View live timetable instantly',
      'Get push notifications for changes',
    ],
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: 'clamp(80px, 20vw, 120px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SectionBackground />

      <style>{`
        @media (max-width: 991px) {
          .howitworks-blueprint { display: none !important; }
        }
      `}</style>

      {/* Background Blueprint - Flow Pipeline */}
      <div
        className="howitworks-blueprint"
        style={{
          position: "absolute",
          top: "12%",
          left: "3vw",
          width: "280px",
          height: "280px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="80" cy="120" r="25" stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="80" cy="120" r="5" stroke="var(--brand)" strokeWidth="1" />
          
          <circle cx="160" cy="180" r="40" stroke="var(--brand)" strokeWidth="1" strokeDasharray="8 4" />
          <circle cx="160" cy="180" r="10" stroke="var(--brand)" strokeWidth="1" />

          <path d="M 80,95 L 160,140 L 240,180" stroke="var(--brand)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 80,145 L 160,220 L 240,260" stroke="var(--brand)" strokeWidth="1" strokeDasharray="4 4" />

          <line x1="160" y1="50" x2="160" y2="140" stroke="var(--brand)" strokeWidth="0.75" />
          <rect x="135" y="35" width="50" height="15" rx="2" stroke="var(--brand)" strokeWidth="0.75" />
          <text x="160" y="45" fill="var(--brand)" fontSize="6" textAnchor="middle" fontFamily="monospace">CORE_ENGINE</text>
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
              fontSize: '42px',
              fontWeight: 700,
              color: 'var(--brand)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            How it Works
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
              Up and running in{' '}
              <span style={{
                color: 'var(--brand)',
                textShadow: '0 0 30px rgba(0, 135, 81,0.3)',
              }}>
                three steps.
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
            No lengthy onboarding. No technical setup.
            A university can be fully live on Uniflow in under a day.
          </motion.p>
        </motion.div>

        {/* ── steps ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '24px',
          position: 'relative',
        }}>

          {/* connector line — desktop only */}
          <div style={{
            position: 'absolute',
            top: '52px',
            left: 'calc(16.67% + 20px)',
            right: 'calc(16.67% + 20px)',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{
                left: ["-10%", "110%"],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                top: 0,
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--brand), transparent)",
                boxShadow: "0 0 6px var(--brand)",
              }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover="hover"
                style={{ position: 'relative', zIndex: 1 }}
              >
                {/* step number circle */}
                <motion.div
                  style={{
                    width: '52px', height: '52px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                  }}
                >
                  <motion.div
                    variants={stepIconVariants[step.animationKey]}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon
                      size={22}
                      color="currentColor"
                      strokeWidth={1.8}
                    />
                  </motion.div>
                </motion.div>

                {/* card */}
                <motion.div
                  variants={{
                    hover: {
                      borderColor: 'var(--brand)',
                      y: -4,
                    }
                  }}
                  style={{
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'clamp(20px, 2.5vw, 28px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="cursor-default"
                >
                  {/* step label */}
                  <motion.div
                    variants={stepLabelVariants}
                    style={{
                      fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      marginBottom: '10px',
                    }}
                  >
                    Step {step.number} · {step.role}
                  </motion.div>

                  <h3 style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: '0 0 12px',
                  }}>
                    {step.title}
                  </h3>

                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.75,
                    margin: '0 0 20px',
                  }}>
                    {step.desc}
                  </p>

                  {/* detail checklist */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-primary)',
                  }}>
                    {step.details.map((detail, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + j * 0.07 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                        }}
                      >
                        <motion.div
                          variants={detailCircleVariants}
                          style={{
                            width: '16px', height: '16px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}
                        >
                          <motion.div
                            variants={detailDotVariants}
                            style={{
                              width: '5px', height: '5px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--text-muted)',
                            }} />
                        </motion.div>
                        <motion.span
                          variants={detailTextVariants}
                          style={{
                            fontSize: '12px',
                            lineHeight: 1.4,
                          }}
                        >
                          {detail}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section >
  )
}