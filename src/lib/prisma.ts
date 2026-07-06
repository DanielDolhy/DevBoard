import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton PrismaClient instance.
 *
 * In development Next.js hot-reloads modules, which would create a new
 * PrismaClient on every reload and quickly exhaust database connections.
 * Caching the client on `globalThis` prevents this.
 *
 * Prisma 7 requires an explicit driver adapter — we use `@prisma/adapter-pg`
 * to connect to PostgreSQL via the `DATABASE_URL` environment variable.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
