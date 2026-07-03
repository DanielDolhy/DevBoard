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
// Request-level session extraction
// ---------------------------------------------------------------------------

/**
 * Extract the authenticated session from the current request.
 *
 * Reads the `Authorization: Bearer <token>` header. Returns `null` when
 * the token is missing, malformed, or expired — callers should respond
 * with 401 in that case.
 *
 * ```ts
 * // Inside a route handler:
 * const session = await getSession();
 * if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
 * ```
 */
export async function getSession(): Promise<Session | null> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
  };
}

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

/**
 * Require an authenticated session or immediately return a 401 Response.
 *
 * ```ts
 * export async function GET() {
 *   const session = await requireSession();
 *   if (session instanceof Response) return session;
 *   // session is now typed as Session
 * }
 * ```
 */
export async function requireSession(): Promise<Session | Response> {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Valid Bearer token required" },
      { status: 401 }
    );
  }

  return session;
}
