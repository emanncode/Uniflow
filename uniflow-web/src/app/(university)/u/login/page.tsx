'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSubdomain } from '@/lib/subdomain'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, GraduationCap, AlertCircle, Eye, EyeOff, Key, X, Copy, Check, Info } from 'lucide-react'

type Step = 'credentials' | 'otp'

export default function UniversityLoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [university, setUniversity] = useState<{ name: string; short_name: string } | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  // Self-service password states
  const [showPassGen, setShowPassGen] = useState(false)
  const [genEmail, setPassGenEmail] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

      if (!profile || profile.role !== 'university_admin') {
        await supabase.auth.signOut()
        throw new Error('Only university admin accounts can access this portal.')
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

  async function handleGenerateTempPass(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGenLoading(true)
    try {
      const res = await fetch('/api/public/generate-temp-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: genEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setTempPassword(data.tempPassword)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              Portal Login
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
            {step === 'credentials' ? 'Sign in to your portal' : 'Verify your identity'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-premium)',
        }}>

          {/* Error */}
          {error && !showPassGen && (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="label" style={{ marginBottom: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassGen(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
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
                  : <>Sign In <ArrowRight size={15} /></>
                }
              </button>
            </form>
          )}

          {/* Step 2 — OTP (Left in for future use if step is toggled) */}
          {step === 'otp' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'var(--text-muted)' }}>OTP is currently disabled.</p>
              <button onClick={() => setStep('credentials')} className="btn-secondary" style={{ marginTop: '12px' }}>Back</button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Powered by Uniflow · University Portal
        </p>
      </div>

      {/* Self-Service Password Generation Modal */}
      <AnimatePresence>
        {showPassGen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%', maxWidth: '400px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
                padding: '28px', position: 'relative',
              }}
            >
              <button
                onClick={() => { setShowPassGen(false); setTempPassword(null); setError('') }}
                style={{
                  position: 'absolute', right: '16px', top: '16px',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: '4px',
                }}
              >
                <X size={18} />
              </button>

              {!tempPassword ? (
                <>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    backgroundColor: 'var(--brand-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px', border: '1px solid var(--border-brand)',
                  }}>
                    <Key size={24} color="var(--brand)" />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Generate Temporary Password
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                    If you haven't set a password or can't access your email, enter your registered email below to get a temporary login password.
                  </p>

                  <form onSubmit={handleGenerateTempPass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="label">Registered Email</label>
                      <input
                        type="email"
                        required
                        value={genEmail}
                        onChange={e => setPassGenEmail(e.target.value)}
                        placeholder="yourname@university.edu"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>

                    {error && (
                      <div style={{
                        display: 'flex', gap: '8px', padding: '10px',
                        background: 'var(--danger-muted)', borderRadius: 'var(--radius-md)',
                        fontSize: '12px', color: 'var(--danger)'
                      }}>
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={genLoading}
                      className="btn-primary"
                      style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {genLoading ? <Loader2 size={16} className="animate-spin" /> : 'Generate Password'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    backgroundColor: 'var(--success-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px', border: '1px solid var(--success-muted)',
                  }}>
                    <Check size={24} color="var(--success)" />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Password Generated
                  </h3>
                  
                  <div style={{
                    padding: '12px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--info-muted)',
                    border: '1px solid var(--info-muted)',
                    display: 'flex', gap: '10px', marginBottom: '20px'
                  }}>
                    <Info size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '12px', color: 'var(--info)', lineHeight: 1.5, margin: 0 }}>
                      <strong>Security Note:</strong> This temporary password will be invalidated immediately after your first successful login.
                    </p>
                  </div>

                  <div style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', marginBottom: '24px',
                  }}>
                    <code style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.05em' }}>
                      {tempPassword}
                    </code>
                    <button
                      onClick={() => copyToClipboard(tempPassword)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEmail(genEmail)
                      setShowPassGen(false)
                      setTempPassword(null)
                    }}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--brand)', color: 'white',
                      fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Done, Proceed to Login
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
