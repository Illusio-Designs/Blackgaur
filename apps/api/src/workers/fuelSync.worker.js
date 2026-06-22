'use strict';

const cron = require('node-cron');
const env = require('../config/env');
const { syncFuelTransactions } = require('../services/fuel-card/fuelSync.service');

let task = null;

/** Schedule the fuel-card sync cron (TMS Architecture §7.3, every 30 min by default). */
function start() {
  if (!cron.validate(env.FUEL_SYNC_CRON)) {
    // eslint-disable-next-line no-console
    console.warn(`[fuelSync] invalid cron "${env.FUEL_SYNC_CRON}", worker disabled`);
    return null;
  }
  task = cron.schedule(env.FUEL_SYNC_CRON, async () => {
    try {
      const result = await syncFuelTransactions();
      // eslint-disable-next-line no-console
      console.log('[fuelSync] done', result);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[fuelSync] failed:', e.message);
    }
  });
  // eslint-disable-next-line no-console
  console.log(`[fuelSync] scheduled "${env.FUEL_SYNC_CRON}"`);
  return task;
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop };
