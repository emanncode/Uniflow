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
  short_name:  string
  faculty_id:  string
  faculty_name: string
  hod_id:      string | null
  hod_name:    string | null
  created_at:  string
}

interface Faculty  { id: string; name: string; short_name: string }
interface Profile  { id: string; full_name: string; email: string }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
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
      gridTemplateColumns: '1fr 180px 200px 40px',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border-primary)',
      transition: 'all var(--transition)',
    }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {/* Name + Short Name code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          color: 'var(--text-secondary)', background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '4px', padding: '2px 6px',
          fontFamily: 'monospace',
          flexShrink: 0,
        }}>
          {dept.short_name}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {dept.name}
        </span>
      </div>

      {/* Faculty */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {dept.faculty_name}
        </span>
      </div>

      {/* HOD */}
      <div>
        {assigning ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                className="select"
                style={{ width: '100%', padding: '6px 28px 6px 10px', fontSize: '12px' }}
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
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {dept.hod_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{dept.hod_name}</span>
            <button
              onClick={() => setAssigning(true)}
              style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: 'var(--brand)' }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAssigning(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--warning-muted)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', transition: 'all var(--transition)' }}
          >
            <UserCheck size={11} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 500 }}>Assign HOD</span>
          </button>
        )}
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(dept.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
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

  const [newName,         setNewName]      = useState('')
  const [newShortName,    setNewShortName] = useState('')
  const [newFacultyId,    setNewFacultyId] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn("No session found in DepartmentsPage loadData");
      return;
    }

    const { data: profile, error: pErr } = await supabase.from('profiles').select('university_id, role, faculty_id').eq('id', session.user.id).single()
    if (pErr) {
      console.error("Error fetching profile in DepartmentsPage:", pErr);
      setLoading(false);
      return;
    }
    
    if (!profile?.university_id) {
      console.warn("User has no university_id in DepartmentsPage");
      setLoading(false);
      return;
    }

    setUniId(profile.university_id)
    console.log("DepartmentsPage: Loading data for university:", profile.university_id);

    try {
      // 1. Fetch faculties via Supabase
      const facRes = await supabase.from('faculties').select('id, name, short_name').eq('university_id', profile.university_id).order('name');
      if (facRes.error) console.error("Error fetching faculties:", facRes.error);

      // 2. Fetch departments via Supabase
      const deptRes = await supabase.from('departments').select('id, name, short_name, faculty_id, hod_id, created_at, faculties(name)').eq('university_id', profile.university_id).order('created_at', { ascending: false });
      if (deptRes.error) console.error("Error fetching departments:", deptRes.error);

      // 3. Fetch staff via API (service role proxy) to bypass RLS
      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`)
      const { data: allProfiles, error: sErr } = await staffRes.json()

      if (!staffRes.ok || sErr) throw new Error(sErr || 'Failed to fetch staff via API')

      const hodData = (allProfiles || []).filter((p: any) => (p.role || "").toLowerCase().trim() === "hod");
      console.log(`DepartmentsPage: Filtered ${hodData.length} HODs via API`);

      const facMap: Record<string, string> = {}
      ;(facRes.data ?? []).forEach((f: any) => { facMap[f.id] = f.name })

      const hodMap: Record<string, string> = {}
      hodData.forEach((h: any) => { hodMap[h.id] = h.full_name })

      setFaculties(facRes.data ?? [])
      setHods(hodData)
      setDepartments((deptRes.data ?? []).map((d: any) => ({
        id:           d.id,
        name:         d.name,
        short_name:   d.short_name,
        faculty_id:   d.faculty_id,
        faculty_name: (Array.isArray(d.faculties) ? d.faculties[0]?.name : (d.faculties as { name: string } | null)?.name) ?? facMap[d.faculty_id] ?? '—',
        hod_id:       d.hod_id,
        hod_name:     d.hod_id ? (hodMap[d.hod_id] ?? null) : null,
        created_at:   d.created_at,
      })))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error("DepartmentsPage: Data loading failed:", message);
    }
    
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { error: err } = await supabase.from('departments').insert({
        name: newName.trim(),
        short_name: newShortName.trim().toUpperCase(),
        faculty_id: newFacultyId,
        university_id: uniId,
      })
      if (err) throw new Error(err.message)
      setNewName(''); setNewShortName(''); setNewFacultyId('')
      setShowModal(false)
      await loadData()
    } catch (err: unknown) {
      setError((err as Error).message)
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
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.short_name.toLowerCase().includes(search.toLowerCase())
    const matchFac    = !filterFac || d.faculty_id === filterFac
    return matchSearch && matchFac
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Departments</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
          <select value={filterFac} onChange={e => setFilterFac(e.target.value)} className="select" style={{ width: '100%', paddingRight: '32px' }}>
            <option value="">All Faculties</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 200px 40px', gap: '16px', padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
          {['Department', 'Faculty', 'Head of Department', ''].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Building2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--danger-muted)', border: '1px solid var(--danger-muted)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
                <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Faculty</label>
              <div style={{ position: 'relative' }}>
                <select required value={newFacultyId} onChange={e => setNewFacultyId(e.target.value)} className="select" style={{ width: '100%', paddingRight: '32px', boxSizing: 'border-box' }}>
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
              <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Short Name</label>
              <input required type="text" value={newShortName} onChange={e => setNewShortName(e.target.value)} placeholder="e.g. CSC" className="input" style={{ width: '100%', boxSizing: 'border-box' }} maxLength={10} />
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