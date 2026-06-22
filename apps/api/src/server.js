'use strict';

const env = require('./config/env');
const app = require('./app');
const { startWorkers, stopWorkers } = require('./workers');
const prisma = require('./lib/prisma');

// Fail fast on insecure production configuration.
env.validateProdSecrets();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Blackgaur API listening on :${env.PORT} (${env.NODE_ENV})`);
  startWorkers();
});

/** Graceful shutdown. */
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down...`);
  stopWorkers();
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (_e) {
      /* ignore */
    }
    process.exit(0);
  });
  // Force-exit if not closed in time.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
