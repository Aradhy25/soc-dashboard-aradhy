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

function mapDevice(d: {
  id: string;
  name: string;
  ip: string | null;
  os: string | null;
  status: 'online' | 'offline' | 'isolated';
  lastSeenAt: Date | null;
  processes: Prisma.JsonValue | null;
  apiKeyPrefix: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { alerts: number; logs: number };
}) {
  return {
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
  };
}

const createDeviceBodySchema = z.object({
  name: z.string().min(1),
  ip: z.string().min(1).optional(),
  os: z.string().min(1).optional(),
});

const patchDeviceBodySchema = z.object({
  status: z.enum(['online', 'offline', 'isolated']).optional(),
  action: z.enum(['isolate', 'restore', 'shutdown', 'scan', 'kill-process']).optional(),
  processPid: z.number().int().positive().optional(),
});

type DeviceProcess = {
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'suspicious' | 'killed';
};

function asProcesses(value: Prisma.JsonValue | null): DeviceProcess[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const p = item as Record<string, unknown>;
      if (typeof p.name !== 'string' || typeof p.pid !== 'number') return null;
      return {
        name: p.name,
        pid: p.pid,
        cpu: typeof p.cpu === 'number' ? p.cpu : 0,
        memory: typeof p.memory === 'number' ? p.memory : 0,
        status: p.status === 'suspicious' || p.status === 'killed' ? p.status : 'running',
      } satisfies DeviceProcess;
    })
    .filter((x): x is DeviceProcess => x !== null);
}

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

    app.io.emit('devices:update', mapDevice(device));
    app.io.emit('soc:update', { kind: 'device', id: device.id });

    // API key is returned once at creation time only.
    return reply.code(201).send({
      device: mapDevice(device),
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
      items: devices.map(mapDevice),
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

    return reply.send(mapDevice(device));
  });

  app.patch('/:id', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const parsed = patchDeviceBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });

    const data: Prisma.DeviceUpdateInput = {};
    let actionMessage: string | null = null;
    let processes = asProcesses(existing.processes);

    if (parsed.data.action === 'isolate' || parsed.data.status === 'isolated') {
      data.status = 'isolated';
      actionMessage = `Host ${existing.name} isolated by analyst`;
    } else if (parsed.data.action === 'restore' || parsed.data.status === 'online') {
      data.status = 'online';
      actionMessage = `Host ${existing.name} restored to online`;
    } else if (parsed.data.action === 'shutdown' || parsed.data.status === 'offline') {
      data.status = 'offline';
      actionMessage = `Host ${existing.name} shut down by analyst`;
    } else if (parsed.data.action === 'scan') {
      actionMessage = `Endpoint scan initiated on ${existing.name}`;
      data.lastSeenAt = new Date();
    } else if (parsed.data.action === 'kill-process') {
      const pid = parsed.data.processPid;
      if (!pid) {
        const suspicious = processes.find((p) => p.status === 'suspicious');
        if (!suspicious) {
          return reply.code(400).send({ error: 'no_process', message: 'No suspicious process to kill' });
        }
        processes = processes.map((p) =>
          p.pid === suspicious.pid ? { ...p, status: 'killed' as const, cpu: 0 } : p
        );
        actionMessage = `Killed suspicious process ${suspicious.name} (PID ${suspicious.pid}) on ${existing.name}`;
      } else {
        const target = processes.find((p) => p.pid === pid);
        if (!target) return reply.code(404).send({ error: 'process_not_found' });
        processes = processes.map((p) => (p.pid === pid ? { ...p, status: 'killed' as const, cpu: 0 } : p));
        actionMessage = `Killed process ${target.name} (PID ${pid}) on ${existing.name}`;
      }
      data.processes = processes;
    }

    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'no_changes' });
    }

    const updated = await prisma.device.update({
      where: { id },
      data,
      include: { _count: { select: { alerts: true, logs: true } } },
    });

    if (actionMessage) {
      await prisma.log.create({
        data: {
          deviceId: id,
          timestamp: new Date(),
          eventType: 'response_action',
          severity: parsed.data.action === 'scan' ? 'info' : 'warning',
          message: actionMessage,
          sourceIp: existing.ip,
          destinationIp: null,
          rawData: {
            action: parsed.data.action ?? parsed.data.status,
            processPid: parsed.data.processPid ?? null,
            analyst: 'SOC Analyst',
          },
        },
      });
    }

    const mapped = mapDevice(updated);
    app.io.emit('devices:update', mapped);
    app.io.emit('soc:update', { kind: 'device', id: updated.id, action: parsed.data.action ?? parsed.data.status });

    return reply.send({
      device: mapped,
      message: actionMessage,
    });
  });
}
