'use strict';

// ─────────────────────────────────────────────────────────────
// GPS provider adapter registry (universal telematics layer).
//
// The rest of the app only ever deals with a NORMALISED position:
//   { device_id, latitude, longitude, speed_kmph?, heading?, recorded_at? }
//
// Each truck stores which provider it reports to (Vehicle.gpsProvider) and its
// id on that provider (Vehicle.gpsDeviceId). Providers are of two kinds:
//   - push : the device/provider POSTs to /tracking/ping (no polling needed)
//   - pull : we call the provider's API on a schedule and normalise the result
//
// Non-secret per-provider config (base URL, enabled) lives in
// AppConfig.integrations.gpsProviders[<key>]; secret tokens live in .env as
// TRACKING_<KEY>_TOKEN (never stored in the DB — §13).
//
// To support a new provider you ONLY add an adapter here; nothing else changes.
// ─────────────────────────────────────────────────────────────

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Provider responded ${res.status}`);
  return res.json();
}

// Traccar (self-hosted / open-source). Uses a Bearer API token.
// Maps each position's device to its uniqueId (the id you set on the truck).
async function traccarFetch(cfg) {
  const base = cfg.baseUrl.replace(/\/$/, '');
  const headers = { Authorization: `Bearer ${cfg.token}`, Accept: 'application/json' };
  const [devices, positions] = await Promise.all([
    getJson(`${base}/api/devices`, headers),
    getJson(`${base}/api/positions`, headers),
  ]);
  const uniqueOf = new Map(devices.map((d) => [d.id, d.uniqueId]));
  return positions.map((p) => ({
    device_id: uniqueOf.get(p.deviceId) || String(p.deviceId),
    latitude: p.latitude,
    longitude: p.longitude,
    speed_kmph: p.speed != null ? Math.round(p.speed * 1.852) : null, // knots → km/h
    heading: p.course != null ? Math.round(p.course) : null,
    recorded_at: p.fixTime || p.deviceTime,
  }));
}

// Generic REST: for aggregators (Loconav/Fleetx/Intangles/Mappls/etc.) or any
// endpoint that returns an array of positions. Field names are configurable so
// most providers work without new code — set them in the provider config.
async function genericFetch(cfg) {
  const map = cfg.fieldMap || {};
  const idKey = map.deviceId || 'device_id';
  const latKey = map.lat || 'latitude';
  const lngKey = map.lng || 'longitude';
  const speedKey = map.speed || 'speed';
  const headingKey = map.heading || 'heading';
  const tsKey = map.timestamp || 'timestamp';
  const headers = cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {};
  const raw = await getJson(cfg.baseUrl, headers);
  const rows = Array.isArray(raw) ? raw : (raw.data ?? raw.positions ?? []);
  return rows
    .map((r) => ({
      device_id: r[idKey],
      latitude: Number(r[latKey]),
      longitude: Number(r[lngKey]),
      speed_kmph: r[speedKey] != null ? Number(r[speedKey]) : null,
      heading: r[headingKey] != null ? Number(r[headingKey]) : null,
      recorded_at: r[tsKey],
    }))
    .filter((r) => r.device_id && Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
}

const ADAPTERS = {
  manual: { key: 'manual', label: 'Webhook / Manual push', mode: 'push' },
  traccar: { key: 'traccar', label: 'Traccar (self-hosted)', mode: 'pull', fetchPositions: traccarFetch },
  loconav: { key: 'loconav', label: 'Loconav', mode: 'pull', fetchPositions: genericFetch },
  fleetx: { key: 'fleetx', label: 'Fleetx', mode: 'pull', fetchPositions: genericFetch },
  wialon: { key: 'wialon', label: 'Wialon', mode: 'pull', fetchPositions: genericFetch },
  mappls: { key: 'mappls', label: 'Mappls (MapmyIndia)', mode: 'pull', fetchPositions: genericFetch },
  generic: { key: 'generic', label: 'Generic REST', mode: 'pull', fetchPositions: genericFetch },
};

/** Provider metadata for the fleet dropdown + settings UI (no secrets). */
function listProviders() {
  return Object.values(ADAPTERS).map(({ key, label, mode }) => ({ key, label, mode }));
}

/**
 * Merge non-secret settings (AppConfig.integrations.gpsProviders[key]) with the
 * secret token from env into a config object the adapter can use.
 */
function resolveConfig(key, appConfig) {
  const settings = appConfig?.integrations?.gpsProviders?.[key] || {};
  const token = process.env[`TRACKING_${key.toUpperCase()}_TOKEN`] || settings.token || '';
  return { ...settings, token };
}

module.exports = { ADAPTERS, listProviders, resolveConfig };
