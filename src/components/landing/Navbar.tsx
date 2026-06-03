'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import UniflowLogo from '@/components/ui/UniflowLogo'
import { MenuIcon, MenuIconHandle } from '@/components/ui/Menu'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuIconRef = useRef<MenuIconHandle>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      menuIconRef.current?.startAnimation()
    } else {
      menuIconRef.current?.stopAnimation()
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { name: 'Problem', href: '#problem' },
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: '24px',
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 24px',
      pointerEvents: 'none',
    }}>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1100px',
          height: '64px',
          padding: '0 24px',
          background: scrolled ? 'rgba(10, 10, 11, 0.7)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 'var(--radius-full)',
          border: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: scrolled ? 'var(--shadow-premium)' : 'none',
          pointerEvents: 'auto',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <UniflowLogo size={28} />
        </Link>

        {/* desktop links */}
        <div className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.03)',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/register" className='hidden md:block'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Get Started
            </motion.button>
          </Link>

          {/* mobile toggle */}
          <button
            className="mobile-menu-btn md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon ref={menuIconRef} />
          </button>
        </div>
      </motion.div>

      {/* mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: 'absolute',
              top: '80px',
              left: '24px',
              right: '24px',
              background: 'rgba(10, 10, 11, 0.95)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-premium)',
              pointerEvents: 'auto',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <button className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '16px' }}>
                Get Started
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
