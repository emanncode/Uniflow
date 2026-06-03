'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Building2, Plus, Search, X, Loader2, Trash2,
  UserCheck, ChevronDown, AlertCircle, BookOpen,
} from 'lucide-react'

interface Department {
  id:          string
  name:        string
  code:        string
  faculty_id:  string
  faculty_name: string
  hod_id:      string | null
  hod_name:    string | null
  created_at:  string
}

interface Faculty  { id: string; name: string; code: string }
interface Profile  { id: string; full_name: string; email: string }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function DeptRow({
  dept, hods, onAssignHod, onDelete
}: {
  dept: Department
  hods: Profile[]
  onAssignHod: (deptId: string, hodId: string) => void
  onDelete: (id: string) => void
}) {
  const [assigning, setAssigning] = useState(false)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 160px 200px 40px',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {/* Name + Faculty */}
      <div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {dept.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
          <span style={{
            fontFamily: 'Sora, sans-serif', fontSize: '10px', fontWeight: 600,
            color: '#8b5cf6', background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '4px', padding: '1px 5px',
          }}>
            {dept.code}
          </span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}>
            {dept.faculty_name}
          </span>
        </div>
      </div>

      {/* Faculty badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {dept.faculty_name}
        </span>
      </div>

      {/* HOD */}
      <div>
        {assigning ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                className="input"
                style={{ width: '100%', appearance: 'none', padding: '6px 28px 6px 10px', fontSize: '12px' }}
                defaultValue=""
                onChange={e => {
                  if (e.target.value) { onAssignHod(dept.id, e.target.value); setAssigning(false) }
                }}
              >
                <option value="" disabled>Select HOD...</option>
                {hods.map(h => <option key={h.id} value={h.id}>{h.full_name}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            <button onClick={() => setAssigning(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        ) : dept.hod_name ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                {dept.hod_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>{dept.hod_name}</span>
            <button
              onClick={() => setAssigning(true)}
              style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '10px', color: 'var(--brand)' }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAssigning(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '6px', padding: '5px 9px', cursor: 'pointer' }}
          >
            <UserCheck size={11} style={{ color: 'var(--gold)' }} />
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--gold)', fontWeight: 500 }}>Assign HOD</span>
          </button>
        )}
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(dept.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  )
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [faculties,   setFaculties]   = useState<Faculty[]>([])
  const [hods,        setHods]        = useState<Profile[]>([])
  const [search,      setSearch]      = useState('')
  const [filterFac,   setFilterFac]   = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [uniId,       setUniId]       = useState<string | null>(null)

  const [newName,      setNewName]      = useState('')
  const [newCode,      setNewCode]      = useState('')
  const [newFacultyId, setNewFacultyId] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: profile } = await supabase.from('profiles').select('university_id, role, faculty_id').eq('id', session.user.id).single()
    if (!profile) return
    setUniId(profile.university_id)

    const [facRes, deptRes, hodRes] = await Promise.all([
      supabase.from('faculties').select('id, name, code').eq('university_id', profile.university_id).order('name'),
      supabase.from('departments').select('id, name, code, faculty_id, hod_id, created_at, faculties(name)').eq('university_id', profile.university_id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email').eq('university_id', profile.university_id).eq('role', 'hod'),
    ])

    const facMap: Record<string, string> = {}
    ;(facRes.data ?? []).forEach(f => { facMap[f.id] = f.name })

    const hodMap: Record<string, string> = {}
    ;(hodRes.data ?? []).forEach(h => { hodMap[h.id] = h.full_name })

    setFaculties(facRes.data ?? [])
    setHods(hodRes.data ?? [])
    setDepartments((deptRes.data ?? []).map(d => ({
      id:           d.id,
      name:         d.name,
      code:         d.code,
      faculty_id:   d.faculty_id,
      faculty_name: (d.faculties as any)?.name ?? facMap[d.faculty_id] ?? '—',
      hod_id:       d.hod_id,
      hod_name:     d.hod_id ? (hodMap[d.hod_id] ?? null) : null,
      created_at:   d.created_at,
    })))
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { error: err } = await supabase.from('departments').insert({
        name: newName.trim(),
        code: newCode.trim().toUpperCase(),
        faculty_id: newFacultyId,
        university_id: uniId,
      })
      if (err) throw new Error(err.message)
      setNewName(''); setNewCode(''); setNewFacultyId('')
      setShowModal(false)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAssignHod(deptId: string, hodId: string) {
    await supabase.from('departments').update({ hod_id: hodId }).eq('id', deptId)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this department?')) return
    await supabase.from('departments').delete().eq('id', id)
    await loadData()
  }

  const filtered = departments.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
    const matchFac    = !filterFac || d.faculty_id === filterFac
    return matchSearch && matchFac
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Departments</h1>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
            {departments.length} department{departments.length !== 1 ? 's' : ''} · Assign HODs and manage structure
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Plus size={15} /> Add Department
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <select value={filterFac} onChange={e => setFilterFac(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', paddingRight: '32px' }}>
            <option value="">All Faculties</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px 40px', gap: '16px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {['Department', 'Faculty', 'Head of Department', ''].map(h => (
            <span key={h} style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Building2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
              {search || filterFac ? 'No departments match your filters.' : 'No departments yet. Add your first department.'}
            </p>
          </div>
        ) : (
          filtered.map(d => <DeptRow key={d.id} dept={d} hods={hods} onAssignHod={handleAssignHod} onDelete={handleDelete} />)
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Add New Department" onClose={() => { setShowModal(false); setError('') }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: '#ef4444' }}>{error}</p>
              </div>
            )}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Faculty</label>
              <div style={{ position: 'relative' }}>
                <select required value={newFacultyId} onChange={e => setNewFacultyId(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', paddingRight: '32px', boxSizing: 'border-box' }}>
                  <option value="" disabled>Select a faculty...</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Department Name</label>
              <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Computer Science" className="input" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Department Code</label>
              <input required type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. CSC" className="input" style={{ width: '100%', boxSizing: 'border-box' }} maxLength={10} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Department'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}