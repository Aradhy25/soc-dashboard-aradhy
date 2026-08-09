import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Filter, Search, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { Modal } from '../components/modal';
import { AlertDetail } from '../components/alert-detail';
import { apiGet, apiPatch, apiPost } from '../lib/api';
import type { AlertActionResult, AlertItem, Paginated } from '../lib/types';
import { useSocLiveRefresh } from '../lib/use-soc-live-refresh';
import { useToast } from '../lib/toast';

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
  const attackTypeQuery = useMemo(() => (query.get('attackType') ?? '').trim(), [query]);

  const [page, setPage] = useState<Paginated<AlertItem> | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleIp, setRuleIp] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const { pushToast } = useToast();

  const attackTypeFilter = useMemo(() => {
    if (!attackTypeQuery || attackTypeQuery === 'all') return 'all';
    return attackTypeQuery;
  }, [attackTypeQuery]);

  const attackTypeOptions = useMemo(() => {
    const items = page?.items ?? [];
    const set = new Set(items.map((a) => a.attackType).filter(Boolean));
    if (attackTypeQuery && attackTypeQuery !== 'all') set.add(attackTypeQuery);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [attackTypeQuery, page]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value.trim() === '' || value === 'all') next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

  const refresh = useCallback(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);

        const next = await apiGet<Paginated<AlertItem>>('/alerts', {
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          attackType: attackTypeFilter !== 'all' ? attackTypeFilter : undefined,
          q: searchQuery || undefined,
          limit: 200,
          offset: 0,
        });

        setPage(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, [attackTypeFilter, searchQuery, severityFilter, statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocLiveRefresh(refresh);

  const filteredAlerts = page?.items ?? [];

  const severityCounts = useMemo(() => {
    const counts: Record<'critical' | 'high' | 'medium' | 'low', number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const a of filteredAlerts) counts[a.severity] += 1;
    return counts;
  }, [filteredAlerts]);

  const handleAlertAction = (action: string) => {
    void (async () => {
      if (!selectedAlert) return;

      try {
        if (action === 'status-investigating') {
          await apiPatch(`/alerts/${selectedAlert.id}`, { status: 'investigating' });
          pushToast('Alert marked investigating', 'success');
        } else if (action === 'status-resolved') {
          await apiPatch(`/alerts/${selectedAlert.id}`, { status: 'resolved' });
          pushToast('Alert resolved', 'success');
        } else {
          const result = await apiPost<AlertActionResult>(`/alerts/${selectedAlert.id}/actions`, { action });
          pushToast(result.message ?? `Action ${action} completed`, 'success');
          if (result.alert) setSelectedAlert(result.alert);
          if (action === 'escalate' && result.incident) {
            navigate(`/incidents`);
          }
        }
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Action failed', 'error');
      } finally {
        refresh();
      }
    })();
  };

  const createBlockRule = () => {
    void (async () => {
      const value = ruleIp.trim();
      if (!value) {
        pushToast('Enter an IP to block', 'error');
        return;
      }
      try {
        await apiPost('/threats', {
          type: 'ip',
          value,
          severity: 'high',
          description: ruleDesc.trim() || `Manual block rule for ${value}`,
          reputation: 8,
        });
        pushToast(`Created block rule for ${value}`, 'success');
        setRuleOpen(false);
        setRuleIp('');
        setRuleDesc('');
        navigate('/threat-intel');
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Failed to create rule', 'error');
      }
    })();
  };

  useEffect(() => {
    if (!alertId) {
      setSelectedAlert(null);
      return;
    }

    const fromList = filteredAlerts.find((a) => a.id === alertId);
    if (fromList) {
      setSelectedAlert(fromList);
      return;
    }

    void (async () => {
      try {
        const fetched = await apiGet<AlertItem>(`/alerts/${alertId}`);
        setSelectedAlert(fetched);
      } catch {
        setSelectedAlert(null);
      }
    })();
  }, [alertId, filteredAlerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#00f0ff] mb-2">Alerts Management</h1>
          <p className="text-sm text-[#64748b]">Monitor and respond to security threats</p>
        </div>
        <button
          type="button"
          onClick={() => setRuleOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all text-[#00f0ff]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] text-sm">
          {error}
        </div>
      ) : null}

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

          {loading ? <span className="text-xs text-[#64748b]">Loading…</span> : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10">
          <p className="text-sm text-[#64748b] mb-1">Critical</p>
          <p className="text-2xl text-[#ff0055]">{severityCounts.critical}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10">
          <p className="text-sm text-[#64748b] mb-1">High</p>
          <p className="text-2xl text-[#ff00ff]">{severityCounts.high}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10">
          <p className="text-sm text-[#64748b] mb-1">Medium</p>
          <p className="text-2xl text-[#8b5cf6]">{severityCounts.medium}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10">
          <p className="text-sm text-[#64748b] mb-1">Low</p>
          <p className="text-2xl text-[#00f0ff]">{severityCounts.low}</p>
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
                    <span
                      className={`px-2 py-1 text-xs rounded uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'
                          : alert.severity === 'high'
                            ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30'
                            : alert.severity === 'medium'
                              ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'
                              : 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#00f0ff]" />
                      <span className="text-[#00f0ff]">{alert.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748b]">{alert.affectedSystem ?? alert.device?.name ?? 'unknown'}</td>
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{alert.sourceIp ?? 'unknown'}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        alert.status === 'resolved'
                          ? 'bg-[#00ff88]/20 text-[#00ff88]'
                          : alert.status === 'investigating'
                            ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                            : 'bg-[#ff00ff]/20 text-[#ff00ff]'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">{new Date(alert.timestamp).toLocaleString()}</td>
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
        {selectedAlert && <AlertDetail alert={selectedAlert} onAction={handleAlertAction} />}
      </Modal>

      <Modal isOpen={ruleOpen} onClose={() => setRuleOpen(false)} title="Create Block Rule" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">IP Address</label>
            <input
              value={ruleIp}
              onChange={(e) => setRuleIp(e.target.value)}
              placeholder="203.0.113.10"
              className="w-full px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] outline-none focus:border-[#00f0ff]"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Description</label>
            <input
              value={ruleDesc}
              onChange={(e) => setRuleDesc(e.target.value)}
              placeholder="Reason for blocking"
              className="w-full px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff] outline-none focus:border-[#00f0ff]"
            />
          </div>
          <button
            type="button"
            onClick={createBlockRule}
            className="w-full px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] transition-all"
          >
            Save Rule
          </button>
        </div>
      </Modal>
    </div>
  );
}

