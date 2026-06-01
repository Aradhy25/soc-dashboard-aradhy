import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

const upsertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
  lastLogin: z.string().datetime().optional(),
  failedAttempts: z.number().int().min(0).optional(),
  devices: z.array(z.string().min(1)).optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
});

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const query = req.query as Record<string, unknown>;
    const q = asString(query.q)?.trim();

    const where: Prisma.ObservedUserWhereInput = {};
    if (q) {
      where.OR = [{ username: { contains: q } }, { email: { contains: q } }, { role: { contains: q } }];
    }

    const items = await prisma.observedUser.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return { items };
  });

  app.post('/', async (req, reply) => {
    const parsed = upsertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const created = await prisma.observedUser.create({
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
        role: parsed.data.role,
        lastLogin: parsed.data.lastLogin ? new Date(parsed.data.lastLogin) : undefined,
        failedAttempts: parsed.data.failedAttempts ?? 0,
        devices: parsed.data.devices ?? [],
        riskScore: parsed.data.riskScore ?? 0,
      },
    });

    app.io.emit('users:update', created);
    app.io.emit('soc:update', { kind: 'user', id: created.id });

    return reply.code(201).send(created);
  });
}
