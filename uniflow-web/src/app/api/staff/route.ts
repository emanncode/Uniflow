import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'
import { canManageUniversity } from '@/lib/auth'

const LECTURER_ROLES = ['lecturer', 'dean', 'hod']

function parseRoles(roleParam: string | null): string[] | null {
  if (!roleParam) return null
  const roles = roleParam
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean)
  return roles.length > 0 ? roles : null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const universityId = searchParams.get('university_id')
    const countOnly = searchParams.get('count_only') === 'true'
    const roles = parseRoles(searchParams.get('role'))
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : null

    if (!universityId) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 })
    }

    const isAuthorized = await canManageUniversity(universityId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = createAdminClient()

    if (countOnly) {
      const [studentRes, lecturerRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('university_id', universityId)
          .eq('role', 'student'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('university_id', universityId)
          .in('role', LECTURER_ROLES),
      ])

      if (studentRes.error || lecturerRes.error) {
        const message = studentRes.error?.message ?? lecturerRes.error?.message
        return NextResponse.json({ error: message }, { status: 500 })
      }

      return NextResponse.json({
        counts: {
          students: studentRes.count ?? 0,
          lecturers: lecturerRes.count ?? 0,
        },
      })
    }

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        status,
        department_id,
        level,
        created_at,
        departments (
          faculty
        )
      `)
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })

    if (roles) {
      query = query.in('role', roles)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      let fallbackQuery = supabase
        .from('profiles')
        .select('id, full_name, email, role, status, department_id, level, created_at')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false })

      if (roles) {
        fallbackQuery = fallbackQuery.in('role', roles)
      }
      if (limit) {
        fallbackQuery = fallbackQuery.limit(limit)
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery

      if (fallbackError) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        data: fallbackData,
        warning: 'Faculty mapping disabled due to join error: ' + error.message,
      })
    }

    const flattened = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      faculty: (p.departments as { faculty?: string } | null)?.faculty || null,
      departments: undefined,
    }))

    return NextResponse.json({ data: flattened })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, full_name, email, department_id, status, role, level } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('email, university_id')
      .eq('id', id)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const isAuthorized = await canManageUniversity(currentProfile.university_id)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (department_id !== undefined) updates.department_id = department_id
    if (status !== undefined) updates.status = status
    if (role !== undefined) updates.role = role.toLowerCase()
    if (level !== undefined) {
      const parsedLevel =
        level === null || level === '' ? null : parseInt(String(level), 10)
      const validLevels = [100, 200, 300, 400, 500]
      if (parsedLevel !== null && !validLevels.includes(parsedLevel)) {
        return NextResponse.json({ error: 'Invalid level value' }, { status: 400 })
      }
      updates.level = parsedLevel
    }

    if (email && email.toLowerCase() !== currentProfile.email?.toLowerCase()) {
      try {
        const normalizedEmail = normalizeOrThrow(email)
        updates.email = normalizedEmail

        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          email: normalizedEmail,
          email_confirm: true,
        })
        if (authError) throw authError
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid email'
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', id)
      .single()

    if (!currentProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const isAuthorized = await canManageUniversity(currentProfile.university_id)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.warn('API Staff DELETE: Auth delete failed:', authError.message)
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}