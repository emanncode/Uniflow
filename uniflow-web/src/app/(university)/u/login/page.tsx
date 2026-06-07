'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSubdomain } from '@/lib/subdomain'
import { Mail, Lock, ArrowRight, Loader2, KeyRound, GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react'

type Step = 'credentials' | 'otp'

export default function UniversityLoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [university, setUniversity] = useState<{ name: string; short_name: string } | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  // Detect university from subdomain
  useEffect(() => {
    async function detectUniversity() {
      const subdomain = getSubdomain(window.location.hostname)
      if (!subdomain) return

      const shortName = subdomain.replace('-admin', '')
      const { data } = await supabase
        .from('universities')
        .select('name, short_name')
        .eq('short_name', shortName)
        .eq('status', 'approved')
        .single()

      if (data) setUniversity(data)
    }
    detectUniversity()
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error('Invalid email or password.')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const portalRoles = ['university_admin', 'dean', 'hod']
      if (!profile || !portalRoles.includes(profile.role)) {
        await supabase.auth.signOut()
        throw new Error('Your account does not have access to this portal.')
      }

      // OTP logic disabled temporarily. DO NOT UNCOMMENT YET.
      router.push('/')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // OTP functions disabled temporarily. DO NOT UNCOMMENT YET.
  /*
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (verifyError) throw new Error('Invalid or expired code. Check your email and try again.')

      router.push('/')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    setResendTimer(60)
  }
  */

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
        background: 'radial-gradient(ellipse, rgba(255,92,26,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
              uni<span style={{ color: 'var(--brand)' }}>flow</span>
            </h1>
            <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Admin Portal
            </p>
          </div>

          {university ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--warning-muted)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              marginBottom: '12px',
            }}>
              <GraduationCap size={14} style={{ color: 'var(--warning)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                {university.name}
              </span>
            </div>
          ) : null}

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {step === 'credentials' ? 'Sign in to your admin portal' : 'Verify your identity'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-premium)',
        }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {(['credentials', 'otp'] as Step[]).map((s, i) => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: 'var(--radius-full)',
                background: i === 0
                  ? 'var(--brand)'
                  : step === 'otp' ? 'var(--brand)' : 'var(--border-primary)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              background: 'var(--danger-muted)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
          )}

          {/* Step 1 — Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="input"
                    style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
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
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      padding: 0, display: 'flex', alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
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
                  : <>Continue <ArrowRight size={15} /></>
                }
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'var(--info-muted)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A 6-digit verification code was sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
              </div>

              <div>
                <label className="label">Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="input"
                    style={{ width: '100%', paddingLeft: '40px', letterSpacing: '0.3em', fontSize: '18px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <>Verify & Sign In <ArrowRight size={15} /></>
                }
              </button>

              <div style={{ textAlign: 'center' }}>
                {resendTimer > 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Resend in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--brand)' }}
                  >
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Powered by Uniflow · University Portal
        </p>
      </div>
    </div>
  )
}
