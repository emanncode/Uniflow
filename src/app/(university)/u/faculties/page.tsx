'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BookOpen, Plus, Search, X, Loader2, Trash2,
  UserCheck, Building2, ChevronDown, AlertCircle,
} from 'lucide-react'

interface Faculty {
  id: string
  name: string
  code: string
  dean_id: string | null
  dean_name: string | null
  dept_count: number
  created_at: string
}

interface Profile {
  id: string
  full_name: string
  email: string
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: '#0d1525',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Faculty Card ─────────────────────────────────────────────────────────────

function FacultyCard({
  faculty, deans, onAssignDean, onDelete
}: {
  faculty: Faculty
  deans: Profile[]
  onAssignDean: (facultyId: string, deanId: string) => void
  onDelete: (id: string) => void
}) {
  const [assigning, setAssigning] = useState(false)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(37,99,235,0.15)',
            border: '1px solid rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={18} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {faculty.name}
            </p>
            <span style={{
              fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600,
              color: '#2563eb', background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: '4px', padding: '2px 6px',
            }}>
              {faculty.code}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(faculty.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
        >
          <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>
            {faculty.dept_count} department{faculty.dept_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Dean assignment */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dean
        </p>
        {faculty.dean_name ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                {faculty.dean_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {faculty.dean_name}
            </span>
            <button
              onClick={() => setAssigning(true)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--brand)' }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAssigning(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
              width: '100%',
            }}
          >
            <UserCheck size={13} style={{ color: 'var(--gold)' }} />
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--gold)', fontWeight: 500 }}>
              Assign Dean
            </span>
          </button>
        )}

        {assigning && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ position: 'relative' }}>
              <select
                className="input"
                style={{ width: '100%', appearance: 'none', paddingRight: '32px' }}
                defaultValue=""
                onChange={e => {
                  if (e.target.value) {
                    onAssignDean(faculty.id, e.target.value)
                    setAssigning(false)
                  }
                }}
              >
                <option value="" disabled>Select a dean...</option>
                {deans.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name} — {d.email}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            <button
              onClick={() => setAssigning(false)}
              style={{ marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [deans, setDeans] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uniId, setUniId] = useState<string | null>(null)

  // New faculty form
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: profile } = await supabase
      .from('profiles').select('university_id').eq('id', session.user.id).single()
    if (!profile) return
    setUniId(profile.university_id)

    // Load faculties with dept count
    const { data: facData } = await supabase
      .from('faculties')
      .select(`id, name, code, dean_id, created_at, departments(count)`)
      .eq('university_id', profile.university_id)
      .order('created_at', { ascending: false })

    // Load dean profiles for this university
    const { data: deanData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('university_id', profile.university_id)
      .eq('role', 'dean')

    // Resolve dean names
    const deanMap: Record<string, string> = {}
      ; (deanData ?? []).forEach(d => { deanMap[d.id] = d.full_name })

    setFaculties((facData ?? []).map(f => ({
      id: f.id,
      name: f.name,
      code: f.code,
      dean_id: f.dean_id,
      dean_name: f.dean_id ? (deanMap[f.dean_id] ?? null) : null,
      dept_count: (f.departments as any)?.[0]?.count ?? 0,
      created_at: f.created_at,
    })))
    setDeans(deanData ?? [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('faculties')
        .insert({ name: newName.trim(), code: newCode.trim().toUpperCase(), university_id: uniId })
      if (err) throw new Error(err.message)
      setNewName(''); setNewCode('')
      setShowModal(false)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAssignDean(facultyId: string, deanId: string) {
    await supabase.from('faculties').update({ dean_id: deanId }).eq('id', facultyId)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this faculty? Departments linked to it may be affected.')) return
    await supabase.from('faculties').delete().eq('id', id)
    await loadData()
  }

  const filtered = faculties.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Faculties
          </h1>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
            {faculties.length} {faculties.length === 1 ? 'faculty' : 'faculties'} · Manage and assign deans
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
        >
          <Plus size={15} />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '24px' }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search faculties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
          <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
            {search ? 'No faculties match your search.' : 'No faculties yet. Add your first faculty.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(f => (
            <FacultyCard
              key={f.id}
              faculty={f}
              deans={deans}
              onAssignDean={handleAssignDean}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {showModal && (
        <Modal title="Add New Faculty" onClose={() => { setShowModal(false); setError('') }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                display: 'flex', gap: '8px', alignItems: 'center',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px', padding: '10px 12px',
              }}>
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: '#ef4444' }}>{error}</p>
              </div>
            )}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Faculty Name</label>
              <input
                required
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Faculty of Engineering"
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Faculty Code</label>
              <input
                required
                type="text"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. ENG"
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                maxLength={10}
              />
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Short uppercase code used across the system
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setShowModal(false); setError('') }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Faculty'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}