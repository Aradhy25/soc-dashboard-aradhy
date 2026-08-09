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

const alertActionSchema = z.object({
  action: z.enum(['block-ip', 'isolate-host', 'kill-process', 'escalate']),
  assignedTo: z.string().min(1).optional(),
});

type DeviceProcess = {
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'suspicious' | 'killed';
};

function asProcesses(value: Prisma.JsonValue | null | undefined): DeviceProcess[] {
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

  app.post('/:id/actions', async (req, reply) => {
    const id = (req.params as { id?: string }).id;
    if (!id) return reply.code(400).send({ error: 'missing_id' });

    const parsed = alertActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: { device: true },
    });
    if (!alert) return reply.code(404).send({ error: 'not_found' });

    const action = parsed.data.action;
    let message = '';
    let result: Record<string, unknown> = { action };

    if (action === 'block-ip') {
      if (!alert.sourceIp) {
        return reply.code(400).send({ error: 'missing_source_ip', message: 'Alert has no source IP to block' });
      }

      const existing = await prisma.threatItem.findFirst({
        where: { type: 'ip', value: alert.sourceIp },
      });

      const threat = existing
        ? await prisma.threatItem.update({
            where: { id: existing.id },
            data: {
              lastSeen: new Date(),
              severity: alert.severity,
              description: `Blocked IP from alert ${alert.id}: ${alert.title}`,
              reputation: Math.min(10, existing.reputation + 2),
            },
          })
        : await prisma.threatItem.create({
            data: {
              type: 'ip',
              value: alert.sourceIp,
              severity: alert.severity,
              description: `Blocked IP from alert ${alert.id}: ${alert.title}`,
              firstSeen: new Date(),
              lastSeen: new Date(),
              reputation: 9,
            },
          });

      const updatedAlert = await prisma.alert.update({
        where: { id },
        data: { status: alert.status === 'resolved' ? 'resolved' : 'investigating' },
      });

      message = `Blocked source IP ${alert.sourceIp}`;
      result = { action, threat, alert: updatedAlert, message };
      app.io.emit('threats:new', threat);
      app.io.emit('alerts:update', updatedAlert);
    } else if (action === 'isolate-host') {
      if (!alert.deviceId || !alert.device) {
        return reply.code(400).send({ error: 'missing_device', message: 'Alert is not linked to a device' });
      }

      const device = await prisma.device.update({
        where: { id: alert.deviceId },
        data: { status: 'isolated' },
      });

      await prisma.log.create({
        data: {
          deviceId: alert.deviceId,
          timestamp: new Date(),
          eventType: 'response_action',
          severity: 'warning',
          message: `Host ${device.name} isolated in response to alert ${alert.id}`,
          sourceIp: alert.sourceIp,
          destinationIp: device.ip,
          rawData: { action, alertId: alert.id },
        },
      });

      const updatedAlert = await prisma.alert.update({
        where: { id },
        data: { status: 'investigating' },
      });

      message = `Isolated host ${device.name}`;
      result = { action, device, alert: updatedAlert, message };
      app.io.emit('devices:update', device);
      app.io.emit('alerts:update', updatedAlert);
    } else if (action === 'kill-process') {
      if (!alert.deviceId || !alert.device) {
        return reply.code(400).send({ error: 'missing_device', message: 'Alert is not linked to a device' });
      }

      const processes = asProcesses(alert.device.processes);
      const target = processes.find((p) => p.status === 'suspicious') ?? processes[0];
      if (!target) {
        return reply.code(400).send({ error: 'no_process', message: 'No running process found on device' });
      }

      const nextProcesses = processes.map((p) =>
        p.pid === target.pid ? { ...p, status: 'killed' as const, cpu: 0 } : p
      );

      const device = await prisma.device.update({
        where: { id: alert.deviceId },
        data: { processes: nextProcesses },
      });

      await prisma.log.create({
        data: {
          deviceId: alert.deviceId,
          timestamp: new Date(),
          eventType: 'response_action',
          severity: 'warning',
          message: `Killed process ${target.name} (PID ${target.pid}) for alert ${alert.id}`,
          sourceIp: alert.sourceIp,
          destinationIp: device.ip,
          rawData: { action, alertId: alert.id, process: target },
        },
      });

      const updatedAlert = await prisma.alert.update({
        where: { id },
        data: { status: 'investigating' },
      });

      message = `Killed process ${target.name} (PID ${target.pid})`;
      result = { action, device, process: target, alert: updatedAlert, message };
      app.io.emit('devices:update', device);
      app.io.emit('alerts:update', updatedAlert);
    } else if (action === 'escalate') {
      const assignedTo = parsed.data.assignedTo ?? 'SOC Analyst';
      const systems = [alert.affectedSystem, alert.device?.name].filter(
        (x): x is string => typeof x === 'string' && x.length > 0
      );

      const incident = await prisma.incident.create({
        data: {
          title: `Escalated: ${alert.title}`,
          severity: alert.severity,
          status: 'investigating',
          assignedTo,
          createdAt: new Date(),
          rootCause: `${alert.attackType} — ${alert.description}`,
          affectedSystems: systems.length > 0 ? systems : ['unknown'],
        },
      });

      const updatedAlert = await prisma.alert.update({
        where: { id },
        data: { status: 'investigating' },
      });

      message = `Escalated alert to incident ${incident.id}`;
      result = { action, incident, alert: updatedAlert, message };
      app.io.emit('incidents:update', incident);
      app.io.emit('alerts:update', updatedAlert);
    }

    app.io.emit('soc:update', { kind: 'alert-action', id, action });
    return reply.send(result);
  });
}
