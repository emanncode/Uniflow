"use client";

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import SectionBackground from '@/components/landing/SectionBackground'

const sparklesVariants: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
    y: 0,
    color: 'var(--brand)'
  },
  hover: {
    rotate: [0, 15, -15, 10, -10, 0],
    scale: 1.15,
    y: [0, -4, 0],
    color: 'var(--brand)',
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

const iconContainerVariants: Variants = {
  initial: {
    backgroundColor: 'var(--bg-tertiary)',
  },
  hover: {
    backgroundColor: 'rgba(0, 135, 81, 0.15)',
    transition: { duration: 0.3 }
  }
}

export default function CTA() {
  return (
    <section style={{
        padding: 'clamp(80px, 20vw, 120px) 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <SectionBackground />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover="hover"
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--brand)',
            overflow: 'hidden',
            padding: 'clamp(56px, 9vw, 100px) clamp(32px, 6vw, 80px)',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.4s ease',
          }}
        >
          {/* background grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* icon */}
            <motion.div
              variants={iconContainerVariants}
              style={{
                display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center',
                width: '64px', height: '64px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '32px',
                cursor: 'default',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <motion.div
                variants={sparklesVariants}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Sparkles size={28} color="currentColor" strokeWidth={1.5} />
              </motion.div>
            </motion.div>

            {/* headline */}
            <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(32px, 5vw, 64px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Stop hearing about it
              </motion.h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(32px, 5vw, 64px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'var(--brand)',
                  textShadow: '0 0 40px rgba(0, 135, 81,0.3)',
                  margin: 0,
                }}
              >
                on WhatsApp.
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: 'clamp(15px, 1.8vw, 18px)',
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                maxWidth: '500px',
                margin: '0 auto 40px',
              }}
            >
              Register your university today and be among the first
              institutions to give students and lecturers the clarity
              they deserve.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '14px', flexWrap: 'wrap',
              }}
            >
              <Link href="/register">
                <motion.button
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  variants={{
                    hover: {
                      scale: 1.06,
                      boxShadow: '0 12px 48px rgba(0, 135, 81,0.4)'
                    }
                  }}
                  className="btn-primary pulse-glow"
                  style={{
                    padding: '16px 40px', fontSize: '15px', fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    position: 'relative' as const,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: 'none',
                    backgroundColor: 'var(--brand)',
                    color: '#fff',
                  }}
                >
                  Register Your University
                  <motion.span
                    variants={{
                      initial: { x: 0 },
                      hover: { x: 4 }
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{ display: 'inline-flex' }}
                  >
                    <ArrowRight size={16} />
                  </motion.span>
                </motion.button>
              </Link>
              <Link href="#how-it-works" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-btn"
                  style={{
                    padding: '16px 40px', fontSize: '15px', fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  See how it works
                </motion.button>
              </Link>
            </motion.div>

            {/* trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontSize: '12px', color: 'var(--text-muted)',
                marginTop: '24px',
              }}
            >
              Free to start · No credit card required · Setup in under a day
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}