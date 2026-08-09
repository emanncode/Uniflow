'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import UniflowLogo from '@/components/ui/UniflowLogo'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeft, Wifi } from 'lucide-react'
import { Caveat } from 'next/font/google'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
})

const UniflowBlueprints = () => (
  <>
    <style>{`
      @keyframes float-1 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(-8px) scale(1.01) rotate(1deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(8px) scale(0.99) rotate(-1deg); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translateX(0px) translateY(0px); }
        50% { transform: translateX(-5px) translateY(-5px); }
      }
      .blueprint-bg-item {
        opacity: var(--blueprint-opacity, 0.85);
        transition: opacity 0.4s ease, transform 0.4s ease;
        pointer-events: none;
        z-index: 0;
      }
    `}</style>

    {/* 1. DB Hub (Top Left) */}
    <div className="blueprint-bg-item absolute" style={{ top: "3%", left: "3%", width: "clamp(100px, 15vw, 240px)", height: "clamp(100px, 15vw, 240px)", animation: "float-1 10s ease-in-out infinite" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect x="110" y="20" width="80" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <line x1="110" y1="40" x2="190" y2="40" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="150" y="34" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">DB_HUB</text>
        <path d="M 150,60 L 150,120" stroke="var(--brand, #008751)" strokeWidth="1" />
        <path d="M 150,100 L 50,100 L 50,140" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 150,100 L 250,100 L 250,140" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="20" y="140" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="50" y="152" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">STUDENTS</text>
        <line x1="20" y1="158" x2="80" y2="158" stroke="var(--brand, #008751)" strokeWidth="0.5" />
        <rect x="120" y="120" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="150" y="132" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">COURSES</text>
        <line x1="120" y1="138" x2="180" y2="138" stroke="var(--brand, #008751)" strokeWidth="0.5" />
        <rect x="220" y="140" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="250" y="152" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">VENUE_MAP</text>
        <line x1="220" y1="158" x2="280" y2="158" stroke="var(--brand, #008751)" strokeWidth="0.5" />
      </svg>
    </div>

    {/* 2. DB Cylinders (Top Right) */}
    <div className="blueprint-bg-item absolute" style={{ top: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-2 12s ease-in-out infinite" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 C 120,130 60,130 60,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <path d="M 60,95 C 60,85 120,85 120,95" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 60,110 C 60,100 120,100 120,110" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 180,140 C 180,130 240,130 240,140 L 240,180 C 240,190 180,190 180,180 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <path d="M 180,155 C 180,145 240,145 240,155" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 180,170 C 180,160 240,160 240,170" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 120,100 L 150,100 L 150,160 L 180,160" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    </div>

    {/* 3. Radar (Bottom Left) */}
    <div className="blueprint-bg-item absolute" style={{ bottom: "3%", left: "3%", width: "clamp(100px, 15vw, 230px)", height: "clamp(100px, 15vw, 230px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "1s" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="150" cy="150" r="110" stroke="var(--brand, #008751)" strokeWidth="0.75" />
        <path d="M 40,150 L 260,150" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="6 4" />
        <path d="M 150,40 L 150,260" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="6 4" />
      </svg>
    </div>

    {/* 4. Server Blocks (Bottom Right) */}
    <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-1 13s ease-in-out infinite", animationDelay: "0.5s" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect x="50" y="40" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <rect x="50" y="110" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <rect x="50" y="180" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <circle cx="75" cy="65" r="5" fill="var(--brand, #008751)" />
        <circle cx="75" cy="135" r="5" fill="var(--brand, #008751)" />
        <circle cx="75" cy="205" r="5" fill="var(--brand, #008751)" />
      </svg>
    </div>
  </>
);

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Sora, sans-serif',
    }}>
      <UniflowBlueprints />

      {/* Floating ThemeToggle */}
      <div style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--bg-hover) 1px, transparent 1px), linear-gradient(90deg, var(--bg-hover) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* orange glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(0, 135, 81,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* watermark 404 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(160px, 25vw, 320px)',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.015)',
        letterSpacing: '-0.06em',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        404
      </div>

      {/* logo top */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '24px', left: '32px' }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <UniflowLogo size={24} />
        </Link>
      </motion.div>

      {/* main content */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: '480px',
      }}>

        {/* icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            backgroundColor: 'rgba(0, 135, 81,0.08)',
            border: '1px solid rgba(0, 135, 81,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 40px rgba(0, 135, 81,0.12)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Wifi size={32} color="var(--brand)" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* 404 label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={caveat.className}
          style={{
            display: 'block',
            fontSize: 'clamp(20px, 4vw, 30px)',
            fontWeight: 700,
            color: 'var(--brand)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          Error 404
        </motion.div>

        {/* headline */}
        <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Page not found.
          </motion.h1>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--brand)',
              textShadow: '0 0 30px var(--border-brand)',
              margin: 0,
            }}
          >
            It happens.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
            margin: '0 0 40px',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px var(--border-brand)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{
                padding: '13px 28px', fontSize: '14px',
                borderRadius: 'var(--radius-lg)',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <ArrowLeft size={15} />
              Back to home
            </motion.button>
          </Link>

          <Link href="/register" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="glass-btn"
              style={{
                padding: '13px 28px', fontSize: '14px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              Register university
            </motion.button>
          </Link>
        </motion.div>

        {/* bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '48px',
          }}
        >
          Think this is a mistake?{' '}
          <Link href="/" style={{
            color: 'var(--brand)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Contact support →
          </Link>
        </motion.p>
      </div>
    </main>
  )
}