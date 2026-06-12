import { createAdminClient } from '@/lib/supabase-admin'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { normalizeOrThrow } from '@/lib/email'
import { isSuperAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // ── Security: SuperAdmin Authorization Check ───────────────────────────
    const authorized = await isSuperAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only Uniflow Admins can approve universities.' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const { registrationId } = await request.json()
    const supabase = createAdminClient()

    // 1. Get registration details
    const { data: reg, error: regError } = await supabase
      .from('university_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Validate and normalize email (defense-in-depth for profile creation).
    // normalizeOrThrow will error on invalid or uncorrectable misspelled domains.
    let finalEmail: string
    try {
      finalEmail = normalizeOrThrow(reg.official_email)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Invalid email address in registration' }, { status: 400 })
    }

    if (finalEmail.toLowerCase() !== (reg.official_email || '').trim().toLowerCase()) {
      console.log(`Approve University: Corrected email domain ${reg.official_email} -> ${finalEmail}`)
    }

    // 2. Create auth user
    const tempPassword = generateTempPassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: finalEmail,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // 3. Create university record
    const { data: uniData, error: uniError } = await supabase
      .from('universities')
      .insert({
        name: reg.university_name,
        short_name: reg.short_name,
        country: reg.country,
        state: reg.state,
        is_active: true,
        status: 'approved',
      })
      .select()
      .single()

    if (uniError) {
      // Cleanup auth user if university creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: uniError.message }, { status: 500 })
    }

    // 4. Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      university_id: uniData.id,
      full_name: reg.contact_person_name,
      email: finalEmail,
      role: 'university_admin',
    })

    if (profileError) {
       return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 5. Send password reset email
    const host = request.headers.get('host') || ''
    const isLocal = host.includes('localhost') || host.includes('lvh.me')
    const protocol = isLocal ? 'http' : 'https'
    
    // Construct the redirect URL for the university admin portal
    // We follow the lib's convention: [short_name]-admin.[base_domain]
    let baseDomain = 'uniflow.com.ng'
    if (host.includes('lvh.me')) baseDomain = 'lvh.me:3000'
    else if (host.includes('localhost')) baseDomain = 'localhost:3000'

    const redirectTo = `${protocol}://${reg.short_name}-admin.${baseDomain}/login`

    await supabase.auth.resetPasswordForEmail(finalEmail, {
      redirectTo,
    })

    // 6. Update registration status
    await supabase
      .from('university_registrations')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', registrationId)

    return NextResponse.json({ success: true, tempPassword })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
