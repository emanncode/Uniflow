'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSubdomain } from '@/lib/subdomain'
import { Lock, ArrowRight, Loader2, GraduationCap, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function UniversityResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [university, setUniversity] = useState<{ name: string; short_name: string } | null>(null)

  // Detect university from subdomain
  useEffect(() => {
    async function detectUniversity() {
      const subdomain = getSubdomain(window.location.hostname)
      if (!subdomain || subdomain === 'super') { setNotFound(true); return }

      const shortName = subdomain.replace('-admin', '')
      const { data, error } = await supabase
        .from('universities')
        .select('name, short_name')
        .eq('short_name', shortName)
        .eq('status', 'approved')
        .single()

      if (error || !data) { setNotFound(true) } else { setUniversity(data) }
    }
    detectUniversity()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/u/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertCircle size={32} color="#ef4444" />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Portal Not Found</h1>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            The university portal you are looking for does not exist or has not been approved yet.
          </p>
          <button onClick={() => window.location.href = 'https://uniflow.com.ng'} className="btn-primary" style={{ padding: '12px 24px' }}>
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="mb-10! text-center">
            <h1 className="text-4xl font-black tracking-tighter text-primary">
              uni<span className="text-brand">flow</span>
            </h1>
            <p className="mt-2! text-xs text-muted tracking-widest uppercase">
              Reset Password
            </p>
          </div>

          {university ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '20px',
              padding: '5px 14px',
              marginBottom: '8px',
            }}>
              <GraduationCap size={12} style={{ color: 'var(--gold)' }} />
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>
                {university.name}
              </span>
            </div>
          ) : null}

          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Choose a new secure password for your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '32px',
          backdropFilter: 'blur(20px)',
        }}>

          {/* Success State */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <ShieldCheck size={30} color="#22c55e" />
              </div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Password Updated!
              </h3>
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your password has been changed successfully. Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: '#ef4444', lineHeight: 1.5 }}>
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <>Update Password <ArrowRight size={15} /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Powered by Uniflow · University Portal
        </p>
      </div>
    </div>
  )
}
