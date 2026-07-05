import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { validateAndNormalizeEmail } from '@/lib/email'
import { canManageUniversity, isSuperAdmin } from '@/lib/auth'
import { passwordResetUrlForProfile } from '@/lib/password-reset'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize email for lookup (handles typos)
    const emailCheck = validateAndNormalizeEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error || 'Invalid email address' }, { status: 400 })
    }
    const lookupEmail = emailCheck.normalized

    const supabase = createAdminClient()

    // 1. Find user by email in profiles table to get their ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, university_id, role, universities(short_name)')
      .eq('email', lookupEmail)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const superAdmin = await isSuperAdmin()
    const canManage =
      profile.university_id &&
      (await canManageUniversity(profile.university_id))

    if (!superAdmin && !canManage) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const universityShortName = (
      profile.universities as { short_name?: string } | null
    )?.short_name
    const redirectTo = passwordResetUrlForProfile(
      profile.role,
      universityShortName,
      req.headers.get('host') || '',
    )
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      lookupEmail,
      { redirectTo },
    )

    if (resetError) throw resetError

    return NextResponse.json({ success: true, message: 'Password reset link sent.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reset password failed'
    console.error('Reset Password Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
