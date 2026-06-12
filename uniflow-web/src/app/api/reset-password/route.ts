import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { validateAndNormalizeEmail } from '@/lib/email'
import { isSuperAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    // ── Security: SuperAdmin Authorization Check ───────────────────────────
    const authorized = await isSuperAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

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
      .select('id')
      .eq('email', lookupEmail)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // ── Security Hardening: Standard Reset Email ───────────────────────────
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(lookupEmail)

    if (resetError) throw resetError

    return NextResponse.json({ success: true, message: 'Password reset link sent.' })
  } catch (err: any) {
    console.error('Reset Password Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
