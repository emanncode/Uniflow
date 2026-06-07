import { createAdminClient } from '@/lib/supabase-admin'
import { generateTempPassword } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { full_name, email, role, department_id, university_id } = await req.json()
    const normalizedRole = (role || 'lecturer').toLowerCase();
    console.log(`API Create Staff: Creating ${normalizedRole} ${email} for university ${university_id}`);

    const supabase = createAdminClient()

    // 1. create auth user with temp password
    const tempPassword = generateTempPassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
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
      email,
      role: normalizedRole,
      university_id,
      department_id: department_id || null,
      status: 'active',
    })

    if (profileError) {
      console.error("API Create Staff: Profile error:", profileError.message);
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    console.log(`API Create Staff: Profile created successfully for ${email}`);

    // 3. send password reset so they set their own password
    await supabase.auth.resetPasswordForEmail(email)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("API Create Staff: Internal error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
