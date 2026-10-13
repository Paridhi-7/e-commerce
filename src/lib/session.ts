import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import {
  getUserFromSessionToken,
  toSafeUser,
  type SafeUser,
} from "./db";

export const SESSION_COOKIE = "kartify_session";
export const GUEST_COOKIE = "kartify_guest";

/** The signed-in user (or null) for route handlers / server components. */
export async function getAuthUser(): Promise<SafeUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const user = await getUserFromSessionToken(token);
  return user ? toSafeUser(user) : null;
}

/** Owner id for carts / wishlists / orders: the user id, or a stable guest id. */
export async function getOwnerId(): Promise<string> {
  const user = await getAuthUser();
  if (user) return user.id;
  const jar = await cookies();
  const guest = jar.get(GUEST_COOKIE)?.value;
  if (guest) return `guest:${guest}`;
  // Route handlers may set cookies via the cookies() API.
  try {
    const token = randomBytes(12).toString("hex");
    jar.set(GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return `guest:${token}`;
  } catch (err) {
    console.error("couldn't set guest cookie", err);
    return `guest:${randomBytes(12).toString("hex")}`;
  }
}

export function unauthorized() {
  return Response.json({ error: "Not authorized" }, { status: 401 });
}
