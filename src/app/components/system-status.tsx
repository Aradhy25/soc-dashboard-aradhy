import { Cpu, HardDrive, Wifi, Shield } from 'lucide-react';

interface StatusItem {
  icon: typeof Cpu;
  label: string;
  value: number;
  status: 'optimal' | 'warning' | 'critical';
}

const statusItems: StatusItem[] = [
  { icon: Cpu, label: 'CPU Usage', value: 67, status: 'optimal' },
  { icon: HardDrive, label: 'Storage', value: 82, status: 'warning' },
  { icon: Wifi, label: 'Network', value: 45, status: 'optimal' },
  { icon: Shield, label: 'Security', value: 98, status: 'optimal' },
];

const statusColors = {
  optimal: {
    bg: 'bg-[#00ff88]/20',
    border: 'border-[#00ff88]/30',
    text: 'text-[#00ff88]',
    glow: 'shadow-[0_0_15px_rgba(0,255,136,0.3)]',
  },
  warning: {
    bg: 'bg-[#ff00ff]/20',
    border: 'border-[#ff00ff]/30',
    text: 'text-[#ff00ff]',
    glow: 'shadow-[0_0_15px_rgba(255,0,255,0.3)]',
  },
  critical: {
    bg: 'bg-[#ff0055]/20',
    border: 'border-[#ff0055]/30',
    text: 'text-[#ff0055]',
    glow: 'shadow-[0_0_15px_rgba(255,0,85,0.3)]',
  },
};

export function SystemStatus() {
  return (
    <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(139,92,246,0.2)] backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl mb-2 text-[#8b5cf6]">System Status</h3>
        <p className="text-sm text-[#64748b]">Real-time monitoring</p>
      </div>
      
      <div className="space-y-4">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          const colors = statusColors[item.status];
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border ${colors.glow}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className={`text-sm ${colors.text}`}>{item.value}%</span>
              </div>
              
              <div className="relative h-2 bg-[#1a2942] rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${colors.bg} ${colors.glow} transition-all duration-500 group-hover:brightness-125`}
                  style={{ width: `${item.value}%` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.text.replace('text-', 'from-')} to-transparent opacity-50`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
