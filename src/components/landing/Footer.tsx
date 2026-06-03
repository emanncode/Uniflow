'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import UniflowLogo from '@/components/ui/UniflowLogo'
import { TwitterIcon } from '@/components/ui/Twitter'
import { LinkedinIcon } from '@/components/ui/Linkedin'
import { GithubIcon } from '@/components/ui/Github'
import { MailboxIcon } from '@/components/ui/MailBox'

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Universities: [
    { label: 'Register', href: '/register' },
    { label: 'Documentation', href: '#' },
    { label: 'Support', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

const socials = [
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: GithubIcon, href: '#', label: 'GitHub' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
  { icon: MailboxIcon, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      borderTop: '1px solid var(--border-primary)',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      {/* top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,92,26,0.4), transparent)',
      }} />

      <div className="container">
        {/* ── main footer ── */}
        <div style={{
          padding: 'clamp(48px, 6vw, 80px) 0 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: 'clamp(32px, 4vw, 48px)',
        }}>
          {/* brand column */}
          <div style={{ gridColumn: 'span 2' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <UniflowLogo size={28} />
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                marginTop: '16px',
                maxWidth: '260px',
              }}>
                The university timetable and campus intelligence platform.
                Built for every university, worldwide.
              </p>

              {/* socials */}
              <div style={{
                display: 'flex', gap: '8px', marginTop: '24px',
              }}>
                {socials.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,92,26,0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                      style={{
                        width: '36px', height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all var(--transition)',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={15} color="var(--text-muted)" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* link columns */}
          {Object.entries(links).map(([category, items], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                marginBottom: '16px',
              }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'color var(--transition)',
                      fontWeight: 400,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── bottom bar ── */}
        <div style={{
          borderTop: '1px solid var(--border-primary)',
          padding: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: 0,
          }}>
            © {new Date().getFullYear()} Uniflow. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Built for universities worldwide
            </span>
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              backgroundColor: 'var(--brand)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--brand)',
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              🇳🇬 Made in Ondo
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}