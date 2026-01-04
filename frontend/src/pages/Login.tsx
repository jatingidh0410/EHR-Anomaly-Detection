import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const user: any = authService.login(username, password);  // ✅ Add type
    login(user);
    navigate('/dashboard');
  } catch (err: any) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-cyan-300" />
              <h1 className="text-3xl font-bold text-white">EHR Guard</h1>
            </div>
            <p className="text-navy-200">Network Anomaly Detection System</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6 flex gap-2">
              <AlertCircle className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or analyst"
                className="w-full bg-navy-800/50 border border-navy-600 rounded-lg px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:border-copper-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-navy-800/50 border border-navy-600 rounded-lg px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:border-copper-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-navy-800/50 rounded-lg border border-navy-600">
            <p className="text-xs text-navy-300 font-semibold mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-navy-400">
              <p><span className="text-navy-300">Admin:</span> admin / admin123</p>
              <p><span className="text-navy-300">Analyst:</span> analyst / analyst123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
