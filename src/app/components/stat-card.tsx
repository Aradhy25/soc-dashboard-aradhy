import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'cyan' | 'purple' | 'pink' | 'green' | 'red';
}

const colorClasses = {
  cyan: 'from-[#00f0ff]/20 to-transparent border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]',
  purple: 'from-[#8b5cf6]/20 to-transparent border-[#8b5cf6]/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
  pink: 'from-[#ff00ff]/20 to-transparent border-[#ff00ff]/30 shadow-[0_0_15px_rgba(255,0,255,0.3)]',
  green: 'from-[#00ff88]/20 to-transparent border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.3)]',
  red: 'from-[#ff0055]/20 to-transparent border-[#ff0055]/30 shadow-[0_0_15px_rgba(255,0,85,0.3)]',
};

const iconColorClasses = {
  cyan: 'text-[#00f0ff]',
  purple: 'text-[#8b5cf6]',
  pink: 'text-[#ff00ff]',
  green: 'text-[#00ff88]',
  red: 'text-[#ff0055]',
};

export function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div
      className={`relative p-6 rounded-lg border bg-gradient-to-br backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform ${colorClasses[color]}`}
    >
      {/* Glowing effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-current/5 to-transparent" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#64748b] uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl mb-2">{value}</p>
          <div className="flex items-center gap-1">
            <span className={trend === 'up' ? 'text-[#00ff88]' : 'text-[#ff0055]'}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-[#0a1628]/50 ${iconColorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Corner decorations */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-current/10 to-transparent ${iconColorClasses[color]}`} />
      <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-radial from-current/10 to-transparent ${iconColorClasses[color]}`} />
    </div>
  );
}
