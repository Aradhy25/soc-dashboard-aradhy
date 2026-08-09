import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

const patchIncidentSchema = z.object({
  status: z.enum(['open', 'investigating', 'contained', 'resolved']).optional(),
  assignedTo: z.string().min(1).optional(),
});

const createIncidentSchema = z.object({
  title: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['open', 'investigating', 'contained', 'resolved']).optional(),
  assignedTo: z.string().min(1),
  rootCause: z.string().min(1),
  affectedSystems: z.array(z.string()).default([]),
});

export default async function incidentsRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const parsed = createIncidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const created = await prisma.incident.create({
      data: {
        title: parsed.data.title,
        severity: parsed.data.severity,
        status: parsed.data.status ?? 'open',
        assignedTo: parsed.data.assignedTo,
        createdAt: new Date(),
        rootCause: parsed.data.rootCause,
        affectedSystems: parsed.data.affectedSystems,
      },
    });

    app.io.emit('incidents:update', created);
    app.io.emit('soc:update', { kind: 'incident', id: created.id });

    return reply.code(201).send(created);
  });

  app.get('/', async (req) => {
    const query = req.query as Record<string, unknown>;
    const status = asString(query.status);
    const q = asString(query.q)?.trim();

    const where: Prisma.IncidentWhereInput = {};
    if (status && ['open', 'investigating', 'contained', 'resolved'].includes(status)) {
      where.status = status as any;
    }
    if (q) {
      where.OR = [{ title: { contains: q } }, { assignedTo: { contains: q } }, { rootCause: { contains: q } }];
    }

    const items = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return { items };
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return reply.code(404).send({ error: 'not_found' });
    return reply.send(incident);
  });

  app.patch('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const parsed = patchIncidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status: parsed.data.status,
        assignedTo: parsed.data.assignedTo,
      },
    });

    app.io.emit('incidents:update', updated);
    app.io.emit('soc:update', { kind: 'incident', id: updated.id });

    return reply.send(updated);
  });
}
