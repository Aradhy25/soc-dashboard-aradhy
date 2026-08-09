export type DeviceStatus = 'online' | 'offline' | 'isolated';
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'investigating' | 'resolved';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';
export type ThreatType = 'ip' | 'hash' | 'domain';
export type ConnectionStatus = 'normal' | 'suspicious';

export interface DeviceProcess {
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'suspicious' | 'killed';
}

export interface DeviceSummary {
  id: string;
  name: string;
  ip: string | null;
  os: string | null;
  status: DeviceStatus;
  lastSeenAt: string | null;
  processes: DeviceProcess[];
  apiKeyPrefix: string;
  createdAt: string;
  updatedAt: string;
  alerts: number;
  logs: number;
}

export interface AlertItem {
  id: string;
  deviceId: string | null;
  device?: { id: string; name: string } | null;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  sourceIp: string | null;
  affectedSystem: string | null;
  attackType: string;
  mitreId: string | null;
  rawLogs: string;
  country: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogItem {
  id: string;
  deviceId: string;
  device?: { id: string; name: string } | null;
  timestamp: string;
  eventType: string;
  severity: LogSeverity;
  message: string;
  sourceIp: string | null;
  destinationIp: string | null;
  rawData: unknown;
  createdAt: string;
}

export interface ObservedUser {
  id: string;
  username: string;
  email: string | null;
  role: string | null;
  lastLogin: string | null;
  failedAttempts: number;
  devices: string[];
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreatItem {
  id: string;
  type: ThreatType;
  value: string;
  severity: AlertSeverity;
  description: string;
  firstSeen: string;
  lastSeen: string;
  reputation: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentItem {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  assignedTo: string;
  createdAt: string;
  rootCause: string;
  affectedSystems: unknown;
  updatedAt: string;
}

export interface DashboardOverview {
  stats: {
    criticalAlerts: number;
    highAlerts: number;
    openAlerts: number;
    onlineDevices: number;
    isolatedDevices: number;
    securityScore: number;
    scoreDelta: number;
  };
  recent: {
    alerts: AlertItem[];
    logs: LogItem[];
  };
  charts: {
    attackTrends: Array<{ time: string; bruteForce: number; malware: number; injection: number }>;
    attackMap: Array<{ country: string; attacks: number; lat: number; lng: number }>;
  };
}

export interface AlertActionResult {
  action: string;
  message?: string;
  alert?: AlertItem;
  incident?: IncidentItem;
  threat?: ThreatItem;
  device?: DeviceSummary;
}

export interface DeviceActionResult {
  device: DeviceSummary;
  message?: string | null;
}

export interface WeeklyReport {
  data: Array<{ day: string; alerts: number; resolved: number }>;
  summary?: {
    period: string;
    start: string;
    end: string;
    totalAlerts: number;
    resolved: number;
    critical: number;
    high: number;
  };
  alerts?: Array<Pick<AlertItem, 'timestamp' | 'status' | 'severity' | 'title' | 'attackType'>>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface NetworkOverview {
  stats: {
    activeConnections: number;
    suspiciousActivity: number;
    maxInbound: number;
    maxOutbound: number;
  };
  traffic: Array<{ time: string; inbound: number; outbound: number }>;
  connections: Array<{
    id: string;
    time: string;
    src: string;
    dst: string;
    port: number;
    protocol: string;
    status: ConnectionStatus;
  }>;
}


