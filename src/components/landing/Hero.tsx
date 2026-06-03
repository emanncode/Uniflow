'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Ticker from '@/components/hero/Ticker'
import NotificationPop from '@/components/hero/NotificationPop'
import LaptopMockup from '../hero/LaptopMockup'
import PhoneMockup from '../hero/PhoneMockup'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const { scrollYProgress } = useScroll({
    target: mounted ? containerRef : undefined,
    offset: ['start start', 'end start'],
  })

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const bgY = useSpring(rawY, { stiffness: 60, damping: 20 })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const smoothMouseX = useSpring(mouseX, { stiffness: 80, damping: 25 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 80, damping: 25 })

  const smoothLaptopRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [3, -3])
  const smoothLaptopRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5])
  const smoothPhoneX = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8])
  const smoothPhoneY = useTransform(smoothMouseY, [-0.5, 0.5], [-8, 8])

  useEffect(() => {
    setMounted(true)
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5
      const y = (e.clientY / window.innerHeight) - 0.5
      mouseX.set(x)
      mouseY.set(y)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  if (!mounted) return null

  return (
    <div ref={containerRef}>

      <section className='mt-15! md:mt-0!' style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'clamp(40px, 6vw, 80px)',
      }}>

        {/* ── backgrounds ── */}
        <motion.div style={{ y: bgY, position: 'relative', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,220,150,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,150,0.02) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }} />
          <div style={{
            position: 'absolute', top: '-15%', left: '50%',
            transform: 'translateX(-50%)',
            width: '1000px', height: '600px',
            background: 'radial-gradient(ellipse, rgba(110,231,183,0.07) 0%, transparent 60%)',
          }} />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: '10%', left: '-5%',
              width: '500px', height: '400px',
              background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 60%)',
            }}
          />
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            style={{
              position: 'absolute', top: '10%', right: '-5%',
              width: '400px', height: '400px',
              background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%)',
            }}
          />
        </motion.div>

        {/* ── UNIFLOW watermark ── */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(120px, 20vw, 280px)',
          fontWeight: 900,
          color: 'rgba(255,255,255,0.012)',
          letterSpacing: '-0.06em',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}>
          UNIFLOW
        </div>

        <motion.div
          style={{ opacity: heroOpacity, position: 'relative', zIndex: 1 }}
          className="container"
        >
          {/* ── badge ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '999px',
              border: '1px solid rgba(110,231,183,0.2)',
              backgroundColor: 'rgba(110,231,183,0.06)',
              fontSize: '11px', color: 'var(--brand)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  backgroundColor: 'var(--brand)',
                  boxShadow: '0 0 6px var(--brand)',
                  display: 'inline-block',
                }}
              />
              Live updates
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Now in development — be the first university on Uniflow
            </span>
          </motion.div>

          {/* ── main grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
          }}>

            {/* ── LEFT — text ── */}
            <div>
              {/* eyebrow */}
              <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'block',
                    fontSize: 'clamp(11px, 1.2vw, 13px)',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  For universities worldwide
                </motion.span>
              </div>

              {/* headline lines */}
              {[
                { text: 'No more', color: 'var(--text-primary)' },
                { text: 'showing up', color: 'var(--text-primary)' },
                { text: 'to empty halls.', color: 'var(--brand)', glow: true },
              ].map((line, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <motion.h1
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontSize: 'clamp(42px, 6vw, 80px)',
                      fontWeight: 900,
                      lineHeight: 1.0,
                      letterSpacing: '-0.04em',
                      color: line.color,
                      margin: 0,
                      textShadow: line.glow ? '0 0 40px rgba(110,231,183,0.25)' : 'none',
                    }}
                  >
                    {line.text}
                  </motion.h1>
                </div>
              ))}

              <div style={{ height: '20px' }} />

              {/* subheadline */}
              <div style={{ overflow: 'hidden' }}>
                <motion.h2
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: 'clamp(16px, 2.2vw, 22px)',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  The campus always knew.{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Now your phone does too.
                  </span>
                </motion.h2>
              </div>

              {/* body */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.85,
                  margin: '20px 0 36px',
                  maxWidth: '440px',
                  borderLeft: '2px solid rgba(110,231,183,0.3)',
                  paddingLeft: '16px',
                }}
              >
                Class canceled. Did you know? With Uniflow, you would.
                One platform. Every lecture. Zero surprises —
                from <strong style={{ color: 'var(--text-secondary)' }}>Ondo</strong> to{' '}
                <strong style={{ color: 'var(--text-secondary)' }}>London.</strong>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}
              >
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(110,231,183,0.25)' }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    style={{
                      padding: '15px 32px', fontSize: '14px', fontWeight: 700,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--brand)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    Register Your University →
                  </motion.button>
                </Link>
                <Link href="#how-it-works" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.12)' }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-btn"
                    style={{
                      padding: '15px 32px', fontSize: '14px', fontWeight: 700,
                      borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    See how it works
                  </motion.button>
                </Link>
              </motion.div>

              {/* stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1px',
                  backgroundColor: 'var(--border-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {[
                  { value: '1', unit: 'app', label: 'all universities' },
                  { value: '6', unit: 'roles', label: 'access control' },
                  { value: '0', unit: 'chaos', label: 'missed classes' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    style={{
                      padding: '18px 12px',
                      backgroundColor: 'var(--bg-card)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      fontSize: 'clamp(22px, 3vw, 32px)',
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      color: 'var(--text-primary)',
                    }}>
                      {stat.value}
                      <span style={{
                        color: 'var(--brand)',
                        fontSize: '0.55em',
                        marginLeft: '2px',
                        fontWeight: 700,
                      }}>
                        {stat.unit}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '10px', color: 'var(--text-muted)',
                      marginTop: '5px', fontWeight: 500,
                    }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT — devices ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '420px',
                paddingTop: '60px',
                paddingBottom: '60px',
              }}
            >

              {/* notification — top left */}
              <div style={{
                position: 'absolute', top: '10px', left: '0px', zIndex: 20,
              }}>
                <NotificationPop
                  text="CSC301 canceled today"
                  sub="Just now · 47 students notified"
                  icon="🔔" color="#ef4444" delay={1600}
                />
              </div>

              {/* notification — right middle */}
              <div style={{
                position: 'absolute', top: '35%', right: '-10px', zIndex: 20,
              }}>
                <NotificationPop
                  text="MTH201 moved to LT5"
                  sub="2 min ago · Confirmed by 12"
                  icon="📍" color="#3b82f6" delay={2200}
                />
              </div>

              {/* notification — bottom left */}
              <div style={{
                position: 'absolute', bottom: '10px', left: '10px', zIndex: 20,
              }}>
                <NotificationPop
                  text="PHY101 delayed 30min"
                  sub="5 min ago · Dr. Adeyemi"
                  icon="⏰" color="#f59e0b" delay={2800}
                />
              </div>

              {/* laptop — behind, slightly tilted */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                style={{
                  rotateX: smoothLaptopRotateX,
                  rotateY: smoothLaptopRotateY,
                  transformPerspective: 1200,
                  position: 'absolute',
                  bottom: '40px',
                  left: '0',
                  right: '80px',
                  zIndex: 3,
                  transformOrigin: 'center bottom',
                }}
              >
                <LaptopMockup />
              </motion.div>

              {/* phone — in front, offset right */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: 0.5 }}
                style={{
                  x: smoothPhoneX,
                  y: smoothPhoneY,
                  position: 'absolute',
                  bottom: '20px',
                  right: '0px',
                  zIndex: 10,
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))',
                }}
              >
                <PhoneMockup />
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
        <Ticker />
      </section>
    </div>
  )
}