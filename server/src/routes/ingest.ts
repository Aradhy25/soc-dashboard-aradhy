import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db/prisma.js';
import { hashApiKey } from '../lib/api-key.js';

function getHeader(req: FastifyRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

async function requireDevice(req: FastifyRequest, reply: FastifyReply) {
  const rawKey = getHeader(req, 'x-device-key');
  if (!rawKey) {
    return reply.code(401).send({ error: 'missing_device_key' });
  }

  const device = await prisma.device.findUnique({
    where: { apiKeyHash: hashApiKey(rawKey) },
  });

  if (!device) {
    return reply.code(401).send({ error: 'invalid_device_key' });
  }

  req.device = device;
  return;
}

const logBodySchema = z.object({
  timestamp: z.string().datetime().optional(),
  eventType: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  message: z.string().min(1),
  sourceIp: z.string().min(1).optional(),
  destinationIp: z.string().min(1).optional(),
  rawData: z.unknown().optional(),
});

const alertBodySchema = z.object({
  timestamp: z.string().datetime().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['open', 'investigating', 'resolved']).optional(),
  sourceIp: z.string().min(1).optional(),
  affectedSystem: z.string().min(1).optional(),
  attackType: z.string().min(1),
  mitreId: z.string().min(1).optional(),
  rawLogs: z.string().min(1),
  country: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const networkSampleBodySchema = z.object({
  timestamp: z.string().datetime().optional(),
  inbound: z.number().int().nonnegative(),
  outbound: z.number().int().nonnegative(),
});

const connectionBodySchema = z.object({
  timestamp: z.string().datetime().optional(),
  srcIp: z.string().min(1),
  dstIp: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.string().min(1),
  status: z.enum(['normal', 'suspicious']).optional(),
});

const processSchema = z.object({
  name: z.string().min(1),
  pid: z.number().int().nonnegative(),
  cpu: z.number().nonnegative(),
  memory: z.number().nonnegative(),
  status: z.enum(['running', 'suspicious']),
});

const processesBodySchema = z.object({
  timestamp: z.string().datetime().optional(),
  processes: z.array(processSchema).max(500),
});

export default async function ingestRoutes(app: FastifyInstance) {
  app.post('/logs', { preHandler: requireDevice }, async (req, reply) => {
    const parsed = logBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const device = req.device!;
    const timestamp = parsed.data.timestamp ? new Date(parsed.data.timestamp) : new Date();

    const log = await prisma.log.create({
      data: {
        deviceId: device.id,
        timestamp,
        eventType: parsed.data.eventType,
        severity: parsed.data.severity,
        message: parsed.data.message,
        sourceIp: parsed.data.sourceIp,
        destinationIp: parsed.data.destinationIp,
        rawData: (parsed.data.rawData ?? {}) as object,
      },
    });

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: 'online' },
    });

    app.io.emit('logs:new', log);
    app.io.emit('soc:update', { kind: 'log', id: log.id });

    return reply.code(201).send({ id: log.id });
  });

  app.post('/alerts', { preHandler: requireDevice }, async (req, reply) => {
    const parsed = alertBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const device = req.device!;
    const timestamp = parsed.data.timestamp ? new Date(parsed.data.timestamp) : new Date();

    const alert = await prisma.alert.create({
      data: {
        deviceId: device.id,
        timestamp,
        severity: parsed.data.severity,
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status ?? 'open',
        sourceIp: parsed.data.sourceIp,
        affectedSystem: parsed.data.affectedSystem,
        attackType: parsed.data.attackType,
        mitreId: parsed.data.mitreId,
        rawLogs: parsed.data.rawLogs,
        country: parsed.data.country,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
      },
    });

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: 'online' },
    });

    app.io.emit('alerts:new', alert);
    app.io.emit('soc:update', { kind: 'alert', id: alert.id });

    return reply.code(201).send({ id: alert.id });
  });

  app.post('/network/samples', { preHandler: requireDevice }, async (req, reply) => {
    const parsed = networkSampleBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const device = req.device!;
    const timestamp = parsed.data.timestamp ? new Date(parsed.data.timestamp) : new Date();

    const sample = await prisma.networkSample.create({
      data: {
        deviceId: device.id,
        timestamp,
        inbound: parsed.data.inbound,
        outbound: parsed.data.outbound,
      },
    });

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: 'online' },
    });

    app.io.emit('network:sample', sample);
    app.io.emit('soc:update', { kind: 'networkSample', id: sample.id });

    return reply.code(201).send({ id: sample.id });
  });

  app.post('/network/connections', { preHandler: requireDevice }, async (req, reply) => {
    const parsed = connectionBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const device = req.device!;
    const timestamp = parsed.data.timestamp ? new Date(parsed.data.timestamp) : new Date();

    const conn = await prisma.networkConnection.create({
      data: {
        deviceId: device.id,
        timestamp,
        srcIp: parsed.data.srcIp,
        dstIp: parsed.data.dstIp,
        port: parsed.data.port,
        protocol: parsed.data.protocol,
        status: parsed.data.status ?? 'normal',
      },
    });

    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: 'online' },
    });

    app.io.emit('network:connection', conn);
    app.io.emit('soc:update', { kind: 'networkConnection', id: conn.id });

    return reply.code(201).send({ id: conn.id });
  });

  app.post('/processes', { preHandler: requireDevice }, async (req, reply) => {
    const parsed = processesBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const device = req.device!;
    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        status: 'online',
        processes: parsed.data.processes,
      },
    });

    app.io.emit('devices:update', { id: device.id });
    app.io.emit('soc:update', { kind: 'processes', id: device.id });

    return reply.code(202).send({ ok: true });
  });
}
