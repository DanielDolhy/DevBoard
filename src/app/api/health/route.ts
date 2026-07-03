import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight healthcheck endpoint that confirms the Next.js service is
 * running and returns the current server timestamp.
 *
 * In production, extend this to ping PostgreSQL and Redis to verify
 * full-stack readiness.
 */
export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "unknown",
    services: {
      postgres: {
        configured: !!process.env.DATABASE_URL,
      },
      redis: {
        configured: !!process.env.REDIS_URL,
      },
    },
  };

  return NextResponse.json(health, { status: 200 });
}
