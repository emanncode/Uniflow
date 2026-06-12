import { createAdminClient } from '@/lib/supabase-admin'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { validateAndNormalizeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Normalize email for lookup (handles typos in user input)
    const emailCheck = validateAndNormalizeEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error || 'Invalid email address' }, { status: 400 })
    }
    const lookupEmail = emailCheck.normalized

    const supabase = createAdminClient()

    // 1. Check if the user exists in profiles (registered by school admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('email', lookupEmail)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'This email is not registered in our system. Please contact your school administrator.' }, { status: 404 })
    }

    // ── Security Hardening: No more plaintext passwords ────────────────────
    // Instead of generating a temp password here and returning it (unsafe),
    // we trigger a standard secure password reset email.
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(lookupEmail)

    if (resetError) {
      console.error('Public Reset Error:', resetError.message)
      throw resetError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'A secure password reset link has been sent to your email address.',
      name: profile.full_name,
      role: profile.role
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred'
    console.error('Public Temp Password Error:', message)
    return NextResponse.json({ error: 'Failed to generate password. Please try again later.' }, { status: 500 })
  }
}
