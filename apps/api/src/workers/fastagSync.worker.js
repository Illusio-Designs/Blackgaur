'use strict';

const cron = require('node-cron');
const env = require('../config/env');
const { syncFastagTransactions } = require('../services/fastag/fastagSync.service');

let task = null;

/** Schedule the FASTag sync cron (TMS Architecture §6.4, every 15 min by default). */
function start() {
  if (!cron.validate(env.FASTAG_SYNC_CRON)) {
    // eslint-disable-next-line no-console
    console.warn(`[fastagSync] invalid cron "${env.FASTAG_SYNC_CRON}", worker disabled`);
    return null;
  }
  task = cron.schedule(env.FASTAG_SYNC_CRON, async () => {
    try {
      const result = await syncFastagTransactions();
      // eslint-disable-next-line no-console
      console.log('[fastagSync] done', result);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[fastagSync] failed:', e.message);
    }
  });
  // eslint-disable-next-line no-console
  console.log(`[fastagSync] scheduled "${env.FASTAG_SYNC_CRON}"`);
  return task;
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop };
