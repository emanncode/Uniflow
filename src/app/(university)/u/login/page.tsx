'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSubdomain } from '@/lib/subdomain'
import UniflowLogo from '@/components/ui/UniflowLogo'
import { Mail, Lock, ArrowRight, Loader2, KeyRound, GraduationCap, AlertCircle } from 'lucide-react'

type Step = 'credentials' | 'otp'

export default function UniversityLoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

      // e.g. "aaua-admin" → short_name = "aaua"
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
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error('Invalid email or password.')

      // Check role is a portal role
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

      // Sign out temporarily, send OTP
      await supabase.auth.signOut()
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (otpError) throw new Error('Failed to send verification code. Try again.')

      setStep('otp')
      setResendTimer(60)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
    setResendTimer(60)
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
              Admin Portal
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
            {step === 'credentials' ? 'Sign in to your admin portal' : 'Verify your identity'}
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

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {(['credentials', 'otp'] as Step[]).map((s, i) => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: i === 0
                  ? 'var(--brand)'
                  : step === 'otp' ? 'var(--brand)' : 'rgba(255,255,255,0.1)',
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

          {/* Step 1 — Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
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
                <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
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
                  : <>Continue <ArrowRight size={15} /></>
                }
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A 6-digit verification code was sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
              </div>

              <div>
                <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Verification Code</label>
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
                  <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Resend in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--brand)' }}
                  >
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Powered by Uniflow · University Portal
        </p>
      </div>
    </div>
  )
}
