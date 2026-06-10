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

    const userId = profile.id

    // 2. Generate new temporary password
    const newPassword = generateTempPassword()

    // 3. Update user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (updateError) throw updateError

    // 4. Optionally send reset email too, but return the password so admin can share it
    await supabase.auth.resetPasswordForEmail(lookupEmail)

    return NextResponse.json({ success: true, tempPassword: newPassword })
  } catch (err: any) {
    console.error('Reset Password Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
