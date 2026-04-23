import { Network as NetworkIcon, Activity, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trafficData = [
  { time: '00:00', inbound: 1200, outbound: 800 },
  { time: '04:00', inbound: 900, outbound: 600 },
  { time: '08:00', inbound: 2100, outbound: 1400 },
  { time: '12:00', inbound: 2800, outbound: 1900 },
  { time: '16:00', inbound: 2400, outbound: 1600 },
  { time: '20:00', inbound: 1800, outbound: 1200 },
  { time: '24:00', inbound: 1400, outbound: 900 },
];

const connections = [
  { src: '192.168.1.100', dst: '203.0.113.50', port: 443, protocol: 'HTTPS', status: 'normal' },
  { src: '192.168.1.105', dst: '45.142.213.89', port: 22, protocol: 'SSH', status: 'suspicious' },
  { src: '10.0.1.50', dst: '8.8.8.8', port: 53, protocol: 'DNS', status: 'normal' },
  { src: '192.168.1.78', dst: '103.45.67.12', port: 3389, protocol: 'RDP', status: 'suspicious' },
];

export default function Network() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Network Monitoring</h1>
        <p className="text-sm text-[#64748b]">Real-time network traffic analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Active Connections</p>
              <p className="text-3xl text-[#00f0ff]">1,247</p>
            </div>
            <NetworkIcon className="w-8 h-8 text-[#00f0ff]" />
          </div>
          <div className="text-xs text-[#00f0ff]">↑ 12% from average</div>
        </div>

        <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Bandwidth Usage</p>
              <p className="text-3xl text-[#8b5cf6]">2.8 GB/s</p>
            </div>
            <Activity className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <div className="text-xs text-[#8b5cf6]">Within normal range</div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent shadow-[0_0_15px_rgba(255,0,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Suspicious Activity</p>
              <p className="text-3xl text-[#ff00ff]">8</p>
            </div>
            <Globe className="w-8 h-8 text-[#ff00ff]" />
          </div>
          <div className="text-xs text-[#ff00ff]">Requires investigation</div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="mb-6">
          <h3 className="text-xl text-[#00f0ff] mb-2">Traffic Overview</h3>
          <p className="text-sm text-[#64748b]">24-hour network activity</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
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
            <Line type="monotone" dataKey="inbound" stroke="#00f0ff" strokeWidth={2} />
            <Line type="monotone" dataKey="outbound" stroke="#ff00ff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Inbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff00ff]" />
            <span className="text-sm text-[#64748b]">Outbound</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl text-[#00f0ff] mb-2">Connection Logs</h3>
          <p className="text-sm text-[#64748b] mb-6">Recent network connections</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Source IP</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Destination IP</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Port</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Protocol</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{conn.src}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{conn.dst}</span>
                  </td>
                  <td className="p-4 text-[#8b5cf6]">{conn.port}</td>
                  <td className="p-4 text-[#00f0ff]">{conn.protocol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      conn.status === 'suspicious' 
                        ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30' 
                        : 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30'
                    }`}>
                      {conn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
