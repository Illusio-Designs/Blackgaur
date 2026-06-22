'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { registerRoutes } = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy so req.ip reflects the real client behind load balancers.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((s) => s.trim()) : false,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request id for tracing.
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
});

// Static serving of local-disk uploads (fallback storage).
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check.
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', service: 'blackgaur-api', version: '3.0.0', env: env.NODE_ENV, time: new Date().toISOString() },
  });
});

// General rate limiter on the API surface.
app.use('/v1', generalLimiter);

// Mount v1 routers.
registerRoutes(app);

// 404 + central error handler.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
