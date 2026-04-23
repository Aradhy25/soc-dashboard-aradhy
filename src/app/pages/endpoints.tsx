import { useEffect, useMemo, useState } from 'react';
import { mockDevices } from '../data/mock-data';
import { Modal } from '../components/modal';
import { Monitor, Activity, Ban, Filter, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export default function Endpoints() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const statusFilter = useMemo(() => {
    const v = query.get('status');
    return v && ['online', 'offline', 'isolated'].includes(v) ? v : 'all';
  }, [query]);

  const searchQuery = useMemo(() => (query.get('q') ?? '').trim(), [query]);
  const deviceId = useMemo(() => query.get('id') ?? '', [query]);

  const [selectedDevice, setSelectedDevice] = useState<typeof mockDevices[0] | null>(null);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value.trim() === '' || value === 'all') next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  const filteredDevices = mockDevices.filter((device) => {
    if (statusFilter !== 'all' && device.status !== statusFilter) return false;
    if (searchQuery) {
      const haystack = [
        device.id,
        device.name,
        device.ip,
        device.os,
        device.status,
        device.lastSeen,
        String(device.alerts),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!deviceId) {
      setSelectedDevice(null);
      return;
    }
    setSelectedDevice(mockDevices.find((d) => d.id === deviceId) ?? null);
  }, [deviceId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Endpoint Management</h1>
        <p className="text-sm text-[#64748b]">Monitor and manage connected devices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => updateQuery({ status: 'online' })}
          className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#00ff88]/20 to-transparent shadow-[0_0_15px_rgba(0,255,136,0.3)] text-left hover:scale-[1.02] transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Online</p>
              <p className="text-3xl text-[#00ff88]">{mockDevices.filter(d => d.status === 'online').length}</p>
            </div>
            <Monitor className="w-8 h-8 text-[#00ff88]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => updateQuery({ status: 'isolated' })}
          className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#ff0055]/20 to-transparent shadow-[0_0_15px_rgba(255,0,85,0.3)] text-left hover:scale-[1.02] transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0055]/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Isolated</p>
              <p className="text-3xl text-[#ff0055]">{mockDevices.filter(d => d.status === 'isolated').length}</p>
            </div>
            <Ban className="w-8 h-8 text-[#ff0055]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => updateQuery({ status: 'all' })}
          className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)] text-left hover:scale-[1.02] transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Total Alerts</p>
              <p className="text-3xl text-[#8b5cf6]">{mockDevices.reduce((sum, d) => sum + d.alerts, 0)}</p>
            </div>
            <Activity className="w-8 h-8 text-[#8b5cf6]" />
          </div>
        </button>
      </div>

      <div className="p-4 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] text-sm outline-none focus:border-[#00f0ff]"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="isolated">Isolated</option>
            <option value="offline">Offline</option>
          </select>

          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => updateQuery({ q: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#00f0ff] placeholder:text-[#64748b]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Device ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Name</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">IP Address</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Operating System</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Status</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Alerts</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr
                  key={device.id}
                  onClick={() => updateQuery({ id: device.id })}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{device.id}</span>
                  </td>
                  <td className="p-4 text-[#00f0ff]">{device.name}</td>
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{device.ip}</span>
                  </td>
                  <td className="p-4 text-[#8b5cf6]">{device.os}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-[#00ff88]' :
                        device.status === 'isolated' ? 'bg-[#ff0055]' :
                        'bg-[#64748b]'
                      } animate-pulse`} />
                      <span className={`text-sm ${
                        device.status === 'online' ? 'text-[#00ff88]' :
                        device.status === 'isolated' ? 'text-[#ff0055]' :
                        'text-[#64748b]'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {device.alerts > 0 ? (
                      <span className="px-2 py-1 text-xs rounded bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30">
                        {device.alerts}
                      </span>
                    ) : (
                      <span className="text-[#64748b]">0</span>
                    )}
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">{device.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={selectedDevice !== null}
        onClose={() => updateQuery({ id: null })}
        title={`Endpoint Details - ${selectedDevice?.name}`}
        size="lg"
      >
        {selectedDevice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">IP Address</p>
                <p className="text-[#00f0ff] font-mono">{selectedDevice.ip}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Operating System</p>
                <p className="text-[#00f0ff]">{selectedDevice.os}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Status</p>
                <p className={`${
                  selectedDevice.status === 'online' ? 'text-[#00ff88]' :
                  selectedDevice.status === 'isolated' ? 'text-[#ff0055]' :
                  'text-[#64748b]'
                }`}>{selectedDevice.status}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Last Seen</p>
                <p className="text-[#00f0ff]">{selectedDevice.lastSeen}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-[#64748b] mb-3">Running Processes</h4>
              <div className="space-y-2">
                {selectedDevice.processes.map((proc) => (
                  <div key={proc.id} className={`p-3 rounded-lg border ${
                    proc.status === 'suspicious'
                      ? 'border-[#ff0055]/30 bg-[#ff0055]/10'
                      : 'border-[#00f0ff]/20 bg-[#0a1628]/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={proc.status === 'suspicious' ? 'text-[#ff0055]' : 'text-[#00f0ff]'}>
                          {proc.name}
                        </p>
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

            <div className="grid grid-cols-3 gap-3">
              <button className="px-4 py-2 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 hover:bg-[#ff0055]/20 transition-all text-[#ff0055]">
                Isolate
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 transition-all text-[#8b5cf6]">
                Scan
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 transition-all text-[#00f0ff]">
                Shutdown
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
