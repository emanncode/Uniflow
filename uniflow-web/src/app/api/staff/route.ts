import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const universityId = searchParams.get('university_id')

    if (!universityId) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch all profiles for this university using the service role (bypassing RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status, department_id, created_at')
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, full_name, email, department_id, status } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    // Get current profile to check if email changed
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('API Staff PATCH: Fetch current profile failed:', fetchError.message)
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const updates: any = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (department_id !== undefined) updates.department_id = department_id
    if (status !== undefined) updates.status = status

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

    console.log(`API Staff DELETE: Removing staff member ${id}`)
    const supabase = createAdminClient()

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
