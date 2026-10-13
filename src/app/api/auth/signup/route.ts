import { createSession, createUser, createPendingVendor } from "@/lib/db";
import { toSafeUser } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        password?: string;
        role?: "customer" | "vendor";
        vendorName?: string;
      }
    | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const role = body?.role === "vendor" ? "vendor" : "customer";

  if (!name || !email || !password || !email.includes("@") || password.length < 6) {
    return Response.json(
      { error: "Provide a name, a valid email and a password of 6+ characters." },
      { status: 400 }
    );
  }

  let vendorId: string | undefined;
  if (role === "vendor") {
    const vendor = await createPendingVendor({ name: body?.vendorName?.trim() || `${name}'s store` });
    vendorId = vendor.id;
  }

  const user = await createUser({ email, name, password, role, vendorId });
  if (!user) {
    // A pending vendor profile might have been created above; harmless for the demo.
    return Response.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const token = await createSession(user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ user: toSafeUser(user) }, { status: 201 });
}
