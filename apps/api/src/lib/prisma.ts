import { PrismaClient } from '@prisma/client'

/**
 * Keep a single PrismaClient instance during dev hot-reloads.
 * Works in ESM (type: module) with Bun/Elysia.
 */
declare global {
  // eslint-disable-next-line no-var
  var __PRISMA__: PrismaClient | undefined
}

export const prisma =
  globalThis.__PRISMA__ ??
  new PrismaClient({
    // Uncomment if you want query logs:
    // log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__PRISMA__ = prisma
}
