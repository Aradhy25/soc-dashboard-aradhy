import cors from '@fastify/cors';
import Fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config.js';
import { prisma } from './db/prisma.js';
import { apiRoutes } from './routes/index.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
    disableRequestLogging: true,
  });

  app.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  const io = new SocketIOServer(app.server, {
    cors: {
      origin: config.wsOrigins,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    },
  });

  app.decorate('io', io);

  io.on('connection', (socket) => {
    app.log.info({ socketId: socket.id }, 'socket connected');
    socket.on('disconnect', (reason) => {
      app.log.info({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  app.get('/health', async () => ({ ok: true }));

  app.register(apiRoutes, { prefix: '/api/v1' });

  app.addHook('onClose', async () => {
    io.close();
    await prisma.$disconnect();
  });

  return app;
}
