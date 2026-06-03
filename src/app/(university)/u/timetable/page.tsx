'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  CalendarDays, Plus, X, Loader2, Trash2,
  AlertCircle, Clock, MapPin, Users, BookOpen,
  AlertTriangle, ChevronDown, CheckCircle2,
} from 'lucide-react'

interface TimetableSlot {
  id: string
  course_name: string
  course_code: string
  lecturer_name: string
  venue: string
  day: string
  start_time: string
  end_time: string
  department_name: string
  conflict?: boolean
}

interface Course { id: string; name: string; code: string }
interface Lecturer { id: string; full_name: string }
interface Department { id: string; name: string }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const DAY_COLORS: Record<string, string> = {
  Monday: '#2563eb', Tuesday: '#8b5cf6', Wednesday: '#f59e0b',
  Thursday: '#22c55e', Friday: '#ef4444',
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Conflict Detection ────────────────────────────────────────────────────────

function detectConflicts(slots: TimetableSlot[]): TimetableSlot[] {
  return slots.map(slot => {
    const conflict = slots.some(other => {
      if (other.id === slot.id) return false
      if (other.day !== slot.day) return false
      // Time overlap check
      const sStart = slot.start_time, sEnd = slot.end_time
      const oStart = other.start_time, oEnd = other.end_time
      const overlaps = sStart < oEnd && sEnd > oStart
      if (!overlaps) return false
      // Conflict if same venue OR same lecturer
      return other.venue === slot.venue || other.lecturer_name === slot.lecturer_name
    })
    return { ...slot, conflict }
  })
}

// ─── Slot Card ─────────────────────────────────────────────────────────────────

function SlotCard({ slot, onDelete }: { slot: TimetableSlot; onDelete: (id: string) => void }) {
  const color = DAY_COLORS[slot.day] ?? '#2563eb'
  return (
    <div style={{
      background: slot.conflict ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${slot.conflict ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '12px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      position: 'relative',
    }}>
      {slot.conflict && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 8px', alignSelf: 'flex-start' }}>
          <AlertTriangle size={11} style={{ color: '#ef4444' }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '10px', fontWeight: 600, color: '#ef4444' }}>CONFLICT</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{slot.course_name}</p>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '10px', fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: '4px', padding: '1px 5px' }}>
            {slot.course_code}
          </span>
        </div>
        <button onClick={() => onDelete(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
          <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {slot.start_time} – {slot.end_time}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-secondary)' }}>{slot.venue}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-secondary)' }}>{slot.lecturer_name}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [activeDay, setActiveDay] = useState('Monday')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uniId, setUniId] = useState<string | null>(null)
  const [conflictCheck, setConflictCheck] = useState<string | null>(null)

  const [newCourseId, setNewCourseId] = useState('')
  const [newLecturerId, setNewLecturerId] = useState('')
  const [newVenue, setNewVenue] = useState('')
  const [newDay, setNewDay] = useState('Monday')
  const [newStart, setNewStart] = useState('08:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [newDeptId, setNewDeptId] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: profile } = await supabase.from('profiles').select('university_id').eq('id', session.user.id).single()
    if (!profile) return
    setUniId(profile.university_id)

    const [ttRes, courseRes, lecRes, deptRes] = await Promise.all([
      supabase.from('timetable').select(`
        id, venue, day, start_time, end_time,
        courses(name, code),
        profiles(full_name),
        departments(name)
      `).eq('university_id', profile.university_id).order('day').order('start_time'),
      supabase.from('courses').select('id, name, code').eq('university_id', profile.university_id).order('name'),
      supabase.from('profiles').select('id, full_name').eq('university_id', profile.university_id).eq('role', 'lecturer').order('full_name'),
      supabase.from('departments').select('id, name').eq('university_id', profile.university_id).order('name'),
    ])

    const rawSlots: TimetableSlot[] = (ttRes.data ?? []).map(t => ({
      id: t.id,
      course_name: (t.courses as any)?.name ?? '—',
      course_code: (t.courses as any)?.code ?? '—',
      lecturer_name: (t.profiles as any)?.full_name ?? '—',
      venue: t.venue,
      day: t.day,
      start_time: t.start_time,
      end_time: t.end_time,
      department_name: (t.departments as any)?.name ?? '—',
    }))

    setSlots(detectConflicts(rawSlots))
    setCourses(courseRes.data ?? [])
    setLecturers(lecRes.data ?? [])
    setDepartments(deptRes.data ?? [])
    setLoading(false)
  }

  // Check conflicts live in modal
  function checkConflictLive() {
    if (!newVenue || !newDay || !newStart || !newEnd || !newLecturerId) { setConflictCheck(null); return }
    const clash = slots.find(s => {
      if (s.day !== newDay) return false
      const overlaps = newStart < s.end_time && newEnd > s.start_time
      if (!overlaps) return false
      return s.venue === newVenue || s.lecturer_name === lecturers.find(l => l.id === newLecturerId)?.full_name
    })
    setConflictCheck(clash
      ? `⚠️ Conflict with "${clash.course_name}" at ${clash.start_time}–${clash.end_time} ${clash.venue === newVenue ? `(same venue: ${newVenue})` : `(same lecturer)`}`
      : null
    )
  }

  useEffect(() => { checkConflictLive() }, [newVenue, newDay, newStart, newEnd, newLecturerId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (conflictCheck) { setError('Resolve conflicts before saving.'); return }
    setError('')
    setSaving(true)
    try {
      if (newStart >= newEnd) throw new Error('End time must be after start time.')
      const { error: err } = await supabase.from('timetable').insert({
        course_id: newCourseId,
        lecturer_id: newLecturerId,
        department_id: newDeptId || null,
        venue: newVenue.trim(),
        day: newDay,
        start_time: newStart,
        end_time: newEnd,
        university_id: uniId,
      })
      if (err) throw new Error(err.message)
      setNewCourseId(''); setNewLecturerId(''); setNewVenue(''); setNewDeptId('')
      setShowModal(false)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this timetable slot?')) return
    await supabase.from('timetable').delete().eq('id', id)
    await loadData()
  }

  const daySlots = slots.filter(s => s.day === activeDay)
  const conflictCount = slots.filter(s => s.conflict).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Timetable</h1>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
            {slots.length} scheduled slots
            {conflictCount > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '8px' }}>· {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Plus size={15} /> Add Slot
        </button>
      </div>

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
          <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: '#ef4444' }}>
            {conflictCount} timetable conflict{conflictCount !== 1 ? 's' : ''} detected. Slots marked in red have overlapping venues or lecturers.
          </p>
        </div>
      )}

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {DAYS.map(day => {
          const count = slots.filter(s => s.day === day).length
          const hasConflict = slots.some(s => s.day === day && s.conflict)
          const active = day === activeDay
          const color = DAY_COLORS[day]
          return (
            <button key={day} onClick={() => setActiveDay(day)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              border: active ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.08)',
              background: active ? `${color}15` : 'transparent',
              fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 400,
              color: active ? color : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {day}
              <span style={{ fontSize: '11px', background: active ? `${color}25` : 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 5px', color: active ? color : 'var(--text-muted)' }}>
                {count}
              </span>
              {hasConflict && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand)' }} />
        </div>
      ) : daySlots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
          <CalendarDays size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
            No classes scheduled for {activeDay}. Add a slot to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {daySlots
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map(slot => <SlotCard key={slot.id} slot={slot} onDelete={handleDelete} />)}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <Modal title="Add Timetable Slot" onClose={() => { setShowModal(false); setError(''); setConflictCheck(null) }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: '#ef4444' }}>{error}</p>
              </div>
            )}

            {conflictCheck && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '10px 12px' }}>
                <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: '#f59e0b', lineHeight: 1.5 }}>{conflictCheck}</p>
              </div>
            )}

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Course</label>
              <div style={{ position: 'relative' }}>
                <select required value={newCourseId} onChange={e => setNewCourseId(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', paddingRight: '32px', boxSizing: 'border-box' }}>
                  <option value="" disabled>Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Lecturer</label>
              <div style={{ position: 'relative' }}>
                <select required value={newLecturerId} onChange={e => setNewLecturerId(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', paddingRight: '32px', boxSizing: 'border-box' }}>
                  <option value="" disabled>Select lecturer...</option>
                  {lecturers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Day</label>
                <div style={{ position: 'relative' }}>
                  <select required value={newDay} onChange={e => setNewDay(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', paddingRight: '28px', boxSizing: 'border-box' }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Venue</label>
                <input required type="text" value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="LT 1, Hall A..." className="input" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Start Time</label>
                <select required value={newStart} onChange={e => setNewStart(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', boxSizing: 'border-box' }}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>End Time</label>
                <select required value={newEnd} onChange={e => setNewEnd(e.target.value)} className="input" style={{ width: '100%', appearance: 'none', boxSizing: 'border-box' }}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="button" onClick={() => { setShowModal(false); setError(''); setConflictCheck(null) }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={saving || !!conflictCheck} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: conflictCheck ? 0.5 : 1 }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Add Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}