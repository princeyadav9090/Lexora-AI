import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Bot, 
  Download, 
  Edit3, 
  CheckCircle2, 
  History, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';

export const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetchDocumentDetail();
  }, [id]);

  const fetchDocumentDetail = async () => {
    try {
      const doc = await api.getDocumentDetail(id);
      setDocument(doc);
      if (doc.versions && doc.versions.length > 0) {
        setEditContent(doc.versions[0].content);
      }
    } catch (err) {
      setError(err.message || 'Failed to load document details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.updateDocument(id, editContent, document.title, 'User Manual Content Edit');
      await fetchDocumentDetail();
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to save document edit');
    } finally {
      setSaving(false);
    }
  };

  const handleSignDocument = async () => {
    if (!window.confirm('Are you sure you want to sign and lock this document version? Signed documents become read-only.')) return;
    try {
      await api.signDocument(id);
      await fetchDocumentDetail();
    } catch (err) {
      alert(err.message || 'Signing failed');
    }
  };

  const handleDownloadTxt = () => {
    const activeContent = document?.versions?.[0]?.content || '';
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document?.title || 'Document'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-[#70665F]">
          Loading legal document...
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h2 className="font-serif-legal text-lg font-bold text-red-800">Document Not Found</h2>
            <p className="text-xs text-red-600">{error || 'The requested document does not exist or access is forbidden.'}</p>
            <Link to="/vault" className="inline-block px-4 py-2 bg-[#2D1C13] text-white text-xs font-semibold rounded-xl">
              Return to Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestVersion = document.versions?.[0] || {};

  return (
    <div className="min-h-screen bg-[#FAF8F5] print:bg-white text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="flex-1 flex">
        <div className="print:hidden">
          <Sidebar />
        </div>

        <main className="flex-1 p-6 print:p-0 space-y-6 print:space-y-0 max-w-6xl print:max-w-none overflow-y-auto print:overflow-visible">
          
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE3D2] pb-4 print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/vault')}
                className="p-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-legal text-xl font-bold text-[#2D1C13]">{document.title}</h1>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded border ${
                    document.status === 'SIGNED' ? 'bg-[#E6F4EA] text-[#137333] border-[#EAE3D2]' : 'bg-[#FEF7E0] text-[#B06000] border-[#EAE3D2]'
                  }`}>
                    {document.status}
                  </span>
                </div>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Type: {document.type} • Version: v{document.currentVersion} • Created: {new Date(document.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* ASK LEXORA BUTTON */}
              <Link
                to={`/assistant?documentId=${document.id}`}
                className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Lexora AI</span>
              </Link>

              {document.status !== 'SIGNED' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Draft'}</span>
                </button>
              )}

              {document.status !== 'SIGNED' && (
                <button
                  onClick={handleSignDocument}
                  className="px-3.5 py-2 rounded-xl bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign & Lock</span>
                </button>
              )}

              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => setShowVersions(!showVersions)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Versions ({document.versions?.length || 1})</span>
              </button>
            </div>
          </div>

          {/* MAIN PREVIEW AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
            
            <div className="lg:col-span-3 space-y-4 print:space-y-0">
              
              {isEditing ? (
                <div className="bg-white border border-[#EAE3D2] p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D1C13]">Editing Document Content (v{document.currentVersion + 1} Draft)</span>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-4 py-1.5 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold"
                    >
                      {saving ? 'Saving...' : 'Save New Version'}
                    </button>
                  </div>
                  <textarea
                    rows={22}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              ) : (
                /* Page-like Reading Experience */
                <div className="bg-white border border-[#EAE3D2] print:border-none rounded-2xl print:rounded-none p-8 print:p-0 shadow-sm print:shadow-none space-y-4 print:space-y-0 min-h-[600px] print:min-h-0">
                  <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3 text-xs text-[#70665F] print:hidden">
                    <span>Lexora AI Verified Legal Preview</span>
                    <span>Version v{latestVersion.version || 1} • Jurisdiction: {document.jurisdiction || 'IN'}</span>
                  </div>

                  <div className="prose prose-sm max-w-none text-[#2D1C13] leading-relaxed font-sans print:prose-base print:text-black">
                    <ReactMarkdown>{latestVersion.content || ''}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="print:hidden">
                <LegalDisclaimer compact />
              </div>
            </div>

            {/* Sidebar Details / Versions */}
            <div className="space-y-4 print:hidden">
              
              <div className="bg-white border border-[#EAE3D2] p-4 rounded-2xl space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Document Specs</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Type:</span>
                    <span className="text-[#2D1C13] font-bold">{document.type}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Status:</span>
                    <span className="text-[#E07A5F] font-bold">{document.status}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Version:</span>
                    <span className="text-[#2D1C13] font-bold">v{document.currentVersion}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>File Format:</span>
                    <span className="text-[#2D1C13] font-bold">{document.fileType || 'TXT'}</span>
                  </div>
                </div>
              </div>

              {/* Version Drawer */}
              {showVersions && (
                <div className="bg-white border border-[#EAE3D2] p-4 rounded-2xl space-y-3 shadow-sm">
                  <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Version History</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {document.versions?.map((v) => (
                      <div key={v.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#2D1C13]">
                          <span>Version v{v.version}</span>
                          <span className="text-[10px] text-[#70665F]">{new Date(v.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-[11px] text-[#70665F]">{v.changeLog || 'Draft version'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick AI Action Card */}
              <div className="bg-[#FEF7E0] border border-[#EAE3D2] rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#B06000] font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>Ground AI Q&A</span>
                </div>
                <p className="text-[11px] text-[#70665F] leading-snug">
                  Ask Lexora AI questions directly about this document's notice period, liabilities, or clauses.
                </p>
                <Link
                  to={`/assistant?documentId=${document.id}`}
                  className="block w-full text-center py-2 rounded-xl bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-semibold transition-all mt-2"
                >
                  Start Document Chat
                </Link>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
