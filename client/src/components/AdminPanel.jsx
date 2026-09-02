import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, RotateCcw, LogOut } from 'lucide-react';
import { getAgents, updateAgentStatus } from '../api/agents';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-300',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Rejected: 'bg-red-50 text-red-700 border-red-300',
};

export const AdminPanel = ({ isOpen, onClose, onLogout }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const loadAgents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (e) {
      setLoadError(e.message || 'Failed to load agents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadAgents();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = async (agentId, status) => {
    setActioningId(agentId);
    try {
      const updated = await updateAgentStatus(agentId, status);
      setAgents(prev => prev.map(a => (a.id === agentId ? updated : a)));
    } catch (e) {
      alert(e.message || 'Failed to update agent status.');
    } finally {
      setActioningId(null);
    }
  };

  const pendingCount = agents.filter(a => a.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="admin-panel-modal" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden my-auto">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel — Agent Approvals</h2>
              <p className="text-xs text-slate-400">
                {pendingCount} pending registration{pendingCount === 1 ? '' : 's'} awaiting review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-all">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-amber-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-semibold">Loading agent registrations…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-sm text-slate-500 max-w-md">{loadError}</p>
              <button onClick={loadAgents} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-slate-500">No agent registrations yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Full Name</th>
                    <th className="p-2.5">CNIC / ID</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5">City</th>
                    <th className="p-2.5">License</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-semibold text-slate-900">{agent.fullName}</td>
                      <td className="p-2.5 font-mono text-slate-700">{agent.cnicNumber}</td>
                      <td className="p-2.5 font-mono text-slate-700">{agent.contactPhone}</td>
                      <td className="p-2.5 text-slate-700">{agent.agencyName}</td>
                      <td className="p-2.5 text-slate-700">{agent.operatingCity}</td>
                      <td className="p-2.5 text-slate-700">{agent.licenseCredentials}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${STATUS_STYLES[agent.status]}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(agent.id, 'Approved')}
                            disabled={agent.status === 'Approved' || actioningId === agent.id}
                            title="Approve"
                            className={`p-1.5 rounded-lg transition-all ${agent.status === 'Approved' ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(agent.id, 'Rejected')}
                            disabled={agent.status === 'Rejected' || actioningId === agent.id}
                            title="Reject"
                            className={`p-1.5 rounded-lg transition-all ${agent.status === 'Rejected' ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50 cursor-pointer'}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
