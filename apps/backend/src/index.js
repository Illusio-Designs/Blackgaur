require('dotenv').config({ path: ['.env.local', '.env', '../../.env'] });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/v1/health', (_req, res) => {
  res.json({
    service: 'backend',
    status: 'ok',
    uptime_s: Math.round(process.uptime()),
    ts: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    type: 'about:blank',
    title: 'Not Found',
    status: 404,
    code: 'NOT_FOUND',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    type: 'about:blank',
    title: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR',
  });
});

const port = Number(process.env.BACKEND_PORT) || 4000;
app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}/v1`);
});
