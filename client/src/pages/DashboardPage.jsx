import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Upload, 
  Bot, 
  Users, 
  FileText, 
  FolderLock, 
  CalendarCheck, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeContracts: 0,
    signedContracts: 0,
    pendingDrafts: 0,
    storageDisplay: '0 MB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [docsData, convsData, consultsData, statsData] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getConversations().catch(() => []),
        api.getConsultations().catch(() => []),
        api.getStats().catch(() => null)
      ]);
      setDocuments(docsData || []);
      setConversations(convsData || []);
      setConsultations(consultsData || []);
      if (statsData) {
        setStats(statsData);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-7 max-w-7xl overflow-y-auto">
          
          {/* Welcome Banner */}
          <div className="bg-white border border-[#EAE3D2] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif-legal text-2xl font-bold text-[#2D1C13] flex items-center gap-2">
                Good evening, {user?.name || 'User'} <Sparkles className="w-5 h-5 text-[#E07A5F]" />
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                Manage your legal documents, digital vault, AI assistant, and advocate consultations.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FEF7E0] border border-[#EAE3D2] text-[#B06000] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B06000]" />
              <span>Role: {user?.role}</span>
            </div>
          </div>

          {/* DYNAMIC DATABASE METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="figma-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#70665F]">
                <span>Total Documents</span>
                <FileText className="w-4 h-4 text-[#E07A5F]" />
              </div>
              <div className="text-2xl font-bold text-[#2D1C13] font-serif-legal">
                {stats.totalDocuments}
              </div>
              <p className="text-[11px] text-[#137333] font-semibold">Live database count</p>
            </div>

            <div className="figma-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#70665F]">
                <span>Active Contracts</span>
                <CheckCircle2 className="w-4 h-4 text-[#137333]" />
              </div>
              <div className="text-2xl font-bold text-[#2D1C13] font-serif-legal">
                {stats.activeContracts}
              </div>
              <p className="text-[11px] text-[#B06000] font-semibold">{stats.signedContracts} signed & locked</p>
            </div>

            <div className="figma-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#70665F]">
                <span>Pending Drafts</span>
                <Clock className="w-4 h-4 text-[#B06000]" />
              </div>
              <div className="text-2xl font-bold text-[#2D1C13] font-serif-legal">
                {stats.pendingDrafts}
              </div>
              <p className="text-[11px] text-[#70665F]">In review or editing</p>
            </div>

            <div className="figma-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#70665F]">
                <span>Vault Storage</span>
                <HardDrive className="w-4 h-4 text-[#2D1C13]" />
              </div>
              <div className="text-2xl font-bold text-[#2D1C13] font-serif-legal">
                {stats.storageDisplay}
              </div>
              <p className="text-[11px] text-[#70665F]">Encrypted storage used</p>
            </div>

          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link
              to="/documents/new"
              className="bg-[#2D1C13] hover:bg-[#1A110B] text-white p-5 rounded-2xl flex flex-col justify-between h-32 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <FilePlus className="w-5 h-5 text-[#E07A5F]" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Generate Document</h3>
                <p className="text-[11px] text-slate-300">Guided AI Questionnaire</p>
              </div>
            </Link>

            <Link
              to="/vault"
              className="bg-white border border-[#EAE3D2] hover:border-[#E07A5F] p-5 rounded-2xl flex flex-col justify-between h-32 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <FolderLock className="w-5 h-5 text-[#E07A5F]" />
                <ArrowRight className="w-4 h-4 text-[#70665F] group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1C13]">Digital Vault</h3>
                <p className="text-[11px] text-[#70665F]">Encrypted Storage & RAG</p>
              </div>
            </Link>

            <Link
              to="/assistant"
              className="bg-white border border-[#EAE3D2] hover:border-[#E07A5F] p-5 rounded-2xl flex flex-col justify-between h-32 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Bot className="w-5 h-5 text-[#D97706]" />
                <ArrowRight className="w-4 h-4 text-[#70665F] group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1C13]">Legal Assistant</h3>
                <p className="text-[11px] text-[#70665F]">Dual Mode Legal QA</p>
              </div>
            </Link>

            <Link
              to="/lawyers"
              className="bg-white border border-[#EAE3D2] hover:border-[#E07A5F] p-5 rounded-2xl flex flex-col justify-between h-32 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-[#2D1C13]" />
                <ArrowRight className="w-4 h-4 text-[#70665F] group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1C13]">Marketplace</h3>
                <p className="text-[11px] text-[#70665F]">Verified Advocates</p>
              </div>
            </Link>

          </div>

          {/* RECENT DOCUMENTS TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-[#EAE3D2] p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#E07A5F]" />
                    <h2 className="font-serif-legal text-lg font-bold text-[#2D1C13]">Recent Documents</h2>
                  </div>
                  <Link to="/vault" className="text-xs font-bold text-[#E07A5F] hover:underline flex items-center gap-1">
                    View Vault <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loading ? (
                  <p className="text-xs text-[#70665F] py-4">Loading documents...</p>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-[#70665F]">Your Digital Vault is empty. Generate or upload your first contract.</p>
                    <div className="flex items-center justify-center gap-3">
                      <Link to="/documents/new" className="px-4 py-2 rounded-xl bg-[#E07A5F] text-white text-xs font-semibold">Create Document</Link>
                      <Link to="/vault" className="px-4 py-2 rounded-xl bg-[#F4F1EA] text-[#2D1C13] border border-[#EAE3D2] text-xs font-semibold">Upload File</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-[#E07A5F] flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] flex items-center justify-center font-bold text-xs">
                            {doc.fileType || 'DOC'}
                          </div>
                          <div>
                            <Link to={`/documents/${doc.id}`} className="text-xs font-bold text-[#2D1C13] hover:text-[#E07A5F] transition-colors">
                              {doc.title}
                            </Link>
                            <div className="flex items-center gap-3 text-[11px] text-[#70665F] mt-0.5">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>v{doc.currentVersion}</span>
                              <span>•</span>
                              <span>{new Date(doc.updatedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                            doc.status === 'SIGNED' ? 'bg-[#E6F4EA] text-[#137333] border-[#EAE3D2]' : 'bg-[#FEF7E0] text-[#B06000] border-[#EAE3D2]'
                          }`}>
                            {doc.status}
                          </span>
                          <button
                            onClick={() => navigate(`/assistant?documentId=${doc.id}`)}
                            className="p-1.5 rounded-lg bg-white border border-[#EAE3D2] hover:bg-[#E07A5F] text-[#70665F] hover:text-white transition-colors"
                            title="Ask AI Assistant about this document"
                          >
                            <Bot className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: AI Chats & Consultations */}
            <div className="space-y-6">
              
              {/* Recent AI Conversations */}
              <div className="bg-white border border-[#EAE3D2] p-5 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#D97706]" />
                    <h3 className="font-serif-legal text-base font-bold text-[#2D1C13]">Recent AI Chats</h3>
                  </div>
                  <Link to="/assistant" className="text-[11px] font-bold text-[#E07A5F] hover:underline">
                    Open Assistant
                  </Link>
                </div>

                {conversations.length === 0 ? (
                  <p className="text-xs text-[#70665F] py-3">No recent AI conversations. Ask Lexora a legal question.</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.slice(0, 3).map((conv) => (
                      <Link
                        key={conv.id}
                        to="/assistant"
                        className="block p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F1EA] border border-[#EAE3D2] transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#2D1C13]">
                          <span className="truncate max-w-[160px]">{conv.title}</span>
                          <span className="text-[10px] font-semibold text-[#70665F]">{conv.contextMode}</span>
                        </div>
                        <p className="text-[11px] text-[#70665F] truncate mt-1">
                          {conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'Click to continue conversation...'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Status */}
              <div className="bg-white border border-[#EAE3D2] p-5 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#2D1C13]" />
                    <h3 className="font-serif-legal text-base font-bold text-[#2D1C13]">Consultations</h3>
                  </div>
                  <Link to="/consultations" className="text-[11px] font-bold text-[#E07A5F] hover:underline">
                    Manage
                  </Link>
                </div>

                {consultations.length === 0 ? (
                  <p className="text-xs text-[#70665F] py-3">No active consultation requests.</p>
                ) : (
                  <div className="space-y-2">
                    {consultations.slice(0, 2).map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#2D1C13]">
                          <span>{c.lawyer?.name || 'Advocate Consultation'}</span>
                          <span className="text-[10px] text-[#B06000] font-bold">{c.status}</span>
                        </div>
                        <div className="text-[11px] text-[#70665F] flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-[#70665F]" />
                          <span>{c.date} at {c.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          <LegalDisclaimer compact />

        </main>
      </div>
    </div>
  );
};
