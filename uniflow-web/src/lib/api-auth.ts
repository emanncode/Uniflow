import { NextResponse } from "next/server";
import { canManageUniversity, isSuperAdmin } from "./auth";

/**
 * Shared auth helper for API routes.
 * Returns a NextResponse error if unauthorized, otherwise null (meaning proceed).
 */
export async function requireUniversityAdmin(
  universityId: string | null | undefined
): Promise<NextResponse | null> {
  if (!universityId) {
    return NextResponse.json(
      { error: "university_id is required" },
      { status: 400 }
    );
  }

  if (!(await canManageUniversity(universityId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return null;
}

export async function requireSuperAdmin(): Promise<NextResponse | null> {
  if (!(await isSuperAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized: Only Uniflow Admins can perform this action." },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Wrapper to protect route handlers.
 * Usage:
 * export async function POST(req: Request) {
 *   const authError = await withUniversityAdmin(req, async (body) => { ... });
 *   if (authError) return authError;
 * }
 * But for simplicity, call requireUniversityAdmin inside.
 */
export { requireUniversityAdmin as withUniversityAdmin };
