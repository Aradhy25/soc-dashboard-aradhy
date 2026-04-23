import { Terminal, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Activity {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  time: string;
}

const activities: Activity[] = [
  { type: 'success', message: 'System initialization complete', time: '2m ago' },
  { type: 'info', message: 'Database backup started', time: '5m ago' },
  { type: 'warning', message: 'High memory usage detected', time: '12m ago' },
  { type: 'success', message: 'Security scan completed', time: '18m ago' },
  { type: 'info', message: 'New device connected', time: '24m ago' },
  { type: 'error', message: 'Failed authentication attempt', time: '31m ago' },
];

const activityConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-[#00ff88]',
    bg: 'bg-[#00ff88]/10',
    border: 'border-[#00ff88]/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[#ff00ff]',
    bg: 'bg-[#ff00ff]/10',
    border: 'border-[#ff00ff]/30',
  },
  error: {
    icon: AlertTriangle,
    color: 'text-[#ff0055]',
    bg: 'bg-[#ff0055]/10',
    border: 'border-[#ff0055]/30',
  },
  info: {
    icon: Info,
    color: 'text-[#00f0ff]',
    bg: 'bg-[#00f0ff]/10',
    border: 'border-[#00f0ff]/30',
  },
};

export function ActivityFeed() {
  return (
    <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,255,136,0.2)] backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl mb-2 text-[#00ff88]">Activity Feed</h3>
          <p className="text-sm text-[#64748b]">Recent system events</p>
        </div>
        <Terminal className="w-5 h-5 text-[#00ff88]" />
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${config.border} ${config.bg} hover:bg-opacity-20 transition-all group`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-[#64748b] mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
