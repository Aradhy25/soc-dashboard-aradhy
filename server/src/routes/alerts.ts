import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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

const patchAlertBodySchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved']),
});

export default async function alertsRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const query = req.query as Record<string, unknown>;
    const severity = asString(query.severity);
    const status = asString(query.status);
    const attackType = asString(query.attackType);
    const q = asString(query.q)?.trim();

    const limit = Math.min(500, Math.max(1, toInt(query.limit, 200)));
    const offset = Math.max(0, toInt(query.offset, 0));

    const where: Prisma.AlertWhereInput = {};

    if (severity && ['critical', 'high', 'medium', 'low'].includes(severity)) {
      where.severity = severity as 'critical' | 'high' | 'medium' | 'low';
    }

    if (status && ['open', 'investigating', 'resolved'].includes(status)) {
      where.status = status as 'open' | 'investigating' | 'resolved';
    }

    if (attackType && attackType !== 'all') {
      where.attackType = attackType;
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
        { sourceIp: { contains: q } },
        { affectedSystem: { contains: q } },
        { attackType: { contains: q } },
        { mitreId: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: { device: { select: { id: true, name: true } } },
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: { device: { select: { id: true, name: true, ip: true, os: true } } },
    });
    if (!alert) return reply.code(404).send({ error: 'not_found' });

    return reply.send(alert);
  });

  app.patch('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const parsed = patchAlertBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    app.io.emit('alerts:update', updated);
    app.io.emit('soc:update', { kind: 'alert', id: updated.id });

    return reply.send(updated);
  });
}
