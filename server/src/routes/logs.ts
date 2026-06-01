import type { FastifyInstance } from 'fastify';

import type { Prisma } from '@prisma/client';
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

export default async function logsRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const query = req.query as Record<string, unknown>;
    const severity = asString(query.severity);
    const q = asString(query.q)?.trim();

    const limit = Math.min(500, Math.max(1, toInt(query.limit, 200)));
    const offset = Math.max(0, toInt(query.offset, 0));

    const where: Prisma.LogWhereInput = {};

    if (severity && ['info', 'warning', 'error', 'critical'].includes(severity)) {
      where.severity = severity as 'info' | 'warning' | 'error' | 'critical';
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        { device: { name: { contains: q } } },
        { eventType: { contains: q } },
        { severity: { equals: q as any } },
        { message: { contains: q } },
        { sourceIp: { contains: q } },
        { destinationIp: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: { device: { select: { id: true, name: true } } },
      }),
      prisma.log.count({ where }),
    ]);

    return { items, total, limit, offset };
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const log = await prisma.log.findUnique({
      where: { id },
      include: { device: { select: { id: true, name: true, ip: true, os: true } } },
    });
    if (!log) return reply.code(404).send({ error: 'not_found' });

    return reply.send(log);
  });
}
