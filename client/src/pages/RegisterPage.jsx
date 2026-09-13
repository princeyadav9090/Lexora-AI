import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
            <h2 className="font-serif-legal text-2xl font-bold text-[#2D1C13]">Create your Lexora AI Account</h2>
            <p className="text-xs text-[#70665F]">Join individuals & freelancers managing legal work with AI</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-[#EAE3D2] p-6 rounded-2xl space-y-4 shadow-sm">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D1C13]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D1C13]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
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
                  placeholder="At least 8 characters"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D1C13]">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'USER'
                      ? 'bg-[#2D1C13] text-white border-[#2D1C13]'
                      : 'bg-[#FAF8F5] border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
                  }`}
                >
                  Client / User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('LAWYER')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'LAWYER'
                      ? 'bg-[#E07A5F] text-white border-[#E07A5F]'
                      : 'bg-[#FAF8F5] border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
                  }`}
                >
                  Advocate
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Get Started Now'}
            </button>

            <div className="pt-2 text-[11px] text-[#70665F] text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Secured by AWS Cognito User Pools & JWT Token Isolation</span>
            </div>

          </form>

          <p className="text-center text-xs text-[#70665F]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E07A5F] font-bold hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
