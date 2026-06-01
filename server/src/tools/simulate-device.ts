import { setTimeout as sleep } from 'node:timers/promises';

const API_BASE = process.env.API_BASE ?? 'http://localhost:3001/api/v1';

async function http(method: string, path: string, body?: unknown, headers?: Record<string, string>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return json;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const deviceName = process.env.DEVICE_NAME ?? `demo-endpoint-${Math.floor(Math.random() * 1000)}`;
  const os = process.env.DEVICE_OS ?? pick(['Windows 11', 'Ubuntu 22.04', 'macOS 15']);
  const ip = process.env.DEVICE_IP ?? `192.168.1.${Math.floor(Math.random() * 200 + 20)}`;

  const created = await http('POST', '/devices', { name: deviceName, os, ip });
  const apiKey = created.apiKey as string;
  const deviceId = created.device.id as string;

  console.log('Created device:', { deviceId, deviceName, ip, os });
  console.log('Device API key:', apiKey);

  const attackTypes = ['Brute Force', 'Malware', 'SQL Injection', 'Data Exfiltration', 'Failed Auth'];

  while (true) {
    const kind = pick(['log', 'log', 'alert', 'network'] as const);

    if (kind === 'log') {
      const severities = ['info', 'warning', 'error', 'critical'] as const;
      const severity = pick([...severities]);
      await http(
        'POST',
        '/ingest/logs',
        {
          eventType: pick(['Authentication', 'Network', 'File', 'Process']),
          severity,
          message: `${severity.toUpperCase()} event from ${deviceName}`,
          rawData: { deviceId, note: 'simulated', ts: new Date().toISOString() },
        },
        { 'x-device-key': apiKey }
      );
      console.log('sent log', severity);
    } else if (kind === 'alert') {
      const severity = pick(['critical', 'high', 'medium', 'low'] as const);
      const attackType = pick(attackTypes);
      await http(
        'POST',
        '/ingest/alerts',
        {
          severity,
          title: `${attackType} detected`,
          description: `Simulated ${attackType} alert from ${deviceName}`,
          attackType,
          status: 'open',
          sourceIp: pick(['45.142.213.89', '103.45.67.12', '185.220.101.45']),
          affectedSystem: deviceName,
          rawLogs: `[sim] ${attackType} event payload`,
          country: pick(['India', 'USA', 'Brazil', 'Russia', 'China']),
          lat: pick([28.6139, 38.9072, -15.8267, 55.7558, 39.9042]),
          lng: pick([77.209, -77.0369, -47.9218, 37.6173, 116.4074]),
        },
        { 'x-device-key': apiKey }
      );
      console.log('sent alert', severity, attackType);
    } else if (kind === 'network') {
      await http(
        'POST',
        '/ingest/network/samples',
        {
          inbound: Math.floor(Math.random() * 3000),
          outbound: Math.floor(Math.random() * 2000),
        },
        { 'x-device-key': apiKey }
      );
      await http(
        'POST',
        '/ingest/network/connections',
        {
          srcIp: ip,
          dstIp: pick(['8.8.8.8', '1.1.1.1', '203.0.113.50', '45.142.213.89']),
          port: pick([22, 53, 80, 443, 3389]),
          protocol: pick(['TCP', 'UDP', 'HTTPS', 'SSH', 'DNS']),
          status: pick(['normal', 'suspicious'] as const),
        },
        { 'x-device-key': apiKey }
      );
      console.log('sent network sample + connection');
    }

    await sleep(2500);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

