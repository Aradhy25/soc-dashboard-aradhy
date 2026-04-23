import { useState } from 'react';
import { mockThreats } from '../data/mock-data';
import { Modal } from '../components/modal';
import { Brain, Search, AlertTriangle, Hash, Globe } from 'lucide-react';

export default function ThreatIntel() {
  const [selectedThreat, setSelectedThreat] = useState<typeof mockThreats[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'ip' | 'hash' | 'domain'>('ip');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Threat Intelligence</h1>
        <p className="text-sm text-[#64748b]">IOC lookup and threat analysis</p>
      </div>

      <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        <h3 className="text-xl text-[#8b5cf6] mb-4">IOC Lookup</h3>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSearchType('ip')}
            className={`px-4 py-2 rounded-lg transition-all ${
              searchType === 'ip'
                ? 'border border-[#00f0ff]/30 bg-[#00f0ff]/20 text-[#00f0ff]'
                : 'border border-[#00f0ff]/10 bg-[#0a1628] text-[#64748b] hover:text-[#00f0ff]'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            IP Address
          </button>
          <button
            onClick={() => setSearchType('hash')}
            className={`px-4 py-2 rounded-lg transition-all ${
              searchType === 'hash'
                ? 'border border-[#00f0ff]/30 bg-[#00f0ff]/20 text-[#00f0ff]'
                : 'border border-[#00f0ff]/10 bg-[#0a1628] text-[#64748b] hover:text-[#00f0ff]'
            }`}
          >
            <Hash className="w-4 h-4 inline mr-2" />
            File Hash
          </button>
          <button
            onClick={() => setSearchType('domain')}
            className={`px-4 py-2 rounded-lg transition-all ${
              searchType === 'domain'
                ? 'border border-[#00f0ff]/30 bg-[#00f0ff]/20 text-[#00f0ff]'
                : 'border border-[#00f0ff]/10 bg-[#0a1628] text-[#64748b] hover:text-[#00f0ff]'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Domain
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]">
            <Search className="w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              placeholder={`Enter ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#00f0ff] placeholder:text-[#64748b]"
            />
          </div>
          <button className="px-6 py-3 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 transition-all text-[#8b5cf6]">
            Lookup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#ff0055]/20 to-transparent shadow-[0_0_15px_rgba(255,0,85,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Critical Threats</p>
              <p className="text-3xl text-[#ff0055]">{mockThreats.filter(t => t.severity === 'critical').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#ff0055]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent shadow-[0_0_15px_rgba(255,0,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">High Threats</p>
              <p className="text-3xl text-[#ff00ff]">{mockThreats.filter(t => t.severity === 'high').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#ff00ff]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">IOCs Tracked</p>
              <p className="text-3xl text-[#00f0ff]">{mockThreats.length}</p>
            </div>
            <Brain className="w-8 h-8 text-[#00f0ff]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl text-[#00f0ff] mb-2">Threat Feed</h3>
          <p className="text-sm text-[#64748b] mb-6">Known indicators of compromise</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Type</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Value</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Severity</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Description</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Reputation</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {mockThreats.map((threat) => (
                <tr
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{threat.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-[#8b5cf6]/20 text-[#8b5cf6] uppercase">
                      {threat.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{threat.value}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded uppercase ${
                      threat.severity === 'critical' ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30' :
                      threat.severity === 'high' ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30' :
                      'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'
                    }`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748b]">{threat.description}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#1a2942] rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full bg-gradient-to-r from-[#00ff88] to-[#ff0055]"
                          style={{ width: `${threat.reputation * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#00f0ff]">{threat.reputation}/10</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">
                    {new Date(threat.lastSeen).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={selectedThreat !== null}
        onClose={() => setSelectedThreat(null)}
        title={`Threat Details - ${selectedThreat?.id}`}
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Type</p>
                <p className="text-[#8b5cf6] uppercase">{selectedThreat.type}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Severity</p>
                <p className={`uppercase ${
                  selectedThreat.severity === 'critical' ? 'text-[#ff0055]' :
                  selectedThreat.severity === 'high' ? 'text-[#ff00ff]' :
                  'text-[#8b5cf6]'
                }`}>{selectedThreat.severity}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#000509]">
              <p className="text-xs text-[#64748b] mb-2">Value</p>
              <p className="text-[#00f0ff] font-mono break-all">{selectedThreat.value}</p>
            </div>

            <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
              <p className="text-xs text-[#64748b] mb-2">Description</p>
              <p className="text-[#00f0ff]">{selectedThreat.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">First Seen</p>
                <p className="text-[#00f0ff]">{new Date(selectedThreat.firstSeen).toLocaleDateString()}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Last Seen</p>
                <p className="text-[#00f0ff]">{new Date(selectedThreat.lastSeen).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#64748b]">Reputation Score</p>
                <p className="text-xl text-[#8b5cf6]">{selectedThreat.reputation}/10</p>
              </div>
              <div className="h-3 bg-[#1a2942] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#ff0055] transition-all"
                  style={{ width: `${selectedThreat.reputation * 10}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
