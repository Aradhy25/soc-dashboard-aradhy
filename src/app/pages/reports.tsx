import { useCallback, useEffect, useState } from 'react';
import { FileDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { apiGet } from '../lib/api';
import { downloadTextFile, toCsv } from '../lib/preferences';
import type { WeeklyReport } from '../lib/types';
import { useSocLiveRefresh } from '../lib/use-soc-live-refresh';
import { useToast } from '../lib/toast';

type DailyReport = {
  period: string;
  summary: Record<string, number>;
  alerts: unknown[];
  logs: unknown[];
};

type MonthlyReport = {
  period: string;
  summary: Record<string, number>;
  data: Array<{ week: string; alerts: number; resolved: number }>;
  alerts: unknown[];
};

export default function Reports() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const { pushToast } = useToast();

  const refresh = useCallback(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const next = await apiGet<WeeklyReport>('/reports/weekly');
        setReport(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocLiveRefresh(refresh);

  const reportData = report?.data ?? [];

  const exportPayload = (filename: string, payload: unknown, format: 'json' | 'csv', rows?: Array<Record<string, unknown>>) => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (format === 'json') {
      downloadTextFile(`${filename}-${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json');
    } else {
      downloadTextFile(`${filename}-${stamp}.csv`, toCsv(rows ?? []), 'text/csv');
    }
    pushToast(`Exported ${filename} as ${format.toUpperCase()}`, 'success');
  };

  const generatePeriod = (period: 'daily' | 'weekly' | 'monthly') => {
    void (async () => {
      try {
        setActivePeriod(period);
        setLoading(true);
        if (period === 'weekly') {
          const next = await apiGet<WeeklyReport>('/reports/weekly');
          setReport(next);
          exportPayload('soc-weekly-report', next, 'json');
        } else if (period === 'daily') {
          const next = await apiGet<DailyReport>('/reports/daily');
          exportPayload('soc-daily-report', next, 'json');
        } else {
          const next = await apiGet<MonthlyReport>('/reports/monthly');
          exportPayload('soc-monthly-report', next, 'json');
        }
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Failed to generate report', 'error');
      } finally {
        setLoading(false);
      }
    })();
  };

  const exportWeekly = (format: 'json' | 'csv' | 'pdf') => {
    if (!report) {
      pushToast('No report loaded yet', 'error');
      return;
    }
    if (format === 'pdf') {
      // Lightweight printable summary (no PDF dependency).
      const win = window.open('', '_blank');
      if (!win) {
        pushToast('Pop-up blocked — allow pop-ups to export PDF', 'error');
        return;
      }
      win.document.write(`<!doctype html><html><head><title>SOC Weekly Report</title>
        <style>body{font-family:sans-serif;padding:24px;color:#111} h1{margin:0 0 8px} table{border-collapse:collapse;width:100%;margin-top:16px} td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>
        </head><body>
        <h1>SOC Weekly Report</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <p>Total alerts: ${report.summary?.totalAlerts ?? reportData.reduce((s, d) => s + d.alerts, 0)} · Resolved: ${report.summary?.resolved ?? reportData.reduce((s, d) => s + d.resolved, 0)}</p>
        <table><thead><tr><th>Day</th><th>Alerts</th><th>Resolved</th></tr></thead><tbody>
        ${reportData.map((d) => `<tr><td>${d.day}</td><td>${d.alerts}</td><td>${d.resolved}</td></tr>`).join('')}
        </tbody></table>
        <script>window.print()</script></body></html>`);
      win.document.close();
      pushToast('Opened printable weekly report', 'success');
      return;
    }

    if (format === 'csv') {
      exportPayload('soc-weekly-report', report, 'csv', reportData.map((d) => ({ ...d })));
    } else {
      exportPayload('soc-weekly-report', report, 'json');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Reports & Analytics</h1>
        <p className="text-sm text-[#64748b]">Generate and export security reports</p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => generatePeriod('daily')}
          className={`p-6 rounded-lg border text-left transition-all ${
            activePeriod === 'daily'
              ? 'border-[#00f0ff] bg-[#00f0ff]/15 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
          }`}
        >
          <Calendar className="w-8 h-8 text-[#00f0ff] mb-4" />
          <h3 className="text-lg text-[#00f0ff] mb-2">Daily Report</h3>
          <p className="text-sm text-[#64748b]">Generate today's security summary</p>
        </button>

        <button
          type="button"
          onClick={() => generatePeriod('weekly')}
          className={`p-6 rounded-lg border text-left transition-all ${
            activePeriod === 'weekly'
              ? 'border-[#8b5cf6] bg-[#8b5cf6]/15 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
              : 'border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
          }`}
        >
          <Calendar className="w-8 h-8 text-[#8b5cf6] mb-4" />
          <h3 className="text-lg text-[#8b5cf6] mb-2">Weekly Report</h3>
          <p className="text-sm text-[#64748b]">7-day security analysis</p>
        </button>

        <button
          type="button"
          onClick={() => generatePeriod('monthly')}
          className={`p-6 rounded-lg border text-left transition-all ${
            activePeriod === 'monthly'
              ? 'border-[#ff00ff] bg-[#ff00ff]/15 shadow-[0_0_20px_rgba(255,0,255,0.3)]'
              : 'border-[#ff00ff]/30 bg-gradient-to-br from-[#ff00ff]/20 to-transparent hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]'
          }`}
        >
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
          <button
            type="button"
            onClick={() => exportWeekly('json')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-all text-[#00ff88]"
          >
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {loading ? <div className="text-xs text-[#64748b] mb-3">Loading…</div> : null}

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
        <button
          type="button"
          onClick={() => exportWeekly('pdf')}
          className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 transition-all text-[#00f0ff]"
        >
          <FileDown className="w-5 h-5" />
          <span>Export as PDF</span>
        </button>

        <button
          type="button"
          onClick={() => exportWeekly('csv')}
          className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 transition-all text-[#8b5cf6]"
        >
          <FileDown className="w-5 h-5" />
          <span>Export as CSV</span>
        </button>

        <button
          type="button"
          onClick={() => exportWeekly('json')}
          className="flex items-center justify-center gap-2 p-4 rounded-lg border border-[#ff00ff]/30 bg-[#ff00ff]/10 hover:bg-[#ff00ff]/20 transition-all text-[#ff00ff]"
        >
          <FileDown className="w-5 h-5" />
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
}
