import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'
import { requireUniversityAdmin } from '@/lib/api-auth'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const staffQuerySchema = z.object({
  university_id: z.string().min(1),
  count_only: z.string().optional(),
  role: z.string().optional(),
  limit: z.string().optional(),
})

const staffPatchSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  department_id: z.string().nullable().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  level: z.union([z.number(), z.string(), z.null()]).optional(),
})

const staffDeleteSchema = z.object({
  id: z.string().min(1),
})

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
    const parsedQuery = staffQuerySchema.parse({
      university_id: searchParams.get('university_id'),
      count_only: searchParams.get('count_only'),
      role: searchParams.get('role'),
      limit: searchParams.get('limit'),
    })

    const universityId = parsedQuery.university_id
    const countOnly = parsedQuery.count_only === 'true'
    const roles = parseRoles(parsedQuery.role || null)
    const limitParam = parsedQuery.limit
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : null

    const authError = await requireUniversityAdmin(universityId)
    if (authError) return authError

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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const rawBody = await req.json()
    const parsed = staffPatchSchema.parse(rawBody)
    const { id, full_name, email, department_id, status, role, level } = parsed

    const supabase = createAdminClient()

    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('email, university_id')
      .eq('id', id)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const authError = await requireUniversityAdmin(currentProfile.university_id)
    if (authError) return authError

    const ip = await getClientIp()
    const rateError = await rateLimit(`staff-update:${currentProfile.university_id}:${ip}`, 10, 60_000)
    if (rateError) return rateError

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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const rawBody = await req.json()
    const { id } = staffDeleteSchema.parse(rawBody)

    const supabase = createAdminClient()

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', id)
      .single()

    if (!currentProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const authError = await requireUniversityAdmin(currentProfile.university_id)
    if (authError) return authError

    const ip = await getClientIp()
    const rateError = await rateLimit(`staff-delete:${currentProfile.university_id}:${ip}`, 5, 60_000)
    if (rateError) return rateError

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id)
    if (deleteAuthError) {
      console.warn('API Staff DELETE: Auth delete failed:', deleteAuthError.message)
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.issues }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}