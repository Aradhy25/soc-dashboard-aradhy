import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Network,
  Users,
  Monitor,
  Brain,
  Shield,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { apiGet } from '../lib/api';
import { loadPreferences } from '../lib/preferences';
import type { AlertItem, Paginated } from '../lib/types';
import { useSocLiveRefresh } from '../lib/use-soc-live-refresh';
import { useSocSocket } from '../lib/realtime';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Logs', path: '/logs', icon: FileText },
  { name: 'Network', path: '/network', icon: Network },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Endpoints', path: '/endpoints', icon: Monitor },
  { name: 'Threat Intel', path: '/threat-intel', icon: Brain },
  { name: 'Incidents', path: '/incidents', icon: Shield },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const socket = useSocSocket();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [openAlerts, setOpenAlerts] = useState<AlertItem[]>([]);
  const [healthOk, setHealthOk] = useState(true);

  const refreshNotifs = useCallback(() => {
    void (async () => {
      try {
        const page = await apiGet<Paginated<AlertItem>>('/alerts', {
          status: 'open',
          severity: 'critical',
          limit: 8,
        });
        setOpenAlerts(page.items);
      } catch {
        // keep previous notifications on transient failures
      }

      try {
        await apiGet<{ ok: boolean }>('/health');
        setHealthOk(true);
      } catch {
        setHealthOk(false);
      }
    })();
  }, []);

  useEffect(() => {
    refreshNotifs();
  }, [refreshNotifs]);

  useSocLiveRefresh(refreshNotifs);

  useEffect(() => {
    if (!socket) return;
    const onCritical = () => {
      const prefs = loadPreferences();
      if (!prefs.soundNotifications) return;
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.03;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        window.setTimeout(() => {
          osc.stop();
          void ctx.close();
        }, 180);
      } catch {
        // audio may be blocked by browser policy
      }
    };
    socket.on('alerts:new', onCritical);
    return () => {
      socket.off('alerts:new', onCritical);
    };
  }, [socket]);

  const criticalCount = openAlerts.length;
  const connected = Boolean(socket?.connected);

  const statusLabel = useMemo(() => {
    if (!healthOk) return 'API Degraded';
    if (!connected) return 'Realtime Offline';
    if (criticalCount > 0) return `${criticalCount} Critical Open`;
    return 'All Systems Operational';
  }, [connected, criticalCount, healthOk]);

  const statusColor = !healthOk || !connected ? 'text-[#ff0055]' : criticalCount > 0 ? 'text-[#ff00ff]' : 'text-[#00ff88]';
  const statusDot = !healthOk || !connected ? 'bg-[#ff0055]' : criticalCount > 0 ? 'bg-[#ff00ff]' : 'bg-[#00ff88]';
  const statusBorder = !healthOk || !connected ? 'border-[#ff0055]/30 bg-[#ff0055]/10' : criticalCount > 0 ? 'border-[#ff00ff]/30 bg-[#ff00ff]/10' : 'border-[#00ff88]/30 bg-[#00ff88]/10';

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/alerts?q=${encodeURIComponent(q)}`);
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000509] via-[#000913] to-[#0a1628]">
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00f0ff 1px, transparent 1px),
              linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a1628]/80 backdrop-blur-md border-b border-[#00f0ff]/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-[#00f0ff]" /> : <Menu className="w-5 h-5 text-[#00f0ff]" />}
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                    <Shield className="w-5 h-5 text-[#000913]" />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${statusDot}`} />
                </div>
                <div>
                  <h1 className="text-lg tracking-tight text-[#00f0ff]">SOC DASHBOARD</h1>
                  <p className="text-xs text-[#64748b]">Security Operations Center</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <form
                onSubmit={onSearch}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50"
              >
                <Search className="w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search alerts..."
                  className="bg-transparent border-none outline-none text-sm text-[#00f0ff] placeholder:text-[#64748b] w-48"
                />
              </form>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative p-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                  aria-label="Open notifications"
                >
                  <Bell className="w-5 h-5 text-[#00f0ff]" />
                  {criticalCount > 0 ? (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[#ff0055] rounded-full animate-pulse" />
                  ) : null}
                </button>

                {notifOpen ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628] shadow-[0_0_30px_rgba(0,0,0,0.45)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#00f0ff]/20 flex items-center justify-between">
                      <span className="text-sm text-[#00f0ff]">Critical Open Alerts</span>
                      <button
                        type="button"
                        className="text-xs text-[#64748b] hover:text-[#00f0ff]"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/alerts?status=open&severity=critical');
                        }}
                      >
                        View all
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {openAlerts.length === 0 ? (
                        <div className="p-4 text-sm text-[#64748b]">No critical open alerts</div>
                      ) : (
                        openAlerts.map((alert) => (
                          <button
                            key={alert.id}
                            type="button"
                            className="w-full text-left px-4 py-3 border-b border-[#00f0ff]/10 hover:bg-[#1a2942]/50 transition-colors"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate(`/alerts?id=${encodeURIComponent(alert.id)}`);
                            }}
                          >
                            <p className="text-sm text-[#00f0ff] mb-1">{alert.title}</p>
                            <p className="text-xs text-[#64748b]">{alert.affectedSystem ?? alert.device?.name ?? 'unknown'}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ff00ff] flex items-center justify-center text-xs text-[#000913] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                SA
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-[60px] left-0 bottom-0 z-30 bg-[#0a1628]/80 backdrop-blur-md border-r border-[#00f0ff]/20 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00f0ff]/20 to-transparent border border-[#00f0ff]/30 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-[#64748b] hover:text-[#00f0ff] hover:bg-[#1a2942]/50 border border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg border ${statusBorder}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusDot}`} />
            <span className={`text-xs ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      </aside>

      <main className={`pt-[60px] transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="p-4 md:p-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
