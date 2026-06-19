import { createAdminClient } from '@/lib/supabase-admin'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'
import { canManageUniversity } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { full_name, email, role, department_id, university_id, level } = await req.json()

    // ── Security: Authorization Check ──────────────────────────────────────
    if (!university_id) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 })
    }
    
    const isAuthorized = await canManageUniversity(university_id)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to create staff for this university.' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const normalizedRole = (role || 'lecturer').toLowerCase();

    // Server-side domain typo correction + validation.
    // Uses normalizeOrThrow so invalid/misspelled domains (not correctable) result in error before any profile creation.
    let finalEmail: string
    try {
      finalEmail = normalizeOrThrow(email)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Invalid email address' }, { status: 400 })
    }

    // Note: normalizeOrThrow already applies corrections for known typos.
    // If you need to know if it was corrected, you can call validateAndNormalizeEmail separately.
    if (finalEmail.toLowerCase() !== (email || '').trim().toLowerCase()) {
      console.log(`API Create Staff: Corrected email domain ${email} -> ${finalEmail}`)
    }

    const parsedLevel =
      level !== undefined && level !== null && level !== ''
        ? parseInt(String(level), 10)
        : null
    const validLevels = [100, 200, 300, 400, 500]
    if (normalizedRole === 'student') {
      if (!parsedLevel || !validLevels.includes(parsedLevel)) {
        return NextResponse.json(
          { error: 'Student level is required (100, 200, 300, 400, or 500)' },
          { status: 400 },
        )
      }
    } else if (parsedLevel !== null && !validLevels.includes(parsedLevel)) {
      return NextResponse.json({ error: 'Invalid level value' }, { status: 400 })
    }

    console.log(`API Create Staff: Creating ${normalizedRole} ${finalEmail} for university ${university_id}`);

    const supabase = createAdminClient()

    // 1. create auth user with temp password
    const tempPassword = generateTempPassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: finalEmail,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error("API Create Staff: Auth error:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    console.log(`API Create Staff: Auth user created with ID ${authData.user.id}`);

    // 2. create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      email: finalEmail,
      role: normalizedRole,
      university_id,
      department_id: department_id || null,
      level: normalizedRole === 'student' ? parsedLevel : null,
      status: 'active',
    })

    if (profileError) {
      console.error("API Create Staff: Profile error:", profileError.message);
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    console.log(`API Create Staff: Profile created successfully for ${finalEmail}`);

    // 3. send password reset so they set their own password
    // NOTE: This might fail if SMTP is not configured, but we proceed anyway as we return tempPassword
    try {
      await supabase.auth.resetPasswordForEmail(finalEmail)
    } catch (e: unknown) {
      console.warn("API Create Staff: Failed to send reset email, but user was created.")
    }

    return NextResponse.json({ success: true, tempPassword })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred'
    console.error("API Create Staff: Internal error:", message);
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
