import { FileDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const reportData = [
  { day: 'Mon', alerts: 45, resolved: 38 },
  { day: 'Tue', alerts: 52, resolved: 45 },
  { day: 'Wed', alerts: 38, resolved: 35 },
  { day: 'Thu', alerts: 62, resolved: 54 },
  { day: 'Fri', alerts: 48, resolved: 42 },
  { day: 'Sat', alerts: 28, resolved: 25 },
  { day: 'Sun', alerts: 22, resolved: 20 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Reports & Analytics</h1>
        <p className="text-sm text-[#64748b]">Generate and export security reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all text-left">
          <Calendar className="w-8 h-8 text-[#00f0ff] mb-4" />
          <h3 className="text-lg text-[#00f0ff] mb-2">Daily Report</h3>
          <p className="text-sm text-[#64748b]">Generate today's security summary</p>
        </button>

        <button className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-left">
          <Calendar className="w-8 h-8 text-[#8b5cf6] mb-4" />
          <h3 className="text-lg text-[#8b5cf6] mb-2">Weekly Report</h3>
          <p className="text-sm text-[#64748b]">7-day security analysis</p>
        </button>

        <button className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent hover:shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all text-left">
          <Calendar className="w-8 h-8 text-[#ff00ff] mb-4" />
          <h3 className="text-lg text-[#ff00ff] mb-2">Monthly Report</h3>
          <p className="text-sm text-[#64748b]">Comprehensive monthly overview</p>
        </button>
      </div>

      <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-[#00f0ff] mb-2">Weekly Performance</h3>
            <p className="text-sm text-[#64748b]">Alerts created vs resolved</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-all text-[#00ff88]">
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2942" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a1628',
                border: '1px solid #00f0ff',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="alerts" fill="#ff00ff" />
            <Bar dataKey="resolved" fill="#00ff88" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 transition-all text-[#00f0ff]">
          <FileDown className="w-5 h-5" />
          <span>Export as PDF</span>
        </button>

        <button className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 transition-all text-[#8b5cf6]">
          <FileDown className="w-5 h-5" />
          <span>Export as CSV</span>
        </button>

        <button className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10 hover:bg-[#ff00ff]/20 transition-all text-[#ff00ff]">
          <FileDown className="w-5 h-5" />
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
}
