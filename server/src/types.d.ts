import type { Server as SocketIOServer } from 'socket.io';
import type { Device } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer;
  }

  interface FastifyRequest {
    device?: Device;
  }
}

