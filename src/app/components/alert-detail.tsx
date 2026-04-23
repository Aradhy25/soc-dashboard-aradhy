import { Alert } from '../data/mock-data';
import { 
  Shield, 
  Clock, 
  Server, 
  MapPin, 
  FileText, 
  Target,
  Ban,
  Laptop,
  XCircle,
  CheckCircle
} from 'lucide-react';

interface AlertDetailProps {
  alert: Alert;
  onAction: (action: string) => void;
}

const severityColors = {
  critical: {
    bg: 'bg-[#ff0055]/10',
    border: 'border-[#ff0055]/30',
    text: 'text-[#ff0055]',
    glow: 'shadow-[0_0_15px_rgba(255,0,85,0.3)]',
  },
  high: {
    bg: 'bg-[#ff00ff]/10',
    border: 'border-[#ff00ff]/30',
    text: 'text-[#ff00ff]',
    glow: 'shadow-[0_0_15px_rgba(255,0,255,0.3)]',
  },
  medium: {
    bg: 'bg-[#8b5cf6]/10',
    border: 'border-[#8b5cf6]/30',
    text: 'text-[#8b5cf6]',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
  },
  low: {
    bg: 'bg-[#00f0ff]/10',
    border: 'border-[#00f0ff]/30',
    text: 'text-[#00f0ff]',
    glow: 'shadow-[0_0_15px_rgba(0,240,255,0.3)]',
  },
};

export function AlertDetail({ alert, onAction }: AlertDetailProps) {
  const colors = severityColors[alert.severity];

  return (
    <div className="space-y-6">
      {/* Alert Info */}
      <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg} ${colors.glow}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs uppercase px-2 py-1 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                {alert.severity}
              </span>
              <span className={`text-xs uppercase px-2 py-1 rounded ${
                alert.status === 'resolved' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30' :
                alert.status === 'investigating' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30' :
                'bg-[#ff00ff]/10 text-[#ff00ff] border-[#ff00ff]/30'
              } border`}>
                {alert.status}
              </span>
            </div>
            <h3 className="text-lg text-[#00f0ff] mb-2">{alert.title}</h3>
            <p className="text-sm text-[#64748b]">{alert.description}</p>
          </div>
          <Shield className={`w-8 h-8 ${colors.text}`} />
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Timestamp</span>
          </div>
          <p className="text-[#00f0ff]">{new Date(alert.timestamp).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Affected System</span>
          </div>
          <p className="text-[#00f0ff]">{alert.affectedSystem}</p>
        </div>

        <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Source IP</span>
          </div>
          <p className="text-[#00f0ff] font-mono">{alert.sourceIp}</p>
        </div>

        <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#64748b]">Attack Type</span>
          </div>
          <p className="text-[#00f0ff]">{alert.attackType}</p>
        </div>
      </div>

      {/* MITRE ATT&CK */}
      {alert.mitreId && (
        <div className="p-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm text-[#64748b]">MITRE ATT&CK Mapping</span>
          </div>
          <p className="text-[#8b5cf6] font-mono">{alert.mitreId}</p>
        </div>
      )}

      {/* Raw Logs */}
      <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#000509]">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#00f0ff]" />
          <span className="text-sm text-[#64748b]">Raw Logs</span>
        </div>
        <pre className="text-xs text-[#00ff88] font-mono whitespace-pre-wrap">{alert.rawLogs}</pre>
      </div>

      {/* Suggested Actions */}
      <div className="space-y-3">
        <h4 className="text-sm text-[#64748b] mb-3">Suggested Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => onAction('block-ip')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 hover:bg-[#ff0055]/20 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all text-[#ff0055]"
          >
            <Ban className="w-4 h-4" />
            <span>Block IP</span>
          </button>

          <button
            onClick={() => onAction('isolate-host')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10 hover:bg-[#ff00ff]/20 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all text-[#ff00ff]"
          >
            <Laptop className="w-4 h-4" />
            <span>Isolate Host</span>
          </button>

          <button
            onClick={() => onAction('kill-process')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all text-[#8b5cf6]"
          >
            <XCircle className="w-4 h-4" />
            <span>Kill Process</span>
          </button>

          <button
            onClick={() => onAction('escalate')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all text-[#00ff88]"
          >
            <Shield className="w-4 h-4" />
            <span>Escalate Incident</span>
          </button>
        </div>
      </div>

      {/* Mark Status */}
      <div className="space-y-3">
        <h4 className="text-sm text-[#64748b] mb-3">Mark Status</h4>
        <div className="flex gap-3">
          <button
            onClick={() => onAction('status-investigating')}
            className="flex-1 px-4 py-2 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 transition-all text-[#8b5cf6]"
          >
            Investigating
          </button>
          <button
            onClick={() => onAction('status-resolved')}
            className="flex-1 px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-all text-[#00ff88]"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
