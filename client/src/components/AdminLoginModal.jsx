import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    // NOTE: hardcoded demo credentials only — replace with real auth before production use.
    if (userId === 'admin' && password === 'admin') {
      setError(null);
      setUserId('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Invalid User ID or Password.');
    }
  };

  const handleClose = () => {
    setUserId('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div id="admin-login-modal" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">

        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Login</h2>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-all">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">User ID</label>
            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="admin" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" autoFocus />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
          </div>

          <button type="submit" className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all cursor-pointer">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
