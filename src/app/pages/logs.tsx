import { useEffect, useMemo, useState } from 'react';
import { mockLogs } from '../data/mock-data';
import { Modal } from '../components/modal';
import { Filter, Search, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export default function Logs() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const severityFilter = useMemo(() => {
    const v = query.get('severity');
    return v && ['critical', 'error', 'warning', 'info'].includes(v) ? v : 'all';
  }, [query]);

  const searchQuery = useMemo(() => (query.get('q') ?? '').trim(), [query]);
  const logId = useMemo(() => query.get('id') ?? '', [query]);

  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value.trim() === '' || value === 'all') next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  const filteredLogs = mockLogs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const haystack = [
        log.id,
        log.timestamp,
        log.device,
        log.eventType,
        log.severity,
        log.message,
        log.sourceIp ?? '',
        log.destinationIp ?? '',
        log.rawData,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!logId) {
      setSelectedLog(null);
      return;
    }
    setSelectedLog(mockLogs.find((l) => l.id === logId) ?? null);
  }, [logId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#00f0ff] mb-2">Log Explorer</h1>
          <p className="text-sm text-[#64748b]">Search and analyze system logs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-all text-[#00ff88]">
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="p-4 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Filters:</span>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => updateQuery({ severity: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] text-sm outline-none focus:border-[#00f0ff]"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search logs..."
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
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Timestamp</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Device</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Event Type</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Severity</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => updateQuery({ id: log.id })}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{log.id}</span>
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 text-[#00f0ff]">{log.device}</td>
                  <td className="p-4 text-[#8b5cf6]">{log.eventType}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded uppercase ${
                      log.severity === 'critical' ? 'bg-[#ff0055]/20 text-[#ff0055]' :
                      log.severity === 'error' ? 'bg-[#ff00ff]/20 text-[#ff00ff]' :
                      log.severity === 'warning' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                      'bg-[#00f0ff]/20 text-[#00f0ff]'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748b]">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={selectedLog !== null}
        onClose={() => updateQuery({ id: null })}
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
                <p className="text-[#00ff88]">{selectedLog.severity}</p>
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
