'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { User, Mail, Shield, Save, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (data) setProfile({ full_name: data.full_name, email: data.email })
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Profile updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      setError('Please fill in all password fields.')
      return
    }
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match.')
      return
    }
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSaving(true)
    setError('')

    const { error: passError } = await supabase.auth.updateUser({
      password: passwords.new,
    })

    if (passError) {
      setError(passError.message)
    } else {
      setSuccess('Password changed successfully.')
      setPasswords({ current: '', new: '', confirm: '' })
      setShowPasswordSection(false)
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ maxWidth: '600px' }}>
      {/* header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '0 0 6px',
        }}>
          Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage your Uniflow admin account.
        </p>
      </div>

      {/* alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert-error"
          style={{ marginBottom: '20px' }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert-success"
          style={{ marginBottom: '20px' }}
        >
          {success}
        </motion.div>
      )}

      {/* profile section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-card)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {/* section header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255,92,26,0.08)',
            border: '1px solid rgba(255,92,26,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={15} color="var(--brand)" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Profile
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Your personal information
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={15} color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                className="input"
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15} color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="email"
                className="input"
                value={profile.email}
                disabled
                style={{
                  paddingLeft: '40px',
                  opacity: 0.5, cursor: 'not-allowed',
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Email cannot be changed here.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255,92,26,0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary"
            style={{
              padding: '11px 24px', fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex', alignItems: 'center',
              gap: '7px', width: 'fit-content',
            }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* security section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-card)',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          style={{
            padding: '16px 20px',
            borderBottom: showPasswordSection ? '1px solid var(--border-primary)' : 'none',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={15} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Security
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Change your password
              </div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>
            {showPasswordSection ? 'Cancel' : 'Change password'}
          </span>
        </div>

        {showPasswordSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {[
              { key: 'new', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(field => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords[field.key as keyof typeof showPasswords] ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={passwords[field.key as keyof typeof passwords]}
                    onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key as keyof typeof p] }))}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '2px',
                    }}
                  >
                    {showPasswords[field.key as keyof typeof showPasswords]
                      ? <EyeOff size={15} color="var(--text-muted)" />
                      : <Eye size={15} color="var(--text-muted)" />
                    }
                  </button>
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              disabled={saving}
              style={{
                padding: '11px 24px', fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#3b82f6',
                color: '#fff', border: 'none',
                cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                fontWeight: 700, width: 'fit-content',
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                transition: 'all var(--transition)',
              }}
            >
              <Shield size={14} />
              {saving ? 'Updating...' : 'Update password'}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}