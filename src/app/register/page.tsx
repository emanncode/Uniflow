'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import UniflowLogo from '@/components/ui/UniflowLogo'
import StepIndicator from '@/components/register/StepIndicator'
import FieldWrapper from '@/components/register/FieldWrapper'
import {
  Building2, Mail, Phone, Globe, Users,
  User, Briefcase, ArrowRight, ArrowLeft,
  CheckCircle2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Other']

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

type Step = 1 | 2

interface FormData {
  university_name: string
  short_name: string
  official_email: string
  phone: string
  country: string
  state: string
  website: string
  estimated_students: string
  contact_person_name: string
  contact_person_role: string
  agreed: boolean
}


export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormData>({
    university_name: '',
    short_name: '',
    official_email: '',
    phone: '',
    country: 'Nigeria',
    state: '',
    website: '',
    estimated_students: '',
    contact_person_name: '',
    contact_person_role: '',
    agreed: false,
  })

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const formatShortName = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]/g, '')

  const validateStep1 = () => {
    if (!form.university_name.trim()) return 'University name is required'
    if (!form.short_name.trim()) return 'Short name is required'
    if (form.short_name.length < 2) return 'Short name must be at least 2 characters'
    if (!form.official_email.trim()) return 'Official email is required'
    if (!form.official_email.includes('@')) return 'Enter a valid email address'
    if (!form.country) return 'Country is required'
    return ''
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!form.contact_person_name.trim()) { setError('Contact person name is required'); return }
    if (!form.agreed) { setError('Please agree to the terms to continue'); return }

    setLoading(true)
    setError('')

    // check if short name already taken
    const { data: existing } = await supabase
      .from('university_registrations')
      .select('id')
      .eq('short_name', form.short_name)
      .single()

    if (existing) {
      setError(`The short name "${form.short_name}" is already taken. Please choose another.`)
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('university_registrations')
      .insert({
        university_name: form.university_name.trim(),
        short_name: form.short_name.trim(),
        official_email: form.official_email.trim(),
        phone: form.phone.trim() || null,
        country: form.country,
        state: form.state || null,
        website: form.website.trim() || null,
        estimated_students: form.estimated_students ? parseInt(form.estimated_students) : null,
        contact_person_name: form.contact_person_name.trim(),
        contact_person_role: form.contact_person_role.trim() || null,
        status: 'pending',
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  // ── success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <main style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(255,92,26,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: 'center', maxWidth: '480px',
            position: 'relative', zIndex: 1,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: 'rgba(255,92,26,0.1)',
              border: '1px solid rgba(255,92,26,0.3)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 32px',
              boxShadow: '0 0 40px rgba(255,92,26,0.2)',
            }}
          >
            <CheckCircle2 size={36} color="var(--brand)" strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 900, letterSpacing: '-0.04em',
              color: 'var(--text-primary)', margin: '0 0 16px',
            }}
          >
            Application submitted!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: '15px', color: 'var(--text-muted)',
              lineHeight: 1.75, margin: '0 0 12px',
            }}
          >
            We've received your registration for{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>
              {form.university_name}
            </strong>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '14px', color: 'var(--text-muted)',
              lineHeight: 1.75, margin: '0 0 40px',
            }}
          >
            Our team will review your application and get back to you
            at <strong style={{ color: 'var(--text-secondary)' }}>{form.official_email}</strong>{' '}
            within 48 hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255,92,26,0.06)',
              border: '1px solid rgba(255,92,26,0.15)',
              marginBottom: '32px',
              fontSize: '13px', color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            Your portal will be available at{' '}
            <strong style={{ color: 'var(--brand)', fontFamily: 'monospace' }}>
              {form.short_name}-admin.uniflow.com.ng
            </strong>
            {' '}once approved.
          </motion.div>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '14px', borderRadius: 'var(--radius-lg)' }}
            >
              Back to home
            </motion.button>
          </Link>
        </motion.div>
      </main>
    )
  }

  // ── main form ───────────────────────────────────────────────
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-10%', left: '50%',
        transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(255,92,26,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* navbar */}
      <nav className="glass-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          height: '64px', display: 'flex',
          alignItems: 'center',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <UniflowLogo size={26} />
          </Link>
        </div>
      </nav>

      {/* content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 'clamp(32px, 5vw, 60px) 24px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '40px' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '999px',
              border: '1px solid rgba(255,92,26,0.2)',
              backgroundColor: 'rgba(255,92,26,0.06)',
              fontSize: '11px', fontWeight: 600,
              color: 'var(--brand)', letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              marginBottom: '16px',
            }}>
              University Registration
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 900, letterSpacing: '-0.04em',
              color: 'var(--text-primary)', margin: '0 0 10px',
            }}>
              Bring your university{' '}
              <span style={{ color: 'var(--brand)' }}>to Uniflow.</span>
            </h1>
            <p style={{
              fontSize: '14px', color: 'var(--text-muted)',
              lineHeight: 1.7, margin: 0,
            }}>
              Fill out the form below. We'll review your application
              and set up your portal within 48 hours.
            </p>
          </motion.div>

          {/* step indicator */}
          <StepIndicator step={step} />

          {/* form card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backgroundColor: 'rgba(18,19,21,0.8)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(24px, 4vw, 40px)',
              }}
            >
              {error && (
                <div className="alert-error" style={{ marginBottom: '24px' }}>
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <FieldWrapper label="University Full Name *">
                    <div style={{ position: 'relative' }}>
                      <Building2
                        size={16} color="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Adekunle Ajasin University, Akungba-Akoko"
                        value={form.university_name}
                        onChange={e => update('university_name', e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper
                    label="Short Name *"
                    hint={form.short_name
                      ? `Your portal will be: ${form.short_name}-admin.uniflow.com.ng`
                      : 'Lowercase letters and numbers only. This becomes your subdomain.'}
                  >
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. aaua"
                        value={form.short_name}
                        onChange={e => update('short_name', formatShortName(e.target.value))}
                        style={{
                          fontFamily: 'monospace',
                          borderColor: form.short_name ? 'rgba(255,92,26,0.3)' : undefined,
                        }}
                      />
                      {form.short_name && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            position: 'absolute', right: '12px', top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '10px', fontWeight: 600,
                            color: 'var(--brand)',
                            backgroundColor: 'rgba(255,92,26,0.08)',
                            padding: '2px 8px', borderRadius: '999px',
                            border: '1px solid rgba(255,92,26,0.2)',
                            pointerEvents: 'none',
                          }}
                        >
                          {form.short_name}-admin.uniflow.com.ng
                        </motion.div>
                      )}
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Official University Email *">
                    <div style={{ position: 'relative' }}>
                      <Mail
                        size={16} color="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="email"
                        className="input"
                        placeholder="e.g. registrar@aaua.edu.ng"
                        value={form.official_email}
                        onChange={e => update('official_email', e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </FieldWrapper>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FieldWrapper label="Phone">
                      <div style={{ position: 'relative' }}>
                        <Phone
                          size={16} color="var(--text-muted)"
                          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        />
                        <input
                          type="tel"
                          className="input"
                          placeholder="+234 800 000 0000"
                          value={form.phone}
                          onChange={e => update('phone', e.target.value)}
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                    </FieldWrapper>

                    <FieldWrapper label="Estimated Students">
                      <div style={{ position: 'relative' }}>
                        <Users
                          size={16} color="var(--text-muted)"
                          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        />
                        <input
                          type="number"
                          className="input"
                          placeholder="e.g. 5000"
                          value={form.estimated_students}
                          onChange={e => update('estimated_students', e.target.value)}
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                    </FieldWrapper>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FieldWrapper label="Country *">
                      <select
                        className="select"
                        value={form.country}
                        onChange={e => update('country', e.target.value)}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </FieldWrapper>

                    <FieldWrapper label="State">
                      {form.country === 'Nigeria' ? (
                        <select
                          className="select"
                          value={form.state}
                          onChange={e => update('state', e.target.value)}
                        >
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="input"
                          placeholder="State / Province"
                          value={form.state}
                          onChange={e => update('state', e.target.value)}
                        />
                      )}
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="University Website">
                    <div style={{ position: 'relative' }}>
                      <Globe
                        size={16} color="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="url"
                        className="input"
                        placeholder="https://www.aaua.edu.ng"
                        value={form.website}
                        onChange={e => update('website', e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </FieldWrapper>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,92,26,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="btn-primary"
                    style={{
                      width: '100%', padding: '15px',
                      fontSize: '15px', borderRadius: 'var(--radius-lg)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      marginTop: '8px',
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </motion.button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <FieldWrapper label="Your Full Name *">
                    <div style={{ position: 'relative' }}>
                      <User
                        size={16} color="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Dr. Adebayo Okafor"
                        value={form.contact_person_name}
                        onChange={e => update('contact_person_name', e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Your Role at the University">
                    <div style={{ position: 'relative' }}>
                      <Briefcase
                        size={16} color="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Registrar, ICT Director, Vice Chancellor"
                        value={form.contact_person_role}
                        onChange={e => update('contact_person_role', e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </FieldWrapper>

                  {/* summary card */}
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255,92,26,0.04)',
                    border: '1px solid rgba(255,92,26,0.12)',
                  }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 700,
                      color: 'var(--brand)', letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const, marginBottom: '12px',
                    }}>
                      Registration Summary
                    </div>
                    {[
                      { label: 'University', value: form.university_name },
                      { label: 'Portal URL', value: `${form.short_name}-admin.uniflow.com.ng` },
                      { label: 'Email', value: form.official_email },
                      { label: 'Country', value: form.state ? `${form.state}, ${form.country}` : form.country },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: 'flex', justifyContent: 'space-between',
                        gap: '12px', marginBottom: '6px',
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{
                          fontSize: '12px', color: 'var(--text-secondary)',
                          fontWeight: 600, textAlign: 'right',
                          fontFamily: item.label === 'Portal URL' ? 'monospace' : 'inherit',
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* terms */}
                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <div
                      onClick={() => update('agreed', !form.agreed)}
                      style={{
                        width: '18px', height: '18px', borderRadius: '5px',
                        border: form.agreed ? 'none' : '1px solid var(--border-secondary)',
                        backgroundColor: form.agreed ? 'var(--brand)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px', cursor: 'pointer',
                        transition: 'all var(--transition)',
                        boxShadow: form.agreed ? '0 0 12px rgba(255,92,26,0.3)' : 'none',
                      }}
                    >
                      {form.agreed && <CheckCircle2 size={12} color="#fff" />}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      I confirm that I am authorized to register this university on Uniflow
                      and agree to the{' '}
                      <Link href="#" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="#" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setStep(1); setError('') }}
                      className="glass-btn"
                      style={{
                        padding: '15px 20px', fontSize: '14px',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <ArrowLeft size={15} /> Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,92,26,0.25)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary"
                      style={{
                        flex: 1, padding: '15px',
                        fontSize: '15px', borderRadius: 'var(--radius-lg)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                      }}
                    >
                      {loading ? 'Submitting...' : 'Submit Application →'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}