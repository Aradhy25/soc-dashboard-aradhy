import type { FastifyInstance } from 'fastify';

import { prisma } from '../db/prisma.js';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export default async function reportsRoutes(app: FastifyInstance) {
  app.get('/weekly', async () => {
    const now = new Date();
    const start = startOfDay(addDays(now, -6));
    const end = addDays(startOfDay(now), 1);

    const alerts = await prisma.alert.findMany({
      where: { timestamp: { gte: start, lt: end } },
      select: { timestamp: true, status: true, severity: true, title: true, attackType: true },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, { day: string; alerts: number; resolved: number }>();
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const name = dayNames[d.getDay()];
      buckets.set(name, { day: name, alerts: 0, resolved: 0 });
    }

    for (const a of alerts) {
      const name = dayNames[a.timestamp.getDay()];
      const bucket = buckets.get(name);
      if (!bucket) continue;
      bucket.alerts += 1;
      if (a.status === 'resolved') bucket.resolved += 1;
    }

    const data = Array.from(buckets.values());
    const summary = {
      period: 'weekly',
      start: start.toISOString(),
      end: end.toISOString(),
      totalAlerts: alerts.length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
    };

    return { data, summary, alerts };
  });

  app.get('/daily', async () => {
    const now = new Date();
    const start = startOfDay(now);
    const end = addDays(start, 1);

    const [alerts, logs, devices] = await Promise.all([
      prisma.alert.findMany({
        where: { timestamp: { gte: start, lt: end } },
        orderBy: { timestamp: 'desc' },
        take: 500,
      }),
      prisma.log.findMany({
        where: { timestamp: { gte: start, lt: end } },
        orderBy: { timestamp: 'desc' },
        take: 500,
        include: { device: { select: { name: true } } },
      }),
      prisma.device.findMany({ take: 200 }),
    ]);

    return {
      period: 'daily',
      start: start.toISOString(),
      end: end.toISOString(),
      summary: {
        alerts: alerts.length,
        resolved: alerts.filter((a) => a.status === 'resolved').length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        logs: logs.length,
        onlineDevices: devices.filter((d) => d.status === 'online').length,
        isolatedDevices: devices.filter((d) => d.status === 'isolated').length,
      },
      alerts,
      logs,
    };
  });

  app.get('/monthly', async () => {
    const now = new Date();
    const start = startOfDay(addDays(now, -29));
    const end = addDays(startOfDay(now), 1);

    const alerts = await prisma.alert.findMany({
      where: { timestamp: { gte: start, lt: end } },
      select: { timestamp: true, status: true, severity: true, attackType: true },
      orderBy: { timestamp: 'asc' },
    });

    const weeks: Array<{ week: string; alerts: number; resolved: number }> = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = addDays(start, i * 7);
      const weekEnd = addDays(weekStart, 7);
      const inWeek = alerts.filter((a) => a.timestamp >= weekStart && a.timestamp < weekEnd);
      weeks.push({
        week: `W${i + 1}`,
        alerts: inWeek.length,
        resolved: inWeek.filter((a) => a.status === 'resolved').length,
      });
    }

    return {
      period: 'monthly',
      start: start.toISOString(),
      end: end.toISOString(),
      summary: {
        totalAlerts: alerts.length,
        resolved: alerts.filter((a) => a.status === 'resolved').length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
      },
      data: weeks,
      alerts,
    };
  });
}
