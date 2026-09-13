import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderLock, 
  Upload, 
  Search, 
  FileText, 
  Bot, 
  Trash2, 
  Download, 
  Plus, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';

export const LegalVaultPage = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchVaultDocuments();
  }, []);

  const fetchVaultDocuments = async () => {
    setLoading(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs || []);
    } catch (e) {
      console.error('Failed to load vault documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError('');

    try {
      await api.uploadVaultFile(uploadFile);
      setShowUploadModal(false);
      setUploadFile(null);
      await fetchVaultDocuments();
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from your Digital Vault?`)) return;
    try {
      await api.deleteDocument(id);
      await fetchVaultDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || doc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D2] pb-4">
            <div>
              <h1 className="font-serif-legal text-2xl font-bold text-[#2D1C13] flex items-center gap-2">
                <FolderLock className="w-6 h-6 text-[#E07A5F]" />
                Digital Vault Showcase
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                Securely store, manage, and run grounded AI analysis on all your legal contracts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/documents/new"
                className="px-4 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#E07A5F]" />
                <span>Create Document</span>
              </Link>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title or type..."
                className="w-full bg-white border border-[#EAE3D2] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#70665F] shrink-0" />
              {['ALL', 'NDA', 'RENTAL_AGREEMENT', 'EMPLOYMENT_CONTRACT', 'UPLOADED'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    selectedCategory === cat ? 'bg-[#2D1C13] text-white' : 'bg-white border border-[#EAE3D2] text-[#70665F] hover:text-[#2D1C13]'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

          </div>

          {/* Vault Table */}
          {loading ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F]">
              Loading Digital Vault documents...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center mx-auto border border-[#EAE3D2]">
                <FolderLock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13]">Your Digital Vault is Empty</h3>
                <p className="text-xs text-[#70665F] max-w-md mx-auto">
                  Upload your first PDF, DOCX, or TXT legal agreement, or generate a new structured legal contract with Lexora AI.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link to="/documents/new" className="px-4 py-2.5 rounded-xl bg-[#E07A5F] text-white text-xs font-semibold">
                  Create Document
                </Link>
                <button onClick={() => setShowUploadModal(true)} className="px-4 py-2.5 rounded-xl bg-[#2D1C13] text-white text-xs font-semibold">
                  Upload Document
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#70665F] font-bold border-b border-[#EAE3D2]">
                    <tr>
                      <th className="p-4">Document Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">Modified Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE3D2]">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#FAF8F5] transition-colors">
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] flex items-center justify-center font-bold text-xs">
                              {doc.fileType || 'DOC'}
                            </div>
                            <div>
                              <Link to={`/documents/${doc.id}`} className="font-bold text-[#2D1C13] hover:text-[#E07A5F] transition-colors">
                                {doc.title}
                              </Link>
                              <p className="text-[11px] text-[#70665F]">{doc.jurisdiction || 'IN'} Jurisdiction</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-[#2D1C13] font-semibold">
                          {doc.type}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                            doc.status === 'READY' ? 'bg-[#E6F4EA] text-[#137333] border-[#EAE3D2]' :
                            doc.status === 'SIGNED' ? 'bg-[#FEF7E0] text-[#B06000] border-[#EAE3D2]' :
                            'bg-[#FAF8F5] text-[#70665F] border-[#EAE3D2]'
                          }`}>
                            {doc.status}
                          </span>
                        </td>

                        <td className="p-4 text-[#2D1C13] font-bold">
                          v{doc.currentVersion}
                        </td>

                        <td className="p-4 text-[#70665F]">
                          {new Date(doc.updatedAt).toLocaleDateString('en-IN')}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/assistant?documentId=${doc.id}`)}
                            className="p-2 rounded-xl bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] hover:bg-[#FBEFC5] transition-colors"
                            title="Ask AI Assistant about this document"
                          >
                            <Bot className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/documents/${doc.id}`}
                            className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#2D1C13] hover:bg-[#F4F1EA] transition-colors inline-block"
                            title="View / Edit"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(doc.id, doc.title)}
                            className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <LegalDisclaimer compact />

        </main>
      </div>

      {/* UPLOAD FILE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D2] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
              <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#E07A5F]" />
                Upload Legal Document to Vault
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#70665F] hover:text-[#2D1C13]">✕</button>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              
              <div className="border-2 border-dashed border-[#EAE3D2] hover:border-[#E07A5F] rounded-2xl p-8 text-center space-y-2 bg-[#FAF8F5] cursor-pointer">
                <Upload className="w-8 h-8 text-[#70665F] mx-auto" />
                <p className="text-xs font-bold text-[#2D1C13]">
                  {uploadFile ? uploadFile.name : 'Click or Drag PDF, DOCX, or TXT file here'}
                </p>
                <p className="text-[11px] text-[#70665F]">Maximum file size: 15MB</p>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="vault-file-input"
                />
                <label htmlFor="vault-file-input" className="inline-block mt-2 px-4 py-2 rounded-xl bg-white border border-[#EAE3D2] text-xs font-bold text-[#E07A5F] cursor-pointer hover:bg-[#F4F1EA]">
                  Select File
                </label>
              </div>

              <div className="text-[11px] text-[#70665F] space-y-1">
                <p className="font-bold text-[#2D1C13]">Automated Ingestion Pipeline:</p>
                <p>1. Upload → 2. Validation → 3. Extraction → 4. Chunking → 5. Grounded RAG Indexing</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE3D2]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#2D1C13] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Processing & Indexing...' : 'Upload to Vault'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
