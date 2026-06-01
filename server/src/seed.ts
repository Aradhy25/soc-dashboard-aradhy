import { prisma } from './db/prisma.js';
import { apiKeyPrefix, generateApiKey, hashApiKey } from './lib/api-key.js';

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  await prisma.networkConnection.deleteMany();
  await prisma.networkSample.deleteMany();
  await prisma.log.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.threatItem.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.observedUser.deleteMany();
  await prisma.device.deleteMany();

  const deviceKey1 = generateApiKey();
  const deviceKey2 = generateApiKey();

  const [webServer, endpoint] = await prisma.$transaction([
    prisma.device.create({
      data: {
        name: 'web-server-01',
        ip: '10.0.1.100',
        os: 'Ubuntu 22.04',
        status: 'online',
        lastSeenAt: hoursAgo(0.1),
        processes: [
          { name: 'nginx', pid: 1234, cpu: 12.5, memory: 256, status: 'running' },
          { name: 'php-fpm', pid: 1235, cpu: 8.3, memory: 512, status: 'running' },
        ],
        apiKeyHash: hashApiKey(deviceKey1),
        apiKeyPrefix: apiKeyPrefix(deviceKey1),
      },
    }),
    prisma.device.create({
      data: {
        name: 'desktop-042',
        ip: '192.168.1.105',
        os: 'Windows 11',
        status: 'isolated',
        lastSeenAt: hoursAgo(0.3),
        processes: [
          { name: 'explorer.exe', pid: 2456, cpu: 5.2, memory: 128, status: 'running' },
          { name: 'evil.exe', pid: 3789, cpu: 45.7, memory: 1024, status: 'suspicious' },
        ],
        apiKeyHash: hashApiKey(deviceKey2),
        apiKeyPrefix: apiKeyPrefix(deviceKey2),
      },
    }),
  ]);

  await prisma.alert.createMany({
    data: [
      {
        deviceId: webServer.id,
        timestamp: hoursAgo(1),
        severity: 'critical',
        title: 'Brute Force Attack Detected',
        description: 'Multiple failed login attempts from suspicious IP address',
        status: 'open',
        sourceIp: '45.142.213.89',
        affectedSystem: webServer.name,
        attackType: 'Brute Force',
        mitreId: 'T1110',
        rawLogs: '[auth] Failed login attempt from 45.142.213.89 for user admin',
        country: 'Russia',
        lat: 55.7558,
        lng: 37.6173,
      },
      {
        deviceId: endpoint.id,
        timestamp: hoursAgo(2),
        severity: 'high',
        title: 'Malware Detected on Endpoint',
        description: 'Suspicious executable flagged by antivirus',
        status: 'investigating',
        sourceIp: endpoint.ip ?? undefined,
        affectedSystem: endpoint.name,
        attackType: 'Malware',
        mitreId: 'T1204',
        rawLogs: '[av] Malicious file detected: evil.exe',
        country: 'India',
        lat: 28.6139,
        lng: 77.209,
      },
      {
        deviceId: webServer.id,
        timestamp: hoursAgo(5),
        severity: 'high',
        title: 'SQL Injection Attempt',
        description: 'Malicious SQL query detected in web request',
        status: 'open',
        sourceIp: '103.45.67.12',
        affectedSystem: 'app-server-03',
        attackType: 'SQL Injection',
        mitreId: 'T1190',
        rawLogs: "[waf] Suspicious query: SELECT * FROM users WHERE id=1 OR 1=1",
        country: 'China',
        lat: 39.9042,
        lng: 116.4074,
      },
    ],
  });

  await prisma.log.createMany({
    data: [
      {
        deviceId: webServer.id,
        timestamp: hoursAgo(1),
        eventType: 'Authentication',
        severity: 'error',
        message: 'Failed login attempt from 45.142.213.89',
        sourceIp: '45.142.213.89',
        rawData: { user: 'admin', ip: '45.142.213.89', result: 'failed' },
      },
      {
        deviceId: webServer.id,
        timestamp: hoursAgo(1.1),
        eventType: 'Network',
        severity: 'warning',
        message: 'Blocked connection attempt on port 22',
        sourceIp: '185.220.101.45',
        destinationIp: '10.0.1.100',
        rawData: { port: 22, action: 'blocked' },
      },
      {
        deviceId: endpoint.id,
        timestamp: hoursAgo(2),
        eventType: 'File',
        severity: 'critical',
        message: 'Malicious file detected and quarantined',
        rawData: { file: 'C:\\\\Users\\\\jdoe\\\\Downloads\\\\evil.exe', hash: 'a3f5bc...' },
      },
    ],
  });

  await prisma.networkSample.createMany({
    data: [
      { deviceId: webServer.id, timestamp: hoursAgo(24), inbound: 1200, outbound: 800 },
      { deviceId: webServer.id, timestamp: hoursAgo(20), inbound: 900, outbound: 600 },
      { deviceId: webServer.id, timestamp: hoursAgo(16), inbound: 2100, outbound: 1400 },
      { deviceId: webServer.id, timestamp: hoursAgo(12), inbound: 2800, outbound: 1900 },
      { deviceId: webServer.id, timestamp: hoursAgo(8), inbound: 2400, outbound: 1600 },
      { deviceId: webServer.id, timestamp: hoursAgo(4), inbound: 1800, outbound: 1200 },
      { deviceId: webServer.id, timestamp: hoursAgo(0), inbound: 1400, outbound: 900 },
    ],
  });

  await prisma.networkConnection.createMany({
    data: [
      { deviceId: webServer.id, timestamp: hoursAgo(0.5), srcIp: '192.168.1.100', dstIp: '203.0.113.50', port: 443, protocol: 'HTTPS', status: 'normal' },
      { deviceId: endpoint.id, timestamp: hoursAgo(0.6), srcIp: '192.168.1.105', dstIp: '45.142.213.89', port: 22, protocol: 'SSH', status: 'suspicious' },
      { deviceId: webServer.id, timestamp: hoursAgo(0.7), srcIp: '10.0.1.50', dstIp: '8.8.8.8', port: 53, protocol: 'DNS', status: 'normal' },
      { deviceId: endpoint.id, timestamp: hoursAgo(0.8), srcIp: '192.168.1.78', dstIp: '103.45.67.12', port: 3389, protocol: 'RDP', status: 'suspicious' },
    ],
  });

  await prisma.threatItem.createMany({
    data: [
      {
        type: 'ip',
        value: '45.142.213.89',
        severity: 'critical',
        description: 'Known botnet command and control server',
        firstSeen: hoursAgo(24 * 20),
        lastSeen: hoursAgo(1),
        reputation: 5,
      },
      {
        type: 'hash',
        value: 'a3f5bc4e8d7f6a2b1c9e3d4f5a6b7c8d',
        severity: 'high',
        description: 'Trojan dropper variant',
        firstSeen: hoursAgo(24 * 10),
        lastSeen: hoursAgo(2),
        reputation: 10,
      },
      {
        type: 'domain',
        value: 'malicious-site.example',
        severity: 'high',
        description: 'Phishing domain targeting financial institutions',
        firstSeen: hoursAgo(24 * 30),
        lastSeen: hoursAgo(10),
        reputation: 8,
      },
    ],
  });

  await prisma.incident.createMany({
    data: [
      {
        title: 'Ransomware Attack on Finance Department',
        severity: 'critical',
        status: 'investigating',
        assignedTo: 'John Smith',
        createdAt: hoursAgo(12),
        affectedSystems: ['desktop-042', 'file-server-02'],
        rootCause: 'Phishing email with malicious attachment',
      },
      {
        title: 'Data Breach Attempt',
        severity: 'high',
        status: 'contained',
        assignedTo: 'Sarah Johnson',
        createdAt: hoursAgo(24 * 2),
        affectedSystems: ['web-server-01'],
        rootCause: 'SQL injection vulnerability',
      },
    ],
  });

  await prisma.observedUser.createMany({
    data: [
      {
        username: 'jsmith',
        email: 'jsmith@company.com',
        role: 'Administrator',
        lastLogin: hoursAgo(2),
        failedAttempts: 0,
        devices: ['desktop-042', 'laptop-18'],
        riskScore: 15,
      },
      {
        username: 'mjones',
        email: 'mjones@company.com',
        role: 'Analyst',
        lastLogin: hoursAgo(3),
        failedAttempts: 3,
        devices: ['workstation-15'],
        riskScore: 45,
      },
    ],
  });

  // Print device keys once so you can run a simulated device immediately.
  console.log('Seed complete.');
  console.log('Device keys (store these somewhere safe; they are not saved in DB):');
  console.log(`- ${webServer.name} (${webServer.id}): ${deviceKey1}`);
  console.log(`- ${endpoint.name} (${endpoint.id}): ${deviceKey2}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
