'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Building2, CalendarCheck, Smartphone } from 'lucide-react'
import { APP_URL, universityPortalHost } from '@/lib/domain'
import SectionBackground from '@/components/landing/SectionBackground'

const steps = [
  {
    number: '01',
    icon: Building2,
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
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

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
            background: 'linear-gradient(90deg, rgba(0, 135, 81,0.4), rgba(0, 135, 81,0.1), rgba(0, 135, 81,0.4))',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {steps.map((step, i) => {
            const Icon = step.icon
            const active = hoveredStep === i

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {/* step number circle */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-secondary)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  <Icon
                    size={22}
                    color={'var(--text-secondary)'}
                    strokeWidth={1.8}
                  />
                </div>

                {/* card */}
                <motion.div
                  onHoverStart={() => setHoveredStep(i)}
                  onHoverEnd={() => setHoveredStep(null)}
                  whileHover={{
                    border: '1px solid rgba(0, 135, 81,0.2)',
                    backgroundColor: 'rgba(0, 135, 81,0.05)',
                  }}
                  style={{
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-card)',
                    padding: 'clamp(20px, 2.5vw, 28px)',
                  }}
                  className="card hover:border-[rgba(0, 135, 81,0.2)] hover:bg-[rgba(0, 135, 81,0.05)] transition-colors duration-300 cursor-default"
                >
                  {/* step label */}
                  <div style={{
                    fontSize: '11px', fontWeight: 700,
                    color: active ? 'var(--brand)' : 'var(--text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    marginBottom: '10px',
                  }}>
                    Step {step.number} · {step.role}
                  </div>

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
                        <div style={{
                          width: '16px', height: '16px',
                          borderRadius: '50%',
                          backgroundColor: active
                            ? 'rgba(0, 135, 81,0.15)'
                            : 'rgba(255,255,255,0.04)',
                          border: active
                            ? '1px solid rgba(0, 135, 81,0.3)'
                            : '1px solid var(--border-secondary)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}>
                          <div style={{
                            width: '5px', height: '5px',
                            borderRadius: '50%',
                            backgroundColor: active
                              ? 'var(--brand)'
                              : 'var(--text-muted)',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: active ? 'var(--text-secondary)' : 'var(--text-muted)',
                          lineHeight: 1.4,
                        }}>
                          {detail}
                        </span>
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