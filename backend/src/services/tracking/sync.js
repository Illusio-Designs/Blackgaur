'use strict';

const prisma = require('../../lib/prisma');
const { ADAPTERS, resolveConfig } = require('./registry');

const CONFIG_ID = 1;

/**
 * Poll every enabled pull-provider, normalise positions, and store them against
 * the matching vehicle. A vehicle matches when its gpsProvider === provider key
 * AND its gpsDeviceId === the position's device_id — so trucks on different
 * providers coexist without any provider-specific code outside the registry.
 *
 * Push providers (mode: 'push') are skipped here — they arrive via /tracking/ping.
 * @returns {Promise<{provider:string, fetched:number, stored:number, error?:string}[]>}
 */
async function syncAll() {
  const appConfig = await prisma.appConfig.findUnique({ where: { id: CONFIG_ID } });
  const providersCfg = appConfig?.integrations?.gpsProviders || {};
  const summary = [];

  for (const [key, settings] of Object.entries(providersCfg)) {
    const adapter = ADAPTERS[key];
    if (!adapter || adapter.mode !== 'pull' || settings.enabled === false) continue;

    const result = { provider: key, fetched: 0, stored: 0 };
    try {
      const cfg = resolveConfig(key, appConfig);
      if (!cfg.baseUrl) throw new Error('No baseUrl configured');
      const positions = await adapter.fetchPositions(cfg);
      result.fetched = positions.length;
      result.stored = await storePositions(key, positions);
    } catch (err) {
      result.error = err.message;
    }
    summary.push(result);
  }
  return summary;
}

/** Store normalised positions for a provider, matched to vehicles by device id. */
async function storePositions(providerKey, positions) {
  if (!positions.length) return 0;
  const ids = [...new Set(positions.map((p) => p.device_id).filter(Boolean))];
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null, gpsProvider: providerKey, gpsDeviceId: { in: ids } },
    select: { id: true, gpsDeviceId: true },
  });
  const vehicleOf = new Map(vehicles.map((v) => [v.gpsDeviceId, v.id]));

  const rows = positions
    .filter((p) => vehicleOf.has(p.device_id))
    .map((p) => ({
      vehicleId: vehicleOf.get(p.device_id),
      latitude: p.latitude,
      longitude: p.longitude,
      speedKmph: p.speed_kmph ?? null,
      heading: p.heading ?? null,
      source: providerKey,
      recordedAt: p.recorded_at ? new Date(p.recorded_at) : new Date(),
    }));
  if (!rows.length) return 0;
  await prisma.vehicleLocation.createMany({ data: rows });
  return rows.length;
}

module.exports = { syncAll };
