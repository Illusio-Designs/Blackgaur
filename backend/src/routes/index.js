'use strict';

const express = require('express');
const authenticate = require('../middleware/authenticate');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const tripRoutes = require('./trip.routes');
const expenseRoutes = require('./expense.routes');
const invoiceRoutes = require('./invoice.routes');
const fastagRoutes = require('./fastag.routes');
const fuelCardRoutes = require('./fuel-card.routes');
const fuelTransactionRoutes = require('./fuel-transaction.routes');
const clientRoutes = require('./client.routes');
const vehicleRoutes = require('./vehicle.routes');
const driverRoutes = require('./driver.routes');
const paymentRoutes = require('./payment.routes');
const trackingRoutes = require('./tracking.routes');
const reportsRoutes = require('./reports.routes');
const auditRoutes = require('./audit.routes');
const brandingRoutes = require('./branding.routes');
const configRoutes = require('./config.routes');

/**
 * Mount all v1 routers (TMS Architecture §5, §6.3, §7.2).
 * Public auth routes are unauthenticated; everything else requires a JWT.
 * @param {import('express').Express} app
 */
function registerRoutes(app) {
  const v1 = express.Router();

  // Public.
  v1.use('/auth', authRoutes);
  v1.use('/', brandingRoutes.publicRouter); // GET /branding — public theming/content.

  // Protected — authenticate once, then per-route RBAC.
  v1.use(authenticate);
  v1.use('/settings', brandingRoutes.settingsRouter);
  v1.use('/settings', configRoutes);
  v1.use('/users', userRoutes);
  v1.use('/roles', roleRoutes);
  v1.use('/trips', tripRoutes);
  v1.use('/expenses', expenseRoutes);
  v1.use('/invoices', invoiceRoutes);
  v1.use('/fastag', fastagRoutes);
  v1.use('/fuel-cards', fuelCardRoutes);
  v1.use('/fuel-transactions', fuelTransactionRoutes);
  v1.use('/clients', clientRoutes);
  v1.use('/vehicles', vehicleRoutes);
  v1.use('/drivers', driverRoutes);
  v1.use('/payments', paymentRoutes);
  v1.use('/tracking', trackingRoutes);
  v1.use('/reports', reportsRoutes);
  v1.use('/audit-logs', auditRoutes);

  app.use('/v1', v1);
}

module.exports = { registerRoutes };
