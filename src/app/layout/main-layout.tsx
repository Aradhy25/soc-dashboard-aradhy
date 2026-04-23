import { Outlet, NavLink } from 'react-router';
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
  X
} from 'lucide-react';
import { useState } from 'react';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000509] via-[#000913] to-[#0a1628]">
      {/* Animated background grid */}
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

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a1628]/80 backdrop-blur-md border-b border-[#00f0ff]/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-[#00f0ff]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#00f0ff]" />
                )}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                    <Shield className="w-5 h-5 text-[#000913]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
                </div>
                <div>
                  <h1 className="text-lg tracking-tight text-[#00f0ff]">SOC DASHBOARD</h1>
                  <p className="text-xs text-[#64748b]">Security Operations Center</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50">
                <Search className="w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-[#00f0ff] placeholder:text-[#64748b] w-48"
                />
              </div>
              
              <button className="relative p-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                <Bell className="w-5 h-5 text-[#00f0ff]" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#ff0055] rounded-full animate-pulse" />
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ff00ff] flex items-center justify-center text-xs text-[#000913] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                SA
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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

        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
            <span className="text-xs text-[#00ff88]">All Systems Operational</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-[60px] transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-0'
        }`}
      >
        <div className="p-4 md:p-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
