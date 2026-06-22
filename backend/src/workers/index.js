'use strict';

const env = require('../config/env');
const fastagSync = require('./fastagSync.worker');
const fuelSync = require('./fuelSync.worker');
const documentExpiry = require('./documentExpiry.worker');

/**
 * Start all cron workers. Skipped entirely when NODE_ENV=test.
 */
function startWorkers() {
  if (env.isTest) {
    // eslint-disable-next-line no-console
    console.log('[workers] skipped (NODE_ENV=test)');
    return;
  }
  fastagSync.start();
  fuelSync.start();
  documentExpiry.start();
}

function stopWorkers() {
  fastagSync.stop();
  fuelSync.stop();
  documentExpiry.stop();
}

module.exports = { startWorkers, stopWorkers };
