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
      select: { timestamp: true, status: true },
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

    return { data: Array.from(buckets.values()) };
  });
}
