'use strict';

const { PrismaClient } = require('@prisma/client');

/**
 * Singleton PrismaClient. Reused across hot-reloads in dev to avoid
 * exhausting DB connections.
 * @type {PrismaClient}
 */
const prisma =
  global.__blackgaurPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__blackgaurPrisma = prisma;
}

module.exports = prisma;
