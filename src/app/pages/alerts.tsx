import { useEffect, useMemo, useState } from 'react';
import { mockAlerts } from '../data/mock-data';
import { Modal } from '../components/modal';
import { AlertDetail } from '../components/alert-detail';
import { AlertTriangle, Filter, Search, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export default function Alerts() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const severityFilter = useMemo(() => {
    const v = query.get('severity');
    return v && ['critical', 'high', 'medium', 'low'].includes(v) ? v : 'all';
  }, [query]);

  const statusFilter = useMemo(() => {
    const v = query.get('status');
    return v && ['open', 'investigating', 'resolved'].includes(v) ? v : 'all';
  }, [query]);

  const searchQuery = useMemo(() => (query.get('q') ?? '').trim(), [query]);
  const alertId = useMemo(() => query.get('id') ?? '', [query]);

  const attackTypeOptions = useMemo(() => {
    return Array.from(new Set(mockAlerts.map((a) => a.attackType))).sort((a, b) => a.localeCompare(b));
  }, []);

  const attackTypeFilter = useMemo(() => {
    const v = query.get('attackType');
    return v && attackTypeOptions.includes(v) ? v : 'all';
  }, [attackTypeOptions, query]);

  const [selectedAlert, setSelectedAlert] = useState<typeof mockAlerts[0] | null>(null);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value.trim() === '' || value === 'all') next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (attackTypeFilter !== 'all' && alert.attackType !== attackTypeFilter) return false;
    if (searchQuery) {
      const haystack = [
        alert.id,
        alert.title,
        alert.description,
        alert.status,
        alert.severity,
        alert.affectedSystem,
        alert.sourceIp,
        alert.attackType,
        alert.mitreId ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleAlertAction = (action: string) => {
    console.log('Action:', action);
  };

  useEffect(() => {
    if (!alertId) {
      setSelectedAlert(null);
      return;
    }
    setSelectedAlert(mockAlerts.find((a) => a.id === alertId) ?? null);
  }, [alertId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#00f0ff] mb-2">Alerts Management</h1>
          <p className="text-sm text-[#64748b]">Monitor and respond to security threats</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all text-[#00f0ff]">
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Filters:</span>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => updateQuery({ severity: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] text-sm outline-none focus:border-[#00f0ff] transition-colors"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] text-sm outline-none focus:border-[#00f0ff] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={attackTypeFilter}
            onChange={(e) => updateQuery({ attackType: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] text-sm outline-none focus:border-[#00f0ff] transition-colors"
          >
            <option value="all">All Attack Types</option>
            {attackTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => updateQuery({ q: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#00f0ff] placeholder:text-[#64748b]"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10">
          <p className="text-sm text-[#64748b] mb-1">Critical</p>
          <p className="text-2xl text-[#ff0055]">{mockAlerts.filter(a => a.severity === 'critical').length}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10">
          <p className="text-sm text-[#64748b] mb-1">High</p>
          <p className="text-2xl text-[#ff00ff]">{mockAlerts.filter(a => a.severity === 'high').length}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10">
          <p className="text-sm text-[#64748b] mb-1">Medium</p>
          <p className="text-2xl text-[#8b5cf6]">{mockAlerts.filter(a => a.severity === 'medium').length}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10">
          <p className="text-sm text-[#64748b] mb-1">Low</p>
          <p className="text-2xl text-[#00f0ff]">{mockAlerts.filter(a => a.severity === 'low').length}</p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Severity</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Title</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">System</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Source IP</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Status</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => updateQuery({ id: alert.id })}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{alert.id}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded uppercase ${
                      alert.severity === 'critical' ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30' :
                      alert.severity === 'high' ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30' :
                      alert.severity === 'medium' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30' :
                      'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#00f0ff]" />
                      <span className="text-[#00f0ff]">{alert.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748b]">{alert.affectedSystem}</td>
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{alert.sourceIp}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      alert.status === 'resolved' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                      alert.status === 'investigating' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                      'bg-[#ff00ff]/20 text-[#ff00ff]'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={selectedAlert !== null}
        onClose={() => updateQuery({ id: null })}
        title={`Alert Details - ${selectedAlert?.id}`}
        size="xl"
      >
        {selectedAlert && (
          <AlertDetail alert={selectedAlert} onAction={handleAlertAction} />
        )}
      </Modal>
    </div>
  );
}
