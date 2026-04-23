import { Settings as SettingsIcon, Users, Bell, Key, Zap } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">Settings</h1>
        <p className="text-sm text-[#64748b]">Configure system preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/30">
              <Users className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <h3 className="text-lg text-[#00f0ff]">User Management</h3>
              <p className="text-sm text-[#64748b]">Manage users and permissions</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all text-[#00f0ff]">
              Manage Roles
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00f0ff]/40 transition-all text-[#00f0ff]">
              Set Permissions
            </button>
          </div>
        </div>

        {/* Alert Configuration */}
        <div className="p-6 rounded-lg border border-[#8b5cf6]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30">
              <Bell className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-lg text-[#8b5cf6]">Alert Configuration</h3>
              <p className="text-sm text-[#64748b]">Configure alert rules and thresholds</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#8b5cf6]/40 transition-all text-[#8b5cf6]">
              Alert Rules
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#8b5cf6]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#8b5cf6]/40 transition-all text-[#8b5cf6]">
              Email/SMS Notifications
            </button>
          </div>
        </div>

        {/* Integrations */}
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
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#ff00ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#ff00ff]/40 transition-all text-[#ff00ff]">
              SIEM Integration
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#ff00ff]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#ff00ff]/40 transition-all text-[#ff00ff]">
              Threat Intelligence APIs
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/30">
              <Key className="w-6 h-6 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="text-lg text-[#00ff88]">API Keys</h3>
              <p className="text-sm text-[#64748b]">Manage API authentication</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00ff88]/40 transition-all text-[#00ff88]">
              View API Keys
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[#00ff88]/20 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:border-[#00ff88]/40 transition-all text-[#00ff88]">
              Generate New Key
            </button>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/30">
            <SettingsIcon className="w-6 h-6 text-[#00f0ff]" />
          </div>
          <div>
            <h3 className="text-lg text-[#00f0ff]">System Preferences</h3>
            <p className="text-sm text-[#64748b]">General system configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div>
              <p className="text-[#00f0ff] mb-1">Auto-refresh Dashboard</p>
              <p className="text-xs text-[#64748b]">Automatically update data every 30 seconds</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#1a2942] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#00f0ff] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div>
              <p className="text-[#00f0ff] mb-1">Sound Notifications</p>
              <p className="text-xs text-[#64748b]">Play sound on critical alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#1a2942] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#00f0ff] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
            <div>
              <p className="text-[#00f0ff] mb-1">Dark Mode</p>
              <p className="text-xs text-[#64748b]">Use dark theme (currently active)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#1a2942] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#00f0ff] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
