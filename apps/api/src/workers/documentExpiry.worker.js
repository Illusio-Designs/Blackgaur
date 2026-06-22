'use strict';

const cron = require('node-cron');
const dayjs = require('dayjs');
const env = require('../config/env');
const prisma = require('../lib/prisma');

let task = null;

/**
 * Scan vehicles for documents (RC / insurance / fitness / permit) expiring
 * within the next 30 days or already expired, and emit alerts (TMS Architecture §17.2).
 * Returns the alert list (logged; hook into SMS/notification here when available).
 */
async function checkExpiringDocuments() {
  const horizon = dayjs().add(30, 'day').toDate();
  const vehicles = await prisma.vehicle.findMany({
    where: {
      deletedAt: null,
      OR: [
        { rcExpiry: { lte: horizon } },
        { insuranceExpiry: { lte: horizon } },
        { fitnessExpiry: { lte: horizon } },
        { permitExpiry: { lte: horizon } },
      ],
    },
    select: {
      id: true,
      registrationNo: true,
      rcExpiry: true,
      insuranceExpiry: true,
      fitnessExpiry: true,
      permitExpiry: true,
    },
  });

  const alerts = [];
  for (const v of vehicles) {
    for (const [field, label] of [
      ['rcExpiry', 'RC'],
      ['insuranceExpiry', 'Insurance'],
      ['fitnessExpiry', 'Fitness'],
      ['permitExpiry', 'Permit'],
    ]) {
      const d = v[field];
      if (d && dayjs(d).isBefore(horizon)) {
        const daysLeft = dayjs(d).diff(dayjs(), 'day');
        alerts.push({ vehicleId: v.id, registrationNo: v.registrationNo, document: label, expiry: d, daysLeft });
      }
    }
  }
  return alerts;
}

/** Schedule the daily document-expiry alert cron. */
function start() {
  if (!cron.validate(env.DOC_EXPIRY_CRON)) {
    // eslint-disable-next-line no-console
    console.warn(`[docExpiry] invalid cron "${env.DOC_EXPIRY_CRON}", worker disabled`);
    return null;
  }
  task = cron.schedule(env.DOC_EXPIRY_CRON, async () => {
    try {
      const alerts = await checkExpiringDocuments();
      // eslint-disable-next-line no-console
      console.log(`[docExpiry] ${alerts.length} document(s) expiring/expired`, alerts);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[docExpiry] failed:', e.message);
    }
  });
  // eslint-disable-next-line no-console
  console.log(`[docExpiry] scheduled "${env.DOC_EXPIRY_CRON}"`);
  return task;
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, checkExpiringDocuments };
