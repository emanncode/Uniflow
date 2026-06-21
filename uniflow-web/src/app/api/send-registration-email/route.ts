import { sendEmail, registrationReceivedEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, university_name } = await req.json()

    if (!email || !university_name) {
      return NextResponse.json(
        { error: 'email and university_name are required' },
        { status: 400 },
      )
    }

    await sendEmail(
      email,
      "We've received your Uniflow registration",
      registrationReceivedEmail(university_name),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('Send registration email error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}