import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { apiKeyPrefix, generateApiKey, hashApiKey } from '../lib/api-key.js';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

function toLimit(value: unknown, fallback: number): number {
  const s = asString(value);
  const n = s ? Number(s) : NaN;
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(500, Math.floor(n));
}

const createDeviceBodySchema = z.object({
  name: z.string().min(1),
  ip: z.string().min(1).optional(),
  os: z.string().min(1).optional(),
});

export default async function devicesRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const parsed = createDeviceBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const rawKey = generateApiKey();
    const device = await prisma.device.create({
      data: {
        name: parsed.data.name,
        ip: parsed.data.ip,
        os: parsed.data.os,
        status: 'online',
        lastSeenAt: new Date(),
        apiKeyHash: hashApiKey(rawKey),
        apiKeyPrefix: apiKeyPrefix(rawKey),
      },
      include: {
        _count: { select: { alerts: true, logs: true } },
      },
    });

    // API key is returned once at creation time only.
    return reply.code(201).send({
      device: {
        id: device.id,
        name: device.name,
        ip: device.ip,
        os: device.os,
        status: device.status,
        lastSeenAt: device.lastSeenAt,
        processes: device.processes ?? [],
        apiKeyPrefix: device.apiKeyPrefix,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
        alerts: device._count.alerts,
        logs: device._count.logs,
      },
      apiKey: rawKey,
    });
  });

  app.get('/', async (req, reply) => {
    const status = asString((req.query as Record<string, unknown>)?.status);
    const q = asString((req.query as Record<string, unknown>)?.q)?.trim();
    const limit = toLimit((req.query as Record<string, unknown>)?.limit, 200);

    const where: Prisma.DeviceWhereInput = {};

    if (status && ['online', 'offline', 'isolated'].includes(status)) {
      where.status = status as 'online' | 'offline' | 'isolated';
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        { name: { contains: q } },
        { ip: { contains: q } },
        { os: { contains: q } },
      ];
    }

    const devices = await prisma.device.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { alerts: true, logs: true } },
      },
    });

    return reply.send({
      items: devices.map((d) => ({
        id: d.id,
        name: d.name,
        ip: d.ip,
        os: d.os,
        status: d.status,
        lastSeenAt: d.lastSeenAt,
        processes: d.processes ?? [],
        apiKeyPrefix: d.apiKeyPrefix,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        alerts: d._count.alerts,
        logs: d._count.logs,
      })),
    });
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        _count: { select: { alerts: true, logs: true } },
      },
    });
    if (!device) return reply.code(404).send({ error: 'not_found' });

    return reply.send({
      id: device.id,
      name: device.name,
      ip: device.ip,
      os: device.os,
      status: device.status,
      lastSeenAt: device.lastSeenAt,
      processes: device.processes ?? [],
      apiKeyPrefix: device.apiKeyPrefix,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      alerts: device._count.alerts,
      logs: device._count.logs,
    });
  });
}
