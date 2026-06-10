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

    const updates: any = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (department_id !== undefined) updates.department_id = department_id
    if (status !== undefined) updates.status = status

    if (email) {
      try {
        const normalizedEmail = normalizeOrThrow(email)
        updates.email = normalizedEmail
        
        // Also update auth email if changed
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          email: normalizedEmail,
        })
        if (authError) throw authError
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Staff PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = createAdminClient()

    // 1. Delete from auth (cascades or at least removes login)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      // If auth delete fails, try deleting profile directly just in case
      console.warn('API Staff DELETE: Auth delete failed, trying profile delete:', authError.message)
    }

    // 2. Delete profile (usually auth delete cascades if set up, but let's be safe)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Staff DELETE error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
