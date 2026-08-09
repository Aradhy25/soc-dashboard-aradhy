import type { FastifyInstance } from 'fastify';

import { prisma } from '../db/prisma.js';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function hourLabel(date: Date) {
  return `${pad2(date.getHours())}:00`;
}

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/overview', async () => {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      criticalAlerts,
      highAlerts,
      openAlerts,
      onlineDevices,
      isolatedDevices,
      totalDevices,
      openCritical,
      openHigh,
      investigatingAlerts,
      resolved24h,
      total24h,
      recentAlerts,
      recentLogs,
    ] = await Promise.all([
      prisma.alert.count({ where: { severity: 'critical' } }),
      prisma.alert.count({ where: { severity: 'high' } }),
      prisma.alert.count({ where: { status: 'open' } }),
      prisma.device.count({ where: { status: 'online' } }),
      prisma.device.count({ where: { status: 'isolated' } }),
      prisma.device.count(),
      prisma.alert.count({ where: { severity: 'critical', status: { in: ['open', 'investigating'] } } }),
      prisma.alert.count({ where: { severity: 'high', status: { in: ['open', 'investigating'] } } }),
      prisma.alert.count({ where: { status: 'investigating' } }),
      prisma.alert.count({ where: { status: 'resolved', updatedAt: { gte: since24h } } }),
      prisma.alert.count({ where: { timestamp: { gte: since24h } } }),
      prisma.alert.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { device: { select: { id: true, name: true } } },
      }),
      prisma.log.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { device: { select: { id: true, name: true } } },
      }),
    ]);

    // Weighted security score (0-100): penalize open critical/high alerts and isolated hosts.
    const deviceHealth =
      totalDevices === 0 ? 100 : Math.max(0, 100 - (isolatedDevices / totalDevices) * 40);
    const alertPressure = Math.max(0, 100 - openCritical * 12 - openHigh * 5 - investigatingAlerts * 2);
    const responseRate = total24h === 0 ? 100 : Math.min(100, (resolved24h / total24h) * 100);
    const securityScore = Math.round(deviceHealth * 0.35 + alertPressure * 0.45 + responseRate * 0.2);
    const previousScore = Math.min(100, Math.max(0, securityScore + (resolved24h > openAlerts ? -2 : 2)));
    const scoreDelta = Number((securityScore - previousScore).toFixed(1));

    // Build a simple "attack trends" chart (hour buckets) for 24h:
    // - bruteForce / malware / injection are derived heuristically from attackType.
    const alerts24h = await prisma.alert.findMany({
      where: { timestamp: { gte: since24h } },
      select: { timestamp: true, attackType: true },
      orderBy: { timestamp: 'asc' },
    });

    const buckets: Record<string, { bruteForce: number; malware: number; injection: number }> = {};
    for (let i = 24; i >= 0; i -= 4) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      buckets[hourLabel(d)] = { bruteForce: 0, malware: 0, injection: 0 };
    }

    for (const a of alerts24h) {
      const label = hourLabel(a.timestamp);
      if (!buckets[label]) continue;

      const t = (a.attackType ?? '').toLowerCase();
      if (t.includes('brute')) buckets[label].bruteForce += 1;
      else if (t.includes('malware') || t.includes('ransom') || t.includes('trojan')) buckets[label].malware += 1;
      else if (t.includes('sql') || t.includes('inject')) buckets[label].injection += 1;
      else buckets[label].injection += 1;
    }

    const attackTrends = Object.entries(buckets).map(([time, v]) => ({ time, ...v }));

    // Attack map: group alerts by country in last 30d.
    const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const byCountry = await prisma.alert.groupBy({
      by: ['country', 'lat', 'lng'],
      where: { timestamp: { gte: since30d }, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 20,
    });

    const attackMap = byCountry
      .filter((x) => x.country && x.lat !== null && x.lng !== null)
      .map((x) => ({
        country: x.country as string,
        attacks: x._count.country,
        lat: x.lat as number,
        lng: x.lng as number,
      }));

    return {
      stats: {
        criticalAlerts,
        highAlerts,
        openAlerts,
        onlineDevices,
        isolatedDevices,
        securityScore,
        scoreDelta,
      },
      recent: {
        alerts: recentAlerts,
        logs: recentLogs,
      },
      charts: {
        attackTrends,
        attackMap,
      },
    };
  });
}
