import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { time: '00:00', upload: 45, download: 120 },
  { time: '04:00', upload: 52, download: 145 },
  { time: '08:00', upload: 78, download: 210 },
  { time: '12:00', upload: 95, download: 280 },
  { time: '16:00', upload: 88, download: 245 },
  { time: '20:00', upload: 72, download: 195 },
  { time: '24:00', upload: 58, download: 160 },
];

export function NetworkChart() {
  return (
    <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl mb-2 text-[#00f0ff]">Network Activity</h3>
        <p className="text-sm text-[#64748b]">Real-time bandwidth monitoring</p>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          <span className="text-sm">Download</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
          <span className="text-sm">Upload</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2942" />
          <XAxis dataKey="time" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a1628', 
              border: '1px solid #00f0ff',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,240,255,0.3)'
            }} 
          />
          <Area type="monotone" dataKey="download" stroke="#00f0ff" strokeWidth={2} fill="url(#downloadGradient)" />
          <Area type="monotone" dataKey="upload" stroke="#ff00ff" strokeWidth={2} fill="url(#uploadGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
