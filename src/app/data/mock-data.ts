export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  timestamp: string;
  sourceIp: string;
  affectedSystem: string;
  attackType: string;
  mitreId?: string;
  rawLogs: string;
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  os: string;
  status: 'online' | 'offline' | 'isolated';
  alerts: number;
  lastSeen: string;
  processes: Process[];
}

export interface Process {
  id: string;
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'suspicious';
}

export interface Log {
  id: string;
  timestamp: string;
  device: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  sourceIp?: string;
  destinationIp?: string;
  rawData: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
  failedAttempts: number;
  devices: string[];
  riskScore: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  assignedTo: string;
  createdAt: string;
  affectedSystems: string[];
  rootCause: string;
}

export interface ThreatItem {
  id: string;
  type: 'ip' | 'hash' | 'domain';
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  firstSeen: string;
  lastSeen: string;
  reputation: number;
}

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    severity: 'critical',
    title: 'Brute Force Attack Detected',
    description: 'Multiple failed login attempts from suspicious IP address',
    status: 'open',
    timestamp: '2026-03-29T14:32:15Z',
    sourceIp: '45.142.213.89',
    affectedSystem: 'web-server-01',
    attackType: 'Brute Force',
    mitreId: 'T1110',
    rawLogs: '[2026-03-29 14:32:15] Failed login attempt from 45.142.213.89 for user admin',
  },
  {
    id: 'ALT-002',
    severity: 'high',
    title: 'Malware Detected on Endpoint',
    description: 'Suspicious executable flagged by antivirus',
    status: 'investigating',
    timestamp: '2026-03-29T13:45:22Z',
    sourceIp: '192.168.1.105',
    affectedSystem: 'desktop-042',
    attackType: 'Malware',
    mitreId: 'T1204',
    rawLogs: '[2026-03-29 13:45:22] Malicious file detected: evil.exe',
  },
  {
    id: 'ALT-003',
    severity: 'high',
    title: 'SQL Injection Attempt',
    description: 'Malicious SQL query detected in web request',
    status: 'open',
    timestamp: '2026-03-29T12:18:40Z',
    sourceIp: '103.45.67.12',
    affectedSystem: 'app-server-03',
    attackType: 'SQL Injection',
    mitreId: 'T1190',
    rawLogs: '[2026-03-29 12:18:40] Suspicious query: SELECT * FROM users WHERE id=1 OR 1=1',
  },
  {
    id: 'ALT-004',
    severity: 'medium',
    title: 'Unusual Network Traffic',
    description: 'High volume of outbound traffic detected',
    status: 'investigating',
    timestamp: '2026-03-29T11:05:33Z',
    sourceIp: '192.168.1.78',
    affectedSystem: 'workstation-15',
    attackType: 'Data Exfiltration',
    rawLogs: '[2026-03-29 11:05:33] Outbound traffic spike: 500MB in 2 minutes',
  },
  {
    id: 'ALT-005',
    severity: 'low',
    title: 'Failed Authentication',
    description: 'User entered incorrect password 3 times',
    status: 'resolved',
    timestamp: '2026-03-29T09:22:11Z',
    sourceIp: '192.168.1.45',
    affectedSystem: 'vpn-gateway',
    attackType: 'Failed Auth',
    rawLogs: '[2026-03-29 09:22:11] Failed login for user jsmith',
  },
];

export const mockDevices: Device[] = [
  {
    id: 'DEV-001',
    name: 'web-server-01',
    ip: '10.0.1.100',
    os: 'Ubuntu 22.04',
    status: 'online',
    alerts: 3,
    lastSeen: '2 minutes ago',
    processes: [
      { id: 'P1', name: 'nginx', pid: 1234, cpu: 12.5, memory: 256, status: 'running' },
      { id: 'P2', name: 'php-fpm', pid: 1235, cpu: 8.3, memory: 512, status: 'running' },
    ],
  },
  {
    id: 'DEV-002',
    name: 'desktop-042',
    ip: '192.168.1.105',
    os: 'Windows 11',
    status: 'isolated',
    alerts: 5,
    lastSeen: '5 minutes ago',
    processes: [
      { id: 'P3', name: 'explorer.exe', pid: 2456, cpu: 5.2, memory: 128, status: 'running' },
      { id: 'P4', name: 'evil.exe', pid: 3789, cpu: 45.7, memory: 1024, status: 'suspicious' },
    ],
  },
  {
    id: 'DEV-003',
    name: 'app-server-03',
    ip: '10.0.1.103',
    os: 'CentOS 8',
    status: 'online',
    alerts: 1,
    lastSeen: '1 minute ago',
    processes: [
      { id: 'P5', name: 'java', pid: 5678, cpu: 34.2, memory: 2048, status: 'running' },
    ],
  },
];

export const mockLogs: Log[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-03-29T14:32:15Z',
    device: 'web-server-01',
    eventType: 'Authentication',
    severity: 'error',
    message: 'Failed login attempt from 45.142.213.89',
    sourceIp: '45.142.213.89',
    rawData: '{"user": "admin", "ip": "45.142.213.89", "result": "failed"}',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-03-29T14:30:08Z',
    device: 'firewall-01',
    eventType: 'Network',
    severity: 'warning',
    message: 'Blocked connection attempt on port 22',
    sourceIp: '185.220.101.45',
    destinationIp: '10.0.1.100',
    rawData: '{"src": "185.220.101.45", "dst": "10.0.1.100", "port": 22, "action": "blocked"}',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-03-29T14:28:42Z',
    device: 'desktop-042',
    eventType: 'File',
    severity: 'critical',
    message: 'Malicious file detected and quarantined',
    rawData: '{"file": "C:\\Users\\jdoe\\Downloads\\evil.exe", "hash": "a3f5bc..."}',
  },
];

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    username: 'jsmith',
    email: 'jsmith@company.com',
    role: 'Administrator',
    lastLogin: '2026-03-29T14:00:00Z',
    failedAttempts: 0,
    devices: ['desktop-042', 'laptop-18'],
    riskScore: 15,
  },
  {
    id: 'USR-002',
    username: 'mjones',
    email: 'mjones@company.com',
    role: 'Analyst',
    lastLogin: '2026-03-29T13:30:00Z',
    failedAttempts: 3,
    devices: ['workstation-15'],
    riskScore: 45,
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Ransomware Attack on Finance Department',
    severity: 'critical',
    status: 'investigating',
    assignedTo: 'John Smith',
    createdAt: '2026-03-29T10:00:00Z',
    affectedSystems: ['desktop-042', 'file-server-02'],
    rootCause: 'Phishing email with malicious attachment',
  },
  {
    id: 'INC-002',
    title: 'Data Breach Attempt',
    severity: 'high',
    status: 'contained',
    assignedTo: 'Sarah Johnson',
    createdAt: '2026-03-28T15:30:00Z',
    affectedSystems: ['web-server-01'],
    rootCause: 'SQL injection vulnerability',
  },
];

export const mockThreats: ThreatItem[] = [
  {
    id: 'THR-001',
    type: 'ip',
    value: '45.142.213.89',
    severity: 'critical',
    description: 'Known botnet command and control server',
    firstSeen: '2026-03-15T08:00:00Z',
    lastSeen: '2026-03-29T14:32:15Z',
    reputation: 5,
  },
  {
    id: 'THR-002',
    type: 'hash',
    value: 'a3f5bc4e8d7f6a2b1c9e3d4f5a6b7c8d',
    severity: 'high',
    description: 'Trojan dropper variant',
    firstSeen: '2026-03-20T12:00:00Z',
    lastSeen: '2026-03-29T13:45:22Z',
    reputation: 10,
  },
  {
    id: 'THR-003',
    type: 'domain',
    value: 'malicious-site.evil',
    severity: 'high',
    description: 'Phishing domain targeting financial institutions',
    firstSeen: '2026-03-10T09:00:00Z',
    lastSeen: '2026-03-29T11:20:00Z',
    reputation: 8,
  },
];

export const attackTrendsData = [
  { time: '00:00', bruteForce: 12, malware: 5, injection: 8 },
  { time: '04:00', bruteForce: 8, malware: 3, injection: 5 },
  { time: '08:00', bruteForce: 25, malware: 12, injection: 15 },
  { time: '12:00', bruteForce: 45, malware: 20, injection: 28 },
  { time: '16:00', bruteForce: 38, malware: 15, injection: 22 },
  { time: '20:00', bruteForce: 28, malware: 10, injection: 18 },
  { time: '24:00', bruteForce: 15, malware: 7, injection: 10 },
];

export const attackMapData = [
  { country: 'Russia', attacks: 1247, lat: 55.7558, lng: 37.6173 },
  { country: 'China', attacks: 892, lat: 39.9042, lng: 116.4074 },
  { country: 'USA', attacks: 456, lat: 38.9072, lng: -77.0369 },
  { country: 'Brazil', attacks: 324, lat: -15.8267, lng: -47.9218 },
  { country: 'India', attacks: 287, lat: 28.6139, lng: 77.2090 },
];
