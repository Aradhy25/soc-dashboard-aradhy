import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/modal';
import { Shield, Clock, Users, CheckCircle } from 'lucide-react';

import { apiGet, apiPatch } from '../lib/api';
import type { IncidentItem, IncidentStatus } from '../lib/types';
import { useSocLiveRefresh } from '../lib/use-soc-live-refresh';
import { useToast } from '../lib/toast';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
}

const assignees = ['SOC Analyst', 'IR Lead', 'Threat Hunter', 'On-Call Engineer'];

export default function IncidentResponse() {
  const [items, setItems] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [assignee, setAssignee] = useState(assignees[0]);
  const { pushToast } = useToast();

  const refresh = useCallback(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const next = await apiGet<{ items: IncidentItem[] }>('/incidents');
        setItems(next.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load incidents');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocLiveRefresh(refresh);

  const counts = useMemo(() => {
    return {
      open: items.filter((i) => i.status === 'open').length,
      investigating: items.filter((i) => i.status === 'investigating').length,
      contained: items.filter((i) => i.status === 'contained').length,
      resolved: items.filter((i) => i.status === 'resolved').length,
    };
  }, [items]);

  const updateIncident = (data: { status?: IncidentStatus; assignedTo?: string }) => {
    void (async () => {
      if (!selectedIncident) return;
      try {
        const updated = await apiPatch<IncidentItem>(`/incidents/${selectedIncident.id}`, data);
        setSelectedIncident(updated);
        pushToast(
          data.assignedTo
            ? `Reassigned to ${data.assignedTo}`
            : `Incident marked ${data.status ?? 'updated'}`,
          'success'
        );
        refresh();
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Update failed', 'error');
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Incident Response</h1>
        <p className="text-sm text-[#64748b]">Manage and track security incidents</p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#ff0055]/20 to-transparent shadow-[0_0_15px_rgba(255,0,85,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Open</p>
              <p className="text-3xl text-[#ff0055]">{counts.open}</p>
            </div>
            <Shield className="w-8 h-8 text-[#ff0055]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent shadow-[0_0_15px_rgba(255,0,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Investigating</p>
              <p className="text-3xl text-[#ff00ff]">{counts.investigating}</p>
            </div>
            <Clock className="w-8 h-8 text-[#ff00ff]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Contained</p>
              <p className="text-3xl text-[#8b5cf6]">{counts.contained}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#8b5cf6]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#00ff88]/20 to-transparent shadow-[0_0_15px_rgba(0,255,136,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Resolved</p>
              <p className="text-3xl text-[#00ff88]">{counts.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#00ff88]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Title</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Severity</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Status</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Assigned To</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Affected Systems</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((incident) => {
                const affectedSystems = asStringArray(incident.affectedSystems);
                return (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-[#00f0ff] font-mono text-sm">{incident.id}</span>
                    </td>
                    <td className="p-4 text-[#00f0ff]">{incident.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs rounded uppercase ${
                          incident.severity === 'critical'
                            ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30'
                            : incident.severity === 'high'
                              ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30'
                              : 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          incident.status === 'resolved'
                            ? 'bg-[#00ff88]/20 text-[#00ff88]'
                            : incident.status === 'contained'
                              ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                              : incident.status === 'investigating'
                                ? 'bg-[#ff00ff]/20 text-[#ff00ff]'
                                : 'bg-[#ff0055]/20 text-[#ff0055]'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#8b5cf6]">{incident.assignedTo}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded bg-[#00f0ff]/20 text-[#00f0ff]">
                        {affectedSystems.length} systems
                      </span>
                    </td>
                    <td className="p-4 text-[#64748b] text-sm">{new Date(incident.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
        title={`Incident Details - ${selectedIncident?.id}`}
        size="xl"
      >
        {selectedIncident && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-lg border ${
                selectedIncident.severity === 'critical'
                  ? 'border-[#ff0055]/30 bg-[#ff0055]/10'
                  : 'border-[#ff00ff]/30 bg-[#ff00ff]/10'
              }`}
            >
              <h3
                className={`text-lg mb-2 ${
                  selectedIncident.severity === 'critical' ? 'text-[#ff0055]' : 'text-[#ff00ff]'
                }`}
              >
                {selectedIncident.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded uppercase ${
                    selectedIncident.severity === 'critical'
                      ? 'bg-[#ff0055]/20 text-[#ff0055]'
                      : 'bg-[#ff00ff]/20 text-[#ff00ff]'
                  }`}
                >
                  {selectedIncident.severity}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    selectedIncident.status === 'resolved'
                      ? 'bg-[#00ff88]/20 text-[#00ff88]'
                      : selectedIncident.status === 'contained'
                        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                        : 'bg-[#ff00ff]/20 text-[#ff00ff]'
                  }`}
                >
                  {selectedIncident.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Assigned To</p>
                <p className="text-[#00f0ff]">{selectedIncident.assignedTo}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Created</p>
                <p className="text-[#00f0ff]">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
              <p className="text-xs text-[#64748b] mb-2">Root Cause</p>
              <p className="text-[#00f0ff]">{selectedIncident.rootCause}</p>
            </div>

            <div>
              <h4 className="text-sm text-[#64748b] mb-3">Affected Systems</h4>
              <div className="grid grid-cols-2 gap-2">
                {asStringArray(selectedIncident.affectedSystems).map((system, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[#ff0055]/20 bg-[#ff0055]/10">
                    <p className="text-[#ff0055]">{system}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => updateIncident({ status: 'investigating' })}
                className="px-4 py-2 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10 text-[#ff00ff]"
              >
                Investigating
              </button>
              <button
                type="button"
                onClick={() => updateIncident({ status: 'contained' })}
                className="px-4 py-2 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]"
              >
                Contained
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignee(selectedIncident.assignedTo || assignees[0]);
                  setReassignOpen(true);
                }}
                className="px-4 py-2 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 transition-all text-[#8b5cf6]"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Reassign
              </button>
              <button
                type="button"
                onClick={() => updateIncident({ status: 'resolved' })}
                className="px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-all text-[#00ff88]"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Close
              </button>
            </div>

            {loading ? <div className="text-xs text-[#64748b]">Updating…</div> : null}
          </div>
        )}
      </Modal>

      <Modal isOpen={reassignOpen} onClose={() => setReassignOpen(false)} title="Reassign Incident" size="sm">
        <div className="space-y-4">
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff]"
          >
            {assignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] text-[#00f0ff]"
            placeholder="Custom assignee"
          />
          <button
            type="button"
            onClick={() => {
              updateIncident({ assignedTo: assignee.trim() || 'SOC Analyst' });
              setReassignOpen(false);
            }}
            className="w-full px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]"
          >
            Confirm Reassign
          </button>
        </div>
      </Modal>
    </div>
  );
}
