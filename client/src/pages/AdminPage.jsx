import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Ban, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Search 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const u = await api.getAdminUsers();
        setUsers(u || []);
      } else if (activeTab === 'lawyers') {
        const l = await api.getAdminLawyers();
        setLawyers(l || []);
      } else if (activeTab === 'logs') {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs || []);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(userId, nextStatus);
      fetchAdminData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleLawyerVerify = async (lawyerId, currentVerify) => {
    try {
      await api.verifyLawyer(lawyerId, !currentVerify);
      fetchAdminData();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
            <div>
              <h1 className="font-serif-legal text-2xl font-bold text-[#2D1C13] flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-[#E07A5F]" />
                Lexora AI Admin Console
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                System administration, user account controls, lawyer verification, and security audit logs.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 border-b border-[#EAE3D2] pb-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'users' ? 'bg-[#2D1C13] text-white shadow-sm' : 'bg-white border border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('lawyers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'lawyers' ? 'bg-[#2D1C13] text-white shadow-sm' : 'bg-white border border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#E07A5F]" />
              <span>Lawyer Verifications ({lawyers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'logs' ? 'bg-[#2D1C13] text-white shadow-sm' : 'bg-white border border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Security Audit Logs</span>
            </button>
          </div>

          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#70665F] font-bold border-b border-[#EAE3D2]">
                  <tr>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D2]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-4 font-bold text-[#2D1C13]">{u.name}</td>
                      <td className="p-4 text-[#70665F]">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FAF8F5] text-[#2D1C13] border border-[#EAE3D2]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          u.status === 'ACTIVE' ? 'bg-[#E6F4EA] text-[#137333] border-[#EAE3D2]' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            u.status === 'ACTIVE' ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' : 'bg-[#E6F4EA] border border-[#EAE3D2] text-[#137333] hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: LAWYERS */}
          {activeTab === 'lawyers' && (
            <div className="bg-white border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#70665F] font-bold border-b border-[#EAE3D2]">
                  <tr>
                    <th className="p-4">Practitioner Name</th>
                    <th className="p-4">Specialization</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Toggle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D2]">
                  {lawyers.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-4 font-bold text-[#2D1C13]">{l.name}</td>
                      <td className="p-4 text-[#E07A5F] font-bold">{l.specialization}</td>
                      <td className="p-4 text-[#70665F]">{l.location}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          l.isVerified ? 'bg-[#E6F4EA] text-[#137333] border-[#EAE3D2]' : 'bg-[#FEF7E0] text-[#B06000] border-[#EAE3D2]'
                        }`}>
                          {l.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleLawyerVerify(l.id, l.isVerified)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold"
                        >
                          {l.isVerified ? 'Revoke Verification' : 'Approve Verification'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#70665F] font-bold border-b border-[#EAE3D2]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D2]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-4 text-[#70665F] font-mono">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                      <td className="p-4 text-[#2D1C13] font-bold">{log.user?.name || log.userId || 'System'}</td>
                      <td className="p-4 font-bold text-[#E07A5F]">{log.action}</td>
                      <td className="p-4 text-[#70665F]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
