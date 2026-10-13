import { createSession, findUserByEmail, toSafeUser, verifyPassword } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.salt, user.passwordHash))) {
    return Response.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const token = await createSession(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ user: toSafeUser(user) });
}
