import { useCallback, useEffect, useMemo, useState } from 'react';
import { Network as NetworkIcon, Activity, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { apiGet } from '../lib/api';
import type { NetworkOverview } from '../lib/types';
import { useSocLiveRefresh } from '../lib/use-soc-live-refresh';

function formatRate(value: number): string {
  const n = Math.max(0, value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} GB/s`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} MB/s`;
  return `${n} KB/s`;
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Network() {
  const [overview, setOverview] = useState<NetworkOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const next = await apiGet<NetworkOverview>('/network/overview', { hours: 24 });
        setOverview(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load network overview');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocLiveRefresh(refresh);

  const trafficData = useMemo(() => {
    const traffic = overview?.traffic ?? [];
    return traffic.map((t) => ({ time: timeLabel(t.time), inbound: t.inbound, outbound: t.outbound }));
  }, [overview]);

  const stats = overview?.stats ?? {
    activeConnections: 0,
    suspiciousActivity: 0,
    maxInbound: 0,
    maxOutbound: 0,
  };

  const connections = overview?.connections ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Network Monitoring</h1>
        <p className="text-sm text-[#64748b]">Real-time network traffic analysis</p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Active Connections</p>
              <p className="text-3xl text-[#00f0ff]">{stats.activeConnections.toLocaleString()}</p>
            </div>
            <NetworkIcon className="w-8 h-8 text-[#00f0ff]" />
          </div>
          <div className="text-xs text-[#00f0ff]">Last 24 hours</div>
        </div>

        <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Bandwidth Usage</p>
              <p className="text-3xl text-[#8b5cf6]">{formatRate(stats.maxInbound + stats.maxOutbound)}</p>
            </div>
            <Activity className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <div className="text-xs text-[#8b5cf6]">Peak in/out combined</div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent shadow-[0_0_15px_rgba(255,0,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Suspicious Activity</p>
              <p className="text-3xl text-[#ff00ff]">{stats.suspiciousActivity.toLocaleString()}</p>
            </div>
            <Globe className="w-8 h-8 text-[#ff00ff]" />
          </div>
          <div className="text-xs text-[#ff00ff]">Requires investigation</div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl text-[#00f0ff] mb-2">Traffic Overview</h3>
            <p className="text-sm text-[#64748b]">24-hour network activity</p>
          </div>
          {loading ? <span className="text-xs text-[#64748b]">Loading…</span> : null}
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
              {connections.map((conn) => (
                <tr
                  key={conn.id}
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
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        conn.status === 'suspicious'
                          ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'
                          : 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30'
                      }`}
                    >
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

