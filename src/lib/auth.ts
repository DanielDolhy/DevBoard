import jwt, { type SignOptions } from "jsonwebtoken";
import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Payload embedded in every JWT issued by the auth helper. */
export interface SessionPayload {
  /** User UUID from the database. */
  userId: string;
  /** Username (convenience — avoids a DB round-trip for display). */
  username: string;
  /** Standard JWT issued-at (epoch seconds). */
  iat?: number;
  /** Standard JWT expiration (epoch seconds). */
  exp?: number;
}

/** The authenticated session returned to route handlers. */
export interface Session {
  userId: string;
  username: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET ?? "devboard-local-secret-DO-NOT-USE-IN-PRODUCTION";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Create a signed JWT for a given user.
 *
 * Usage:
 * ```ts
 * const token = signToken({ userId: user.id, username: user.username });
 * ```
 */
export function signToken(payload: Omit<SessionPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT. Returns `null` if the token is invalid or expired.
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Request-level session extraction (Now supports Cookies & Authorization Header)
// ---------------------------------------------------------------------------

import { cookies } from "next/headers";

/**
 * Extract the authenticated session from the current request.
 *
 * Reads the `auth_token` cookie first, falling back to `Authorization: Bearer <token>`.
 */
export async function getSession(): Promise<Session | null> {
  let token: string | undefined;

  // 1. Try Cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("auth_token")?.value;

  if (cookieToken) {
    token = cookieToken;
  } else {
    // 2. Try Header Fallback
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);

  if (!payload) return null;

  return {
    userId: payload.userId,
    username: payload.username,
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

export async function requireSession(): Promise<Session | Response> {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Valid auth_token cookie or Bearer token required" },
      { status: 401 }
    );
  }

  return session;
}
