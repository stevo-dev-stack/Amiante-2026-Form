import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const admin = verifyCredentials(username, password);
  if (!admin) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  await createSession(admin.username, admin.displayName);
  return NextResponse.json({ success: true, displayName: admin.displayName });
}
