import { useState } from 'react';
import { mockUsers } from '../data/mock-data';
import { Modal } from '../components/modal';
import { Users as UsersIcon, Shield, AlertTriangle } from 'lucide-react';

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#00f0ff] mb-2">User Management</h1>
        <p className="text-sm text-[#64748b]">Monitor user activity and behavior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/20 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Total Users</p>
              <p className="text-3xl text-[#00f0ff]">{mockUsers.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-[#00f0ff]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#00ff88]/30 bg-gradient-to-br from-[#00ff88]/20 to-transparent shadow-[0_0_15px_rgba(0,255,136,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">Active Sessions</p>
              <p className="text-3xl text-[#00ff88]">42</p>
            </div>
            <Shield className="w-8 h-8 text-[#00ff88]" />
          </div>
        </div>

        <div className="p-6 rounded-lg border border-[#ff0055]/30 bg-gradient-to-br from-[#ff0055]/20 to-transparent shadow-[0_0_15px_rgba(255,0,85,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#64748b] uppercase mb-2">High Risk Users</p>
              <p className="text-3xl text-[#ff0055]">1</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#ff0055]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#00f0ff]/30 bg-gradient-to-br from-[#0a1628] to-[#000913] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#00f0ff]/20">
              <tr>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">ID</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Username</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Email</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Role</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Last Login</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Failed Attempts</th>
                <th className="text-left p-4 text-sm text-[#64748b] uppercase">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="border-b border-[#00f0ff]/10 hover:bg-[#0a1628]/80 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="text-[#00f0ff] font-mono text-sm">{user.id}</span>
                  </td>
                  <td className="p-4 text-[#00f0ff]">{user.username}</td>
                  <td className="p-4 text-[#64748b]">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-[#8b5cf6]/20 text-[#8b5cf6]">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748b] text-sm">
                    {new Date(user.lastLogin).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`${user.failedAttempts > 0 ? 'text-[#ff0055]' : 'text-[#00ff88]'}`}>
                      {user.failedAttempts}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#1a2942] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            user.riskScore > 50 ? 'bg-[#ff0055]' :
                            user.riskScore > 30 ? 'bg-[#ff00ff]' :
                            'bg-[#00ff88]'
                          }`}
                          style={{ width: `${user.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-sm ${
                        user.riskScore > 50 ? 'text-[#ff0055]' :
                        user.riskScore > 30 ? 'text-[#ff00ff]' :
                        'text-[#00ff88]'
                      }`}>
                        {user.riskScore}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={`User Details - ${selectedUser?.username}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">User ID</p>
                <p className="text-[#00f0ff]">{selectedUser.id}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Email</p>
                <p className="text-[#00f0ff]">{selectedUser.email}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Role</p>
                <p className="text-[#00f0ff]">{selectedUser.role}</p>
              </div>
              <div className="p-4 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                <p className="text-xs text-[#64748b] mb-1">Last Login</p>
                <p className="text-[#00f0ff]">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-[#64748b] mb-3">Associated Devices</h4>
              <div className="space-y-2">
                {selectedUser.devices.map((device, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/50">
                    <p className="text-[#00f0ff]">{device}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b] mb-1">Risk Score</p>
                  <p className="text-2xl text-[#ff0055]">{selectedUser.riskScore}%</p>
                </div>
                <Shield className="w-8 h-8 text-[#ff0055]" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
