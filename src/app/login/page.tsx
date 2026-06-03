'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpError, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleCredentials = async () => {
    setLoading(true)
    setError('')

    // first verify email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'uniflow_admin') {
      setError('Access denied. This portal is for uniflow admins only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // sign out temporarily — they must complete OTP
    await supabase.auth.signOut()

    // send OTP to their email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // don't create new users
      },
    })

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    setMessage(`Verification code sent to ${email}`)
    setStep('otp')
    setLoading(false)
  }

  const handleOtp = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError('Invalid or expired code. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleResend = async () => {
    setError('')
    setMessage('')

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: undefined,
        data: {},
      },
    })

    if (otpError) {
      setError(otpError.message)
      return
    }

    setMessage('New code sent to your email.')
  }

  return (
    <main
      style={{ backgroundColor: 'var(--bg-primary)' }}
      className="min-h-screen flex items-center justify-center px-4! relative"
    >
      {/* background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative w-full max-w-md">
        {/* logo */}
        <div className="mb-10! text-center">
          <h1 className="text-4xl font-black tracking-tighter text-primary">
            uni<span className="text-brand">flow</span>
          </h1>
          <p className="mt-2! text-xs text-muted tracking-widest uppercase">
            Admin Portal
          </p>
        </div>

        <div className="card">
          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-bold text-primary mb-1!">Welcome back</h2>
              <p className="text-secondary text-sm mb-8!">
                Sign in to manage Uniflow
              </p>

              {otpError && (
                <div
                  className="mb-6! px-4! py-3! rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--danger-muted)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'var(--danger)',
                  }}
                >
                  {otpError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    onKeyDown={(e) => e.key === 'Enter' && handleCredentials()}
                  />
                </div>

                <button
                  onClick={handleCredentials}
                  disabled={loading}
                  className="btn-primary w-full mt-2!"
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6!">
                {/* back button */}
                <button
                  onClick={() => { setStep('credentials'); setError(''); setOtp('') }}
                  className="text-xs text-muted hover:text-brand transition-colors mb-6! flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-primary mb-1!">
                  Check your email
                </h2>
                <p className="text-secondary text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="text-brand font-medium">{email}</span>
                </p>
              </div>

              {otpError && (
                <div
                  className="mb-6! px-4! py-3! rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--danger-muted)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'var(--danger)',
                  }}
                >
                  {otpError}
                </div>
              )}

              {message && (
                <div
                  className="mb-6! px-4! py-3! rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--success-muted)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    color: 'var(--success)',
                  }}
                >
                  {message}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="label">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input text-center text-2xl font-bold tracking-[0.5em]"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleOtp()}
                  />
                </div>

                <button
                  onClick={handleOtp}
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign in'}
                </button>

                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResend}
                    className="text-brand hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    Resend
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6!" style={{ color: 'var(--text-muted)' }}>
          Uniflow © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}