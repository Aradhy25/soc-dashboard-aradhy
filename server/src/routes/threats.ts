import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

const createThreatSchema = z.object({
  type: z.enum(['ip', 'hash', 'domain']),
  value: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string().min(1),
  firstSeen: z.string().datetime().optional(),
  lastSeen: z.string().datetime().optional(),
  reputation: z.number().int().min(0).max(10),
});

export default async function threatsRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const query = req.query as Record<string, unknown>;
    const type = asString(query.type);
    const q = asString(query.q)?.trim();

    const where: Prisma.ThreatItemWhereInput = {};
    if (type && ['ip', 'hash', 'domain'].includes(type)) where.type = type as any;
    if (q) {
      where.OR = [{ value: { contains: q } }, { description: { contains: q } }];
    }

    const items = await prisma.threatItem.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
      take: 500,
    });

    return { items };
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const item = await prisma.threatItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'not_found' });
    return reply.send(item);
  });

  app.post('/', async (req, reply) => {
    const parsed = createThreatSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const created = await prisma.threatItem.create({
      data: {
        type: parsed.data.type,
        value: parsed.data.value,
        severity: parsed.data.severity,
        description: parsed.data.description,
        firstSeen: parsed.data.firstSeen ? new Date(parsed.data.firstSeen) : new Date(),
        lastSeen: parsed.data.lastSeen ? new Date(parsed.data.lastSeen) : new Date(),
        reputation: parsed.data.reputation,
      },
    });

    app.io.emit('threats:new', created);
    app.io.emit('soc:update', { kind: 'threat', id: created.id });

    return reply.code(201).send(created);
  });
}
