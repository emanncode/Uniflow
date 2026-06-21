import { createAdminClient } from '@/lib/supabase-admin'
import { sendEmail, universityRejectedEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { registrationId, reason } = await req.json()
    const supabase = createAdminClient()

    const { data: reg } = await supabase
      .from('university_registrations')
      .select('university_name, official_email')
      .eq('id', registrationId)
      .single()

    await supabase
      .from('university_registrations')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    if (reg) {
      await sendEmail(
        reg.official_email,
        'Update on your Uniflow registration',
        universityRejectedEmail(reg.university_name, reason),
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}