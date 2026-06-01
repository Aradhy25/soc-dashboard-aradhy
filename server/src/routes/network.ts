import type { FastifyInstance } from 'fastify';

import { prisma } from '../db/prisma.js';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

function toInt(value: unknown, fallback: number): number {
  const s = asString(value);
  const n = s ? Number(s) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}

export default async function networkRoutes(app: FastifyInstance) {
  app.get('/overview', async (req) => {
    const query = req.query as Record<string, unknown>;
    const hours = Math.min(168, Math.max(1, toInt(query.hours, 24)));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [suspiciousConnections, totalConnections, latestSamples, latestConnections] = await Promise.all([
      prisma.networkConnection.count({ where: { timestamp: { gte: since }, status: 'suspicious' } }),
      prisma.networkConnection.count({ where: { timestamp: { gte: since } } }),
      prisma.networkSample.findMany({
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: 'asc' },
        take: 500,
      }),
      prisma.networkConnection.findMany({
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      }),
    ]);

    const maxInbound = latestSamples.reduce((m, s) => Math.max(m, s.inbound), 0);
    const maxOutbound = latestSamples.reduce((m, s) => Math.max(m, s.outbound), 0);

    return {
      stats: {
        activeConnections: totalConnections,
        suspiciousActivity: suspiciousConnections,
        maxInbound,
        maxOutbound,
      },
      traffic: latestSamples.map((s) => ({
        time: s.timestamp.toISOString(),
        inbound: s.inbound,
        outbound: s.outbound,
      })),
      connections: latestConnections.map((c) => ({
        id: c.id,
        time: c.timestamp.toISOString(),
        src: c.srcIp,
        dst: c.dstIp,
        port: c.port,
        protocol: c.protocol,
        status: c.status,
      })),
    };
  });
}
