import { createAdminClient } from '@/lib/supabase-admin'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'
import {
  normalizeOrThrow,
  sendEmail,
  universityApprovedEmail,
} from '@/lib/email'
import { isSuperAdmin } from '@/lib/auth'
import { universityAdminPasswordResetUrl } from '@/lib/password-reset'

export async function POST(request: Request) {
  try {
    const authorized = await isSuperAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only Uniflow Admins can approve universities.' }, { status: 403 })
    }

    const { registrationId } = await request.json()
    const supabase = createAdminClient()

    const { data: reg, error: regError } = await supabase
      .from('university_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    let finalEmail: string
    try {
      finalEmail = normalizeOrThrow(reg.official_email)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid email address in registration'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (finalEmail.toLowerCase() !== (reg.official_email || '').trim().toLowerCase()) {
      console.log(`Approve University: Corrected email domain ${reg.official_email} -> ${finalEmail}`)
    }

    const bootstrapPassword = generateTempPassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: finalEmail,
      password: bootstrapPassword,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

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
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: uniError.message }, { status: 500 })
    }

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

    await supabase
      .from('university_registrations')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', registrationId)

    const resetRedirect = universityAdminPasswordResetUrl(reg.short_name)
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: finalEmail,
      options: { redirectTo: resetRedirect },
    })

    let emailSent = false
    try {
      await sendEmail(
        finalEmail,
        'Your university is approved on Uniflow 🎉',
        universityApprovedEmail(
          reg.university_name,
          reg.short_name,
          finalEmail,
          linkData?.properties?.action_link ?? resetRedirect,
        ),
      )
      emailSent = true
    } catch (emailError) {
      console.error('Approve University: failed to send approval email:', emailError)
    }

    return NextResponse.json({
      success: true,
      emailSent,
      email: finalEmail,
      universityName: reg.university_name,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}