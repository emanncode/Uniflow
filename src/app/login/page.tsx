'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import UniflowLogo from '@/components/ui/UniflowLogo'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

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

    router.push('/dashboard')
  }

  return (
    <main
      style={{ backgroundColor: 'var(--bg-primary)' }}
      className="min-h-screen flex items-center justify-center px-4! relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-10! flex flex-col justify-center items-center">
          <UniflowLogo />
          <p className="mt-2! text-xs text-muted tracking-widest uppercase">
            Admin Portal
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-1!">Welcome back</h2>
          <p className="text-secondary text-sm mb-8!">Sign in to manage Uniflow</p>

          {error && (
            <div className="mb-6! px-4! py-3! rounded-lg text-sm" style={{
              backgroundColor: 'var(--danger-muted)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10!"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full mt-2!"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6!" style={{ color: 'var(--text-muted)' }}>
          Uniflow © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}