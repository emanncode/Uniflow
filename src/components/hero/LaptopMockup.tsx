'use client'

import { motion } from 'framer-motion'

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

export default function LaptopMockup() {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* screen */}
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
        borderRadius: '12px 12px 0 0',
        border: '2px solid #2a2a2a',
        borderBottom: 'none',
        padding: '8px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* camera dot */}
        <div style={{
          width: '5px', height: '5px',
          borderRadius: '50%',
          backgroundColor: '#2a2a2a',
          margin: '0 auto 6px',
        }} />

        {/* screen content */}
        <div style={{
          background: '#0d0b09',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* mini browser bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 10px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c }} />
            ))}
            <div style={{
              marginLeft: '6px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '4px', padding: '2px 8px',
              fontSize: '8px', color: 'rgba(255,255,255,0.25)',
              flex: 1, maxWidth: '160px',
            }}>
              aaua-admin.uniflow.com.ng
            </div>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                marginLeft: 'auto', fontSize: '7px',
                fontWeight: 700, color: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.1)',
                padding: '2px 6px', borderRadius: '999px',
              }}
            >
              ● LIVE
            </motion.span>
          </div>

          {/* dashboard content */}
          <div style={{ padding: '10px', display: 'flex', gap: '8px' }}>
            {/* sidebar */}
            <div style={{
              width: '28px',
              display: 'flex', flexDirection: 'column', gap: '6px',
              alignItems: 'center', paddingTop: '4px',
            }}>
              {['#6ee7b7', '#444', '#444', '#444', '#444'].map((c, i) => (
                <div key={i} style={{
                  width: '18px', height: '4px',
                  borderRadius: '999px',
                  backgroundColor: c,
                }} />
              ))}
            </div>

            {/* main content */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '8px', fontWeight: 700,
                color: '#f5f5f5', marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}>
                Today's Timetable
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {classes.map((cls, i) => {
                  const s = statusConfig[cls.status]
                  return (
                    <div key={cls.code} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 7px',
                      borderRadius: '5px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                          width: '2px', height: '20px',
                          borderRadius: '999px',
                          backgroundColor: s.color,
                          boxShadow: `0 0 4px ${s.color}60`,
                        }} />
                        <div>
                          <div style={{ fontSize: '7px', fontWeight: 700, color: '#6ee7b7' }}>
                            {cls.code}
                          </div>
                          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.5)' }}>
                            {cls.venue} · {cls.time.split(' ')[1]}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '6px', fontWeight: 700,
                        color: s.color, backgroundColor: s.bg,
                        padding: '2px 5px', borderRadius: '999px',
                        textTransform: 'uppercase' as const,
                        border: `1px solid ${s.color}30`,
                      }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* laptop base */}
      <div style={{
        background: 'linear-gradient(180deg, #222 0%, #1a1a1a 100%)',
        height: '14px',
        borderRadius: '0 0 4px 4px',
        border: '2px solid #2a2a2a',
        borderTop: '1px solid #333',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px', height: '4px',
          backgroundColor: '#1a1a1a',
          borderRadius: '0 0 4px 4px',
          border: '1px solid #2a2a2a',
          borderTop: 'none',
        }} />
      </div>

      {/* bottom stand */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
        height: '4px',
        borderRadius: '0 0 8px 8px',
        margin: '0 10px',
        border: '1px solid #222',
        borderTop: 'none',
      }} />
    </div>
  )
}
