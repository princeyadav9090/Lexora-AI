import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  Bot, 
  Users, 
  CalendarCheck, 
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Generate Document', path: '/documents/generate', icon: FileText, badge: 'AI' },
    { label: 'Legal Assistant', path: '/assistant', icon: Bot, highlight: true },
    { label: 'Digital Vault', path: '/vault', icon: FolderLock },
    { label: 'Marketplace', path: '/lawyers', icon: Users },
    { label: 'Consultations', path: '/consultations', icon: CalendarCheck }
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Console', path: '/admin', icon: ShieldAlert, admin: true });
  }

  return (
    <aside className="w-64 figma-sidebar flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      
      <div className="p-4 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[10px] font-bold text-[#70665F] uppercase tracking-widest">
          Main Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative
                ${isActive 
                  ? 'bg-[#2D1C13] text-white shadow-sm' 
                  : item.highlight 
                    ? 'text-[#C85A32] hover:bg-[#EAE3D2]/60' 
                    : 'text-[#2D1C13] hover:bg-[#EAE3D2]/60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  item.highlight ? 'bg-[#FEF7E0] text-[#D97706]' : 'bg-white border border-[#EAE3D2] text-[#2D1C13]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Sidebar Footer Widget */}
      <div className="p-4 border-t border-[#EAE3D2]">
        <div className="bg-white border border-[#EAE3D2] rounded-2xl p-4 text-xs text-[#2D1C13] space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[#E07A5F] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </div>
          <p className="text-[11px] text-[#70665F] leading-snug">
            Get instant answers on property disputes, lease terms, or contract clauses.
          </p>
          <NavLink
            to="/assistant"
            className="flex items-center justify-between text-[11px] font-bold text-[#E07A5F] hover:text-[#C85A32] pt-1"
          >
            <span>Open Assistant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

    </aside>
  );
};
