'use client'

import { useState } from 'react'

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ongoing: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Ongoing' },
  delayed: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Delayed 30m' },
  canceled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Canceled' },
  moved: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Moved → LT5' },
}

const classes = [
  { code: 'CSC301', title: 'Data Structures', time: 'Mon 8:00–10:00am', venue: 'LT1', status: 'ongoing' },
  { code: 'MTH201', title: 'Linear Algebra', time: 'Mon 10:00–12:00pm', venue: 'LT3', status: 'delayed' },
  { code: 'PHY101', title: 'General Physics', time: 'Mon 2:00–4:00pm', venue: 'Hall B', status: 'canceled' },
  { code: 'CSC401', title: 'Software Engineering', time: 'Tue 8:00–10:00am', venue: 'LT2', status: 'moved' },
]

const bottomNavIcons = ['🏠', '📅', '📚', '🔔']

export default function PhoneMockup() {
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e1e1e, #141414)',
      borderRadius: '28px',
      border: '2px solid #2a2a2a',
      padding: '10px 8px',
      width: '130px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      {/* notch */}
      <div style={{
        width: '40px', height: '6px',
        backgroundColor: '#111',
        borderRadius: '999px',
        margin: '0 auto 8px',
        border: '1px solid #222',
      }} />

      {/* screen */}
      <div style={{
        background: '#0d0b09',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: '200px',
      }}>
        {/* app header */}
        <div style={{
          padding: '10px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(110,231,183,0.04)',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 800,
            color: '#6ee7b7', letterSpacing: '-0.02em',
          }}>
            uniflow
          </div>
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
            Good morning, Tunde 👋
          </div>
        </div>

        {/* today's classes */}
        <div style={{ padding: '8px' }}>
          <div style={{
            fontSize: '7px', fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>
            Today
          </div>

          {classes.slice(0, 3).map((cls, i) => {
            const s = statusConfig[cls.status]
            return (
              <div key={cls.code} style={{
                padding: '6px 7px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '2px', height: '24px',
                    borderRadius: '999px',
                    backgroundColor: s.color,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '7px', fontWeight: 700, color: '#f5f5f5' }}>
                      {cls.title}
                    </div>
                    <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                      {cls.time.split(' ')[1]} · {cls.venue}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  flexShrink: 0,
                  boxShadow: `0 0 4px ${s.color}`,
                }} />
              </div>
            )
          })}
        </div>

        {/* bottom nav */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 4px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: '4px',
        }}>
          {bottomNavIcons.map((icon, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIcon(i)}
              onMouseLeave={() => setHoveredIcon(null)}
              style={{
                fontSize: '12px',
                opacity: hoveredIcon === null ? 0.6 : hoveredIcon === i ? 1 : 0.3,
                transition: 'opacity 150ms ease',
                cursor: 'pointer',
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* home indicator */}
      <div style={{
        width: '30px', height: '3px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '999px',
        margin: '8px auto 0',
      }} />
    </div>
  )
}