import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Prefer Neon Local Connect URL when available (for local dev), otherwise use DATABASE_URL
const overrideUrl = process.env.NEON_LOCAL_URL || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: overrideUrl
      ? {
          db: { url: overrideUrl },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
