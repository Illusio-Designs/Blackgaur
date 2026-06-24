'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');

// Provider/device webhook payload. A GPS unit (or telematics platform) pushes a
// ping identified by the device id configured on the vehicle (Vehicle.gpsDeviceId).
const pingSchema = z.object({
  device_id: z.string().min(1).max(80),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  speed_kmph: z.coerce.number().min(0).max(200).optional(),
  heading: z.coerce.number().int().min(0).max(359).optional(),
  recorded_at: z.coerce.date().optional(),
  trip_id: z.coerce.number().int().positive().optional().nullable(),
  source: z.string().max(40).optional(),
});

/**
 * GET /tracking/live — latest known position for every vehicle that has a GPS
 * device and at least one ping. Used by the live tracking map.
 */
async function live(req, res) {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null, gpsDeviceId: { not: null } },
    select: {
      id: true,
      registrationNo: true,
      gpsDeviceId: true,
      driver: { select: { id: true, name: true } },
      locations: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
  });

  // Resolve the active (in-transit) trip per vehicle for route context.
  const vehicleIds = vehicles.map((v) => v.id);
  const trips = vehicleIds.length
    ? await prisma.trip.findMany({
        where: { vehicleId: { in: vehicleIds }, status: 'in_transit', deletedAt: null },
        select: { id: true, vehicleId: true, lrNumber: true, originCity: true, destinationCity: true },
      })
    : [];
  const tripOf = (vid) => trips.find((t) => t.vehicleId === vid) || null;

  const positions = vehicles
    .filter((v) => v.locations.length)
    .map((v) => {
      const loc = v.locations[0];
      const trip = tripOf(v.id);
      return {
        vehicle_id: v.id,
        registration_no: v.registrationNo,
        gps_device_id: v.gpsDeviceId,
        driver: v.driver ? { id: v.driver.id, name: v.driver.name } : null,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        speed_kmph: loc.speedKmph != null ? Number(loc.speedKmph) : null,
        heading: loc.heading,
        recorded_at: loc.recordedAt,
        trip: trip
          ? { id: trip.id, lr_number: trip.lrNumber, origin_city: trip.originCity, destination_city: trip.destinationCity }
          : null,
      };
    });

  return ok(res, positions);
}

/**
 * POST /tracking/ping — ingest a GPS position from a device/provider. Resolves
 * the vehicle by its configured gpsDeviceId and stores the location.
 */
async function ping(req, res) {
  const b = req.body;
  const vehicle = await prisma.vehicle.findFirst({
    where: { gpsDeviceId: b.device_id, deletedAt: null },
    select: { id: true },
  });
  if (!vehicle) throw AppError.notFound('No vehicle is registered to this GPS device');

  const loc = await prisma.vehicleLocation.create({
    data: {
      vehicleId: vehicle.id,
      tripId: b.trip_id || null,
      latitude: b.latitude,
      longitude: b.longitude,
      speedKmph: b.speed_kmph ?? null,
      heading: b.heading ?? null,
      source: b.source || 'device',
      recordedAt: b.recorded_at ? new Date(b.recorded_at) : new Date(),
    },
  });
  return ok(res, { id: loc.id.toString(), vehicle_id: vehicle.id }, { status: 201 });
}

module.exports = { schemas: { pingSchema }, live, ping };
