import { Zap, Activity, Database, Server } from 'lucide-react';

interface MetricGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: typeof Zap;
  color: string;
}

const metrics: Omit<MetricGaugeProps, 'icon'>[] = [
  { label: 'Power', value: 850, max: 1200, unit: 'W', color: '#00f0ff' },
  { label: 'Latency', value: 12, max: 100, unit: 'ms', color: '#8b5cf6' },
  { label: 'Requests', value: 4523, max: 10000, unit: '/s', color: '#ff00ff' },
  { label: 'Load', value: 3.2, max: 8, unit: 'avg', color: '#00ff88' },
];

const icons = [Zap, Activity, Database, Server];

export function MetricGauge() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = icons[index];
        const percentage = (metric.value / metric.max) * 100;
        
        return (
          <div
            key={index}
            className="relative p-5 rounded-lg border bg-gradient-to-br from-[#0a1628] to-[#000913] backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform"
            style={{
              borderColor: `${metric.color}40`,
              boxShadow: `0 0 15px ${metric.color}30`,
            }}
          >
            {/* Background glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `radial-gradient(circle at center, ${metric.color}10 0%, transparent 70%)`,
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#64748b] uppercase tracking-wider">{metric.label}</span>
                <Icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              
              {/* Circular progress */}
              <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#1a2942"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={metric.color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                    className="transition-all duration-500"
                    style={{
                      filter: `drop-shadow(0 0 8px ${metric.color})`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl">{metric.value}</span>
                  <span className="text-xs text-[#64748b]">{metric.unit}</span>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-xs text-[#64748b]">Max: {metric.max}{metric.unit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
