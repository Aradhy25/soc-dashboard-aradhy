import { useState } from 'react';
import { AlertTriangle, TrendingUp, Activity, Shield, ChevronRight } from 'lucide-react';
import { mockAlerts, mockDevices, mockLogs, attackTrendsData, attackMapData } from '../data/mock-data';
import { Modal } from '../components/modal';
import { AlertDetail } from '../components/alert-detail';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';

export default function Dashboard() {
  const [selectedAlert, setSelectedAlert] = useState<typeof mockAlerts[0] | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<typeof mockDevices[0] | null>(null);
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);
  const navigate = useNavigate();

  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical');
  const highAlerts = mockAlerts.filter(a => a.severity === 'high');
  const openAlerts = mockAlerts.filter(a => a.status === 'open');

  const handleAlertAction = (action: string) => {
    console.log('Action:', action);
    // Handle action
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#00f0ff] mb-2">Security Operations Center</h1>
          <p className="text-sm text-[#64748b]">Real-time threat monitoring and response</p>
        </div>
        <div className="text-sm text-[#64748b]">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          type="button"
          onClick={() => navigate('/alerts?severity=critical')}
          className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#ff0055]/20 to-transparent shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:scale-[1.02] transition-transform text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0055]/40"
          aria-label="View critical alerts"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Critical Alerts</p>
              <p className="text-3xl text-[#ff0055]">{criticalAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#ff0055]" />
          </div>
          <div className="text-xs text-[#ff0055]">Requires immediate attention</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/alerts?severity=high')}
          className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:scale-[1.02] transition-transform text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff00ff]/40"
          aria-label="View high alerts"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">High Alerts</p>
              <p className="text-3xl text-[#ff00ff]">{highAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#ff00ff]" />
          </div>
          <div className="text-xs text-[#ff00ff]">Elevated threat level</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/endpoints?status=online')}
          className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-[1.02] transition-transform text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]/40"
          aria-label="View online endpoints"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Active Devices</p>
              <p className="text-3xl text-[#00f0ff]">{mockDevices.filter(d => d.status === 'online').length}</p>
            </div>
            <Activity className="w-8 h-8 text-[#00f0ff]" />
          </div>
          <div className="text-xs text-[#00f0ff]">Monitored endpoints</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#00ff88]/20 to-transparent shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-[1.02] transition-transform text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/40"
          aria-label="Open reports"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Security Score</p>
              <p className="text-3xl text-[#00ff88]">94.2%</p>
            </div>
            <Shield className="w-8 h-8 text-[#00ff88]" />
          </div>
          <div className="text-xs text-[#00ff88]">↑ 2.3% from yesterday</div>
        </button>
      </div>

      {/* Attack Trends & Top Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Trends */}
        <div className="lg:col-span-2 p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-[#00f0ff] mb-2">Attack Trends</h3>
              <p className="text-sm text-[#64748b]">24-hour activity overview</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all text-xs text-[#00f0ff]"
              >
                View Alerts
              </button>
              <TrendingUp className="w-6 h-6 text-[#00f0ff]" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attackTrendsData}>
              <defs>
                <linearGradient id="bruteForceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff0055" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="malwareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="injectionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2942" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1628',
                  border: '1px solid #00f0ff',
                  borderRadius: '8px',
                }}
              />
              <Area key="brute-force" type="monotone" dataKey="bruteForce" stroke="#ff0055" strokeWidth={2} fill="url(#bruteForceGrad)" />
              <Area key="malware" type="monotone" dataKey="malware" stroke="#ff00ff" strokeWidth={2} fill="url(#malwareGrad)" />
              <Area key="injection" type="monotone" dataKey="injection" stroke="#00f0ff" strokeWidth={2} fill="url(#injectionGrad)" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff0055]" />
              <span className="text-sm text-[#64748b]">Brute Force</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff00ff]" />
              <span className="text-sm text-[#64748b]">Malware</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00f0ff]" />
              <span className="text-sm text-[#64748b]">Injection</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts List */}
        <div className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(255,0,85,0.2)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl text-[#ff0055] mb-2">Critical Alerts</h3>
              <p className="text-sm text-[#64748b]">Requires immediate action</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alerts?status=open')}
              className="px-3 py-2 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 hover:bg-[#ff0055]/20 hover:shadow-[0_0_15px_rgba(255,0,85,0.25)] transition-all text-xs text-[#ff0055]"
            >
              View Open
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {openAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        alert.severity === 'critical' ? 'bg-[#ff0055]/20 text-[#ff0055]' :
                        alert.severity === 'high' ? 'bg-[#ff00ff]/20 text-[#ff00ff]' :
                        'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-[#64748b]">{alert.id}</span>
                    </div>
                    <p className="text-sm text-[#00f0ff] group-hover:text-[#00ff88] transition-colors">{alert.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00f0ff] transition-colors" />
                </div>
                <p className="text-xs text-[#64748b]">{alert.affectedSystem}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attack Map */}
      <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl text-[#8b5cf6] mb-2">Global Attack Map</h3>
            <p className="text-sm text-[#64748b]">Attack origins by region</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/threat-intel')}
            className="px-3 py-2 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all text-xs text-[#8b5cf6]"
          >
            Threat Intel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {attackMapData.map((country, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              <div className="text-center">
                <p className="text-sm text-[#64748b] mb-2">{country.country}</p>
                <p className="text-2xl text-[#8b5cf6] mb-1">{country.attacks}</p>
                <p className="text-xs text-[#64748b]">attacks</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Devices & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Devices */}
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl text-[#00f0ff] mb-2">Active Devices</h3>
              <p className="text-sm text-[#64748b]">Monitored endpoints</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/endpoints')}
              className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all text-xs text-[#00f0ff]"
            >
              View Endpoints
            </button>
          </div>

          <div className="space-y-3">
            {mockDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.8)]' :
                      device.status === 'isolated' ? 'bg-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.8)]' :
                      'bg-[#64748b]'
                    } animate-pulse`} />
                    <div>
                      <p className="text-[#00f0ff] group-hover:text-[#00ff88] transition-colors">{device.name}</p>
                      <p className="text-xs text-[#64748b]">{device.ip} • {device.os}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.alerts > 0 && (
                      <span className="px-2 py-1 text-xs rounded bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30">
                        {device.alerts} alerts
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00f0ff] transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,255,136,0.2)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl text-[#00ff88] mb-2">Recent Logs</h3>
              <p className="text-sm text-[#64748b]">Latest system events</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/logs')}
              className="px-3 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.25)] transition-all text-xs text-[#00ff88]"
            >
              View Logs
            </button>
          </div>

          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00ff88]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        log.severity === 'critical' ? 'bg-[#ff0055]/20 text-[#ff0055]' :
                        log.severity === 'error' ? 'bg-[#ff00ff]/20 text-[#ff00ff]' :
                        log.severity === 'warning' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                        'bg-[#00f0ff]/20 text-[#00f0ff]'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-xs text-[#64748b]">{log.device}</span>
                    </div>
                    <p className="text-sm text-[#00ff88] group-hover:text-[#00f0ff] transition-colors">{log.message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00ff88] transition-colors" />
                </div>
                <p className="text-xs text-[#64748b]">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        title={`Alert Details - ${selectedAlert?.id}`}
        size="xl"
      >
        {selectedAlert && (
          <AlertDetail alert={selectedAlert} onAction={handleAlertAction} />
        )}
      </Modal>

      <Modal
        isOpen={selectedDevice !== null}
        onClose={() => setSelectedDevice(null)}
        title={`Device Details - ${selectedDevice?.name}`}
        size="lg"
      >
        {selectedDevice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">IP Address</p>
                <p className="text-[#00f0ff] font-mono">{selectedDevice.ip}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Operating System</p>
                <p className="text-[#00f0ff]">{selectedDevice.os}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Status</p>
                <p className={`${
                  selectedDevice.status === 'online' ? 'text-[#00ff88]' :
                  selectedDevice.status === 'isolated' ? 'text-[#ff0055]' :
                  'text-[#64748b]'
                }`}>{selectedDevice.status}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Last Seen</p>
                <p className="text-[#00f0ff]">{selectedDevice.lastSeen}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-[#64748b] mb-3">Running Processes</h4>
              <div className="space-y-2">
                {selectedDevice.processes.map((proc) => (
                  <div key={proc.id} className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#00f0ff]">{proc.name}</p>
                        <p className="text-xs text-[#64748b]">PID: {proc.pid}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#00f0ff]">CPU: {proc.cpu}%</p>
                        <p className="text-xs text-[#64748b]">MEM: {proc.memory}MB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={`Log Details - ${selectedLog?.id}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Timestamp</p>
                <p className="text-[#00ff88]">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Device</p>
                <p className="text-[#00ff88]">{selectedLog.device}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Event Type</p>
                <p className="text-[#00ff88]">{selectedLog.eventType}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Severity</p>
                <p className={`${
                  selectedLog.severity === 'critical' ? 'text-[#ff0055]' :
                  selectedLog.severity === 'error' ? 'text-[#ff00ff]' :
                  selectedLog.severity === 'warning' ? 'text-[#8b5cf6]' :
                  'text-[#00f0ff]'
                }`}>{selectedLog.severity}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#00ff88]/20 bg-[#000509]">
              <p className="text-xs text-[#64748b] mb-2">Message</p>
              <p className="text-[#00ff88]">{selectedLog.message}</p>
            </div>

            <div className="p-4 rounded-lg border border-[#00ff88]/20 bg-[#000509]">
              <p className="text-xs text-[#64748b] mb-2">Raw Data</p>
              <pre className="text-xs text-[#00ff88] font-mono whitespace-pre-wrap">{selectedLog.rawData}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
