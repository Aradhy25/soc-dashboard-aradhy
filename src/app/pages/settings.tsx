import { Settings as SettingsIcon, Users, Bell, Key, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { apiGet } from '../lib/api';
import { loadPreferences, savePreferences, type SocPreferences } from '../lib/preferences';
import type { DeviceSummary } from '../lib/types';
import { useToast } from '../lib/toast';

export default function Settings() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [prefs, setPrefs] = useState<SocPreferences>(() => loadPreferences());
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const next = await apiGet<{ items: DeviceSummary[] }>('/devices', { limit: 50 });
        setDevices(next.items);
      } catch {
        // optional section
      }
    })();
  }, []);

  const updatePref = <K extends keyof SocPreferences>(key: K, value: SocPreferences[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePreferences(next);
    pushToast('Preferences saved', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Settings</h1>
        <p className="text-sm text-[#64748b]">Configure system preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/30">
              <Users className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <h3 className="text-lg text-[#00f0ff]">User Management</h3>
              <p className="text-sm text-[#64748b]">Review observed accounts and risk</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all text-[#00f0ff]"
            >
              View Observed Users
            </button>
            <button
              type="button"
              onClick={() => navigate('/incidents')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all text-[#00f0ff]"
            >
              Incident Assignments
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30">
              <Bell className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-lg text-[#8b5cf6]">Alert Configuration</h3>
              <p className="text-sm text-[#64748b]">Block rules and open alert queues</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#8b5cf6]/40 transition-all text-[#8b5cf6]"
            >
              Open Alert Rules
            </button>
            <button
              type="button"
              onClick={() => navigate('/alerts?status=open&severity=critical')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#8b5cf6]/40 transition-all text-[#8b5cf6]"
            >
              Critical Notification Queue
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff00ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#ff00ff]/20 border border-[#ff00ff]/30">
              <Zap className="w-6 h-6 text-[#ff00ff]" />
            </div>
            <div>
              <h3 className="text-lg text-[#ff00ff]">Integrations</h3>
              <p className="text-sm text-[#64748b]">Connect external services</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/threat-intel')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#ff00ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#ff00ff]/40 transition-all text-[#ff00ff]"
            >
              Threat Intelligence Feed
            </button>
            <button
              type="button"
              onClick={() => navigate('/endpoints')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#ff00ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#ff00ff]/40 transition-all text-[#ff00ff]"
            >
              Device Ingest Pipeline
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/30">
              <Key className="w-6 h-6 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="text-lg text-[#00ff88]">API Keys</h3>
              <p className="text-sm text-[#64748b]">Device key prefixes (raw keys shown once)</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowKeys((v) => !v)}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00ff88]/40 transition-all text-[#00ff88]"
            >
              {showKeys ? 'Hide API Key Prefixes' : 'View API Key Prefixes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/endpoints')}
              className="w-full text-left px-4 py-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00ff88]/40 transition-all text-[#00ff88]"
            >
              Generate New Device Key
            </button>
          </div>
          {showKeys ? (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {devices.length === 0 ? (
                <p className="text-xs text-[#64748b]">No devices registered</p>
              ) : (
                devices.map((d) => (
                  <div key={d.id} className="px-3 py-2 rounded border border-[#00ff88]/20 text-xs text-[#00ff88] font-mono">
                    {d.name}: {d.apiKeyPrefix}…
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/30">
            <SettingsIcon className="w-6 h-6 text-[#00f0ff]" />
          </div>
          <div>
            <h3 className="text-lg text-[#00f0ff]">System Preferences</h3>
            <p className="text-sm text-[#64748b]">Saved locally in this browser</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div>
              <p className="text-[#00f0ff] mb-1">Auto-refresh Dashboard</p>
              <p className="text-xs text-[#64748b]">
                Automatically update data every {prefs.refreshIntervalSec} seconds
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.autoRefresh}
                onChange={(e) => updatePref('autoRefresh', e.target.checked)}
              />
              <div className="w-11 h-6 bg-[#1a2942] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#00f0ff] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div>
              <p className="text-[#00f0ff] mb-1">Sound Notifications</p>
              <p className="text-xs text-[#64748b]">Play sound on critical alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prefs.soundNotifications}
                onChange={(e) => updatePref('soundNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-[#1a2942] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#00f0ff] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30"></div>
            </label>
          </div>

          <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#00f0ff] mb-1">Refresh Interval</p>
                <p className="text-xs text-[#64748b]">Polling cadence when auto-refresh is on</p>
              </div>
              <span className="text-sm text-[#00f0ff]">{prefs.refreshIntervalSec}s</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={prefs.refreshIntervalSec}
              onChange={(e) => updatePref('refreshIntervalSec', Number(e.target.value))}
              className="w-full accent-[#00f0ff]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
