import { createAdminClient } from '@/lib/supabase-admin'
import {
  resolveBaseDomainFromRequestHost,
  resolveProtocolFromRequestHost,
} from '@/lib/domain'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'
import {
  normalizeOrThrow,
  sendEmail,
  universityApprovedEmail,
} from '@/lib/email'
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

    // 5. Generate password reset link for approval email
    const host = request.headers.get('host') || ''
    const protocol = resolveProtocolFromRequestHost(host)
    const baseDomain = resolveBaseDomainFromRequestHost(host)
    const redirectTo = `${protocol}://${reg.short_name}-admin.${baseDomain}/u/reset-password`

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: finalEmail,
        options: { redirectTo },
      })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    const resetUrl = linkData.properties.action_link

    // 6. Update registration status
    await supabase
      .from('university_registrations')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', registrationId)

    // 7. Send approval email (non-blocking for API success)
    try {
      await sendEmail(
        finalEmail,
        `Your university has been approved — ${reg.university_name}`,
        universityApprovedEmail(
          reg.university_name,
          reg.short_name,
          finalEmail,
          resetUrl,
        ),
      )
    } catch (emailError) {
      console.error('Approve University: failed to send approval email:', emailError)
    }

    return NextResponse.json({ success: true, tempPassword })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
