import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 rounded-2xl bg-[#FEF7E0] text-[#E07A5F] border border-[#EAE3D2] mb-1">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="font-serif-legal text-2xl font-bold text-[#2D1C13]">Welcome back to Lexora AI</h2>
            <p className="text-xs text-[#70665F]">Log in to manage your legal vault, contracts & AI assistant</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-[#EAE3D2] p-6 rounded-2xl space-y-4 shadow-sm">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D1C13]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D1C13]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials Bar */}
            <div className="pt-4 border-t border-[#EAE3D2] space-y-2">
              <p className="text-[11px] font-bold text-[#70665F] text-center uppercase tracking-wider">Quick 1-Click Demo Logins:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user@lexora.ai', 'LexoraPass123!')}
                  className="py-2 px-3 bg-[#FEF7E0] hover:bg-[#FBEFC5] border border-[#EAE3D2] rounded-xl text-xs font-bold text-[#B06000] flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo User</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@lexora.ai', 'LexoraPass123!')}
                  className="py-2 px-3 bg-[#2D1C13] hover:bg-[#1A110B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

          </form>

          <p className="text-center text-xs text-[#70665F]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E07A5F] font-bold hover:underline">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
