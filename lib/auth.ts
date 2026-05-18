import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret"
);

const COOKIE_NAME = "sitcom_admin_session";

type AdminUser = { username: string; password: string; displayName: string };

function getAdminUsers(): AdminUser[] {
  try {
    return JSON.parse(process.env.ADMIN_USERS ?? "[]");
  } catch {
    return [];
  }
}

export async function createSession(username: string, displayName: string) {
  const token = await new SignJWT({ role: "admin", username, displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export type SessionInfo = {
  username: string;
  displayName: string;
};

/** Returns the session info object, or null if not authenticated. */
export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    // Old-format JWTs (created before multi-admin) won't have username/displayName.
    // Reject them so the user is forced to log in again with the new system.
    if (!payload.username || !payload.displayName) return null;
    return {
      username: payload.username as string,
      displayName: payload.displayName as string,
    };
  } catch {
    return null;
  }
}

/** Verifies credentials and returns the matching admin, or null. */
export function verifyCredentials(
  username: string,
  password: string
): AdminUser | null {
  const admins = getAdminUsers();
  return admins.find(
    (a) => a.username === username && a.password === password
  ) ?? null;
}
