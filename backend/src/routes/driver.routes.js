'use strict';

const express = require('express');
const prisma = require('../lib/prisma');
const { ok } = require('../lib/response');
const hasPermission = require('../middleware/hasPermission');
const wrap = require('../lib/asyncHandler');

const router = express.Router();

/**
 * GET /drivers — active users with the `driver` role.
 * Used to populate driver dropdowns in trip / LR creation. Drivers are Users
 * (Trip.driverId → User via the TripDriver relation), so there is no separate
 * Driver model; we filter users by role name.
 */
router.get(
  '/',
  hasPermission('trips', 'read'),
  wrap(async (req, res) => {
    const drivers = await prisma.user.findMany({
      where: { deletedAt: null, isActive: true, role: { name: 'driver' } },
      select: { id: true, name: true, mobile: true },
      orderBy: { name: 'asc' },
    });
    return ok(res, drivers);
  }),
);

module.exports = router;
