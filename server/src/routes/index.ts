import type { FastifyInstance } from 'fastify';

import alertsRoutes from './alerts.js';
import dashboardRoutes from './dashboard.js';
import devicesRoutes from './devices.js';
import incidentsRoutes from './incidents.js';
import ingestRoutes from './ingest.js';
import logsRoutes from './logs.js';
import networkRoutes from './network.js';
import reportsRoutes from './reports.js';
import threatsRoutes from './threats.js';
import usersRoutes from './users.js';

export async function apiRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));

  await app.register(devicesRoutes, { prefix: '/devices' });
  await app.register(ingestRoutes, { prefix: '/ingest' });

  await app.register(alertsRoutes, { prefix: '/alerts' });
  await app.register(logsRoutes, { prefix: '/logs' });
  await app.register(dashboardRoutes, { prefix: '/dashboard' });
  await app.register(networkRoutes, { prefix: '/network' });
  await app.register(reportsRoutes, { prefix: '/reports' });
  await app.register(threatsRoutes, { prefix: '/threats' });
  await app.register(incidentsRoutes, { prefix: '/incidents' });
  await app.register(usersRoutes, { prefix: '/users' });
}
