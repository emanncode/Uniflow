import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'
import { canManageUniversity } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const universityId = searchParams.get('university_id')

    if (!universityId) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 })
    }

    // ── Security: Authorization Check ──────────────────────────────────────
    const isAuthorized = await canManageUniversity(universityId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const supabase = createAdminClient()

    console.log('API Staff GET: Fetching for university:', universityId)

    // Fetch all profiles for this university using the service role (bypassing RLS)
    // We attempt the join first, but we'll log exactly what happens
    const { data, error } = await supabase
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

    if (error) {
      console.error('API Staff GET: Supabase error:', error.message, error.details, error.hint)
      
      // Fallback: If the join failed, try fetching without the join to see if data exists at all
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, department_id, level, created_at')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false })
      
      if (fallbackError) {
        console.error('API Staff GET: Fallback also failed:', fallbackError.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`API Staff GET: Fallback succeeded. Found ${fallbackData?.length || 0} staff.`)
      return NextResponse.json({ 
        data: fallbackData, 
        warning: 'Faculty mapping disabled due to join error: ' + error.message 
      })
    }

    console.log(`API Staff GET: Success. Found ${data?.length || 0} staff members.`)

    // Flatten the departments.faculty into a simple property for easier consumption
    const flattened = (data || []).map((p: any) => ({
      ...p,
      faculty: p.departments?.faculty || null,
      departments: undefined // remove the nested object
    }))

    return NextResponse.json({ data: flattened })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, full_name, email, department_id, status, role, level } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    // Get current profile to check if email changed
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('email, university_id')
      .eq('id', id)
      .single()

    if (fetchError || !currentProfile) {
      console.error('API Staff PATCH: Fetch current profile failed:', fetchError?.message)
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // ── Security: Authorization Check ──────────────────────────────────────
    const isAuthorized = await canManageUniversity(currentProfile.university_id)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const updates: any = {}
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
        
        // Also update auth email if changed
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          email: normalizedEmail,
          email_confirm: true // Force confirmation so it changes immediately
        })
        if (authError) {
          console.error('API Staff PATCH: Auth email update failed:', authError.message)
          throw authError
        }
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('API Staff PATCH: Profile update failed:', updateError.message)
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Staff PATCH internal error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    // ── Security: Authorization Check ──────────────────────────────────────
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
    // ────────────────────────────────────────────────────────────────────────

    console.log(`API Staff DELETE: Removing staff member ${id}`)

    // 1. Delete from auth (cascades to profile if set up, or removes login)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.warn('API Staff DELETE: Auth delete failed (might be missing or already deleted):', authError.message)
    }

    // 2. Delete profile explicitly (in case CASCADE is not set up)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('API Staff DELETE: Profile delete failed:', profileError.message)
      throw profileError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Staff DELETE internal error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
