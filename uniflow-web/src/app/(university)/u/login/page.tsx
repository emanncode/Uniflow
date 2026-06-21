'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSubdomain } from '@/lib/subdomain'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Loader2,
  GraduationCap,
  Eye,
  EyeOff,
  Key,
  X,
  Copy,
  Check,
  Info,
} from 'lucide-react'
import UniflowLogo from '@/components/ui/UniflowLogo'

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

  const [showPassGen, setShowPassGen] = useState(false)
  const [genEmail, setPassGenEmail] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error('Invalid email or password.')

      const verifyRes = await fetch('/api/auth/verify-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal: 'university_admin' }),
      })

      if (!verifyRes.ok) {
        const payload = (await verifyRes.json().catch(() => null)) as {
          error?: string
        } | null
        if (verifyRes.status === 403) {
          await supabase.auth.signOut()
        }
        throw new Error(
          payload?.error === 'Access denied'
            ? 'Only university admin accounts can access this portal.'
            : 'Could not verify your account. Please try again.',
        )
      }

      router.push('/u')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateTempPass(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGenLoading(true)
    try {
      const res = await fetch('/api/public/generate-temp-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: genEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setTempPassword(data.tempPassword)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate password')
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
    <main
      style={{ backgroundColor: 'var(--bg-primary)' }}
      className="min-h-screen flex items-center justify-center px-4! relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(var(--bg-hover)_1px,transparent_1px),linear-gradient(90deg,var(--bg-hover)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-10! flex flex-col items-center text-center">
          <UniflowLogo size={40} />
          <p className="mt-3! text-xs text-muted tracking-widest uppercase">
            University Portal
          </p>

          {university ? (
            <div
              className="inline-flex items-center gap-1.5 mt-4! px-4! py-1.5! rounded-full"
              style={{
                background: 'var(--warning-muted)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <GraduationCap size={14} style={{ color: 'var(--warning)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>
                {university.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="card">
          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-bold text-primary mb-1!">
                Welcome back
              </h2>
              <p className="text-secondary text-sm mb-8!">
                Sign in to manage your university
              </p>

              {error && !showPassGen && (
                <div className="alert-error mb-6!">{error}</div>
              )}

              <form onSubmit={handleCredentials} className="space-y-5" aria-busy={loading}>
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="input pl-10!"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2!">
                    <label className="label mb-0!">Password</label>
                    <Link
                      href="/u/forgot-password"
                      className={`text-xs text-brand hover:underline${loading ? ' pointer-events-none opacity-50' : ''}`}
                      aria-disabled={loading}
                      tabIndex={loading ? -1 : undefined}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input pl-10! pr-10!"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2!"
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-5!">
              <p className="text-secondary text-sm mb-4!">OTP is currently disabled.</p>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="btn-secondary"
              >
                Back
              </button>
            </div>
          )}
        </div>

        <p
          className="text-center text-xs mt-6!"
          style={{ color: 'var(--text-muted)' }}
        >
          Uniflow © {new Date().getFullYear()}
        </p>
      </div>

      <AnimatePresence>
        {showPassGen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-5!"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowPassGen(false)
                  setTempPassword(null)
                  setError('')
                }}
                className="absolute right-4 top-4 text-muted hover:text-primary transition-colors"
              >
                <X size={18} />
              </button>

              {!tempPassword ? (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5!"
                    style={{
                      backgroundColor: 'var(--brand-muted)',
                      border: '1px solid var(--border-brand)',
                    }}
                  >
                    <Key size={24} color="var(--brand)" />
                  </div>

                  <h3 className="text-lg font-bold text-primary mb-2!">
                    Generate Temporary Password
                  </h3>
                  <p className="text-secondary text-sm mb-6! leading-relaxed">
                    If you haven&apos;t set a password or can&apos;t access your email, enter your
                    registered email below to get a temporary login password.
                  </p>

                  <form onSubmit={handleGenerateTempPass} className="space-y-4">
                    <div>
                      <label className="label">Registered Email</label>
                      <input
                        type="email"
                        required
                        value={genEmail}
                        onChange={(e) => setPassGenEmail(e.target.value)}
                        placeholder="yourname@university.edu"
                        className="input"
                      />
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    <button
                      type="submit"
                      disabled={genLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {genLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Generate Password'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-5!"
                    style={{
                      backgroundColor: 'var(--success-muted)',
                      border: '1px solid var(--success-muted)',
                    }}
                  >
                    <Check size={24} color="var(--success)" />
                  </div>

                  <h3 className="text-lg font-bold text-primary mb-2!">
                    Password Generated
                  </h3>

                  <div
                    className="flex gap-2.5 p-3! rounded-md mb-5!"
                    style={{
                      backgroundColor: 'var(--info-muted)',
                      border: '1px solid var(--info-muted)',
                    }}
                  >
                    <Info size={16} color="var(--info)" className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed m-0!" style={{ color: 'var(--info)' }}>
                      <strong>Security Note:</strong> This temporary password will be invalidated
                      immediately after your first successful login.
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between gap-3 p-4! rounded-md mb-6!"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <code
                      className="text-lg font-bold tracking-wide"
                      style={{ color: 'var(--brand)' }}
                    >
                      {tempPassword}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(tempPassword)}
                      className="text-muted hover:text-primary transition-colors"
                    >
                      {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail(genEmail)
                      setShowPassGen(false)
                      setTempPassword(null)
                    }}
                    className="btn-primary w-full"
                  >
                    Done, Proceed to Login
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}