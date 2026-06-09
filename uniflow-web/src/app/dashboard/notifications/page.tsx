'use client'

import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="page-enter">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Notifications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          System-wide alerts and registration updates.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center' as const,
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Bell size={24} color="var(--text-muted)" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          No new notifications
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
          You're all caught up! New registration requests and system alerts will appear here.
        </p>
      </div>
    </div>
  )
}
