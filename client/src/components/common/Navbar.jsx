import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, LogOut, User as UserIcon, Shield, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = React.memo(() => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 figma-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#2D1C13] flex items-center justify-center text-[#E07A5F] shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-legal text-xl font-bold text-[#2D1C13] tracking-tight">
                Lexora <span className="text-[#E07A5F]">AI</span>
              </span>
              <span className="block text-[10px] text-[#70665F] font-semibold tracking-wider uppercase">
                Your Smart Legal Companion
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#2D1C13]">
            <Link to="/" className="hover:text-[#E07A5F] transition-colors">Home</Link>
            <Link to="/features" className="hover:text-[#E07A5F] transition-colors">Features</Link>
            <Link to="/assistant" className="hover:text-[#E07A5F] transition-colors">AI Assistant</Link>
            <Link to="/lawyers" className="hover:text-[#E07A5F] transition-colors">Marketplace</Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Go to Workspace</span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#F4F1EA] transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#E07A5F] text-white font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-[#2D1C13] hidden lg:inline max-w-[110px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#70665F] hidden lg:inline" />
                  </button>

                  <div className="absolute right-0 mt-2 w-52 py-2 bg-white border border-[#EAE3D2] rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2.5 border-b border-[#EAE3D2]">
                      <p className="text-xs font-bold text-[#2D1C13]">{user?.name}</p>
                      <p className="text-[11px] text-[#70665F] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] rounded">
                        Role: {user?.role}
                      </span>
                    </div>

                    <Link to="/dashboard" className="block px-4 py-2 text-xs text-[#2D1C13] hover:bg-[#F4F1EA]">
                      Dashboard
                    </Link>
                    <Link to="/vault" className="block px-4 py-2 text-xs text-[#2D1C13] hover:bg-[#F4F1EA]">
                      Digital Vault
                    </Link>
                    <Link to="/assistant" className="block px-4 py-2 text-xs text-[#2D1C13] hover:bg-[#F4F1EA]">
                      Legal Assistant
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-xs text-[#C85A32] font-bold hover:bg-[#F4F1EA]">
                        <Shield className="w-3.5 h-3.5 inline mr-1" />
                        Admin Console
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-[#F4F1EA] border-t border-[#EAE3D2] flex items-center gap-1.5 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#2D1C13] hover:text-[#E07A5F] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
