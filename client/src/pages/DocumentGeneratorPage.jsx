import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  AlertCircle,
  Building2,
  Home,
  Briefcase,
  Globe2,
  Scale
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  { id: 'nda', icon: Building2, label: 'Non-Disclosure Agreement', prompt: 'Draft a standard Non-Disclosure Agreement (NDA) for sharing proprietary business plans with a potential investor. Include standard confidentiality, non-compete, and severability clauses.' },
  { id: 'rental', icon: Home, label: 'Residential Lease', prompt: 'Draft a residential rental agreement for an apartment. The lease should be for 11 months, with a standard security deposit and a 1-month notice period for termination.' },
  { id: 'employment', icon: Briefcase, label: 'Employment Contract', prompt: 'Draft a full-time employment contract for a Senior Software Engineer. Include clauses for a 3-month probation period, IP assignment to the company, and a 60-day notice period.' },
  { id: 'freelance', icon: Globe2, label: 'Freelance Agreement', prompt: 'Draft a freelance service agreement for web development services. Payment is 50% upfront and 50% on completion. IP transfers to the client only after full payment.' }
];

export const DocumentGeneratorPage = () => {
  const navigate = useNavigate();
  
  const [docTitle, setDocTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India (IN)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt.prompt);
    if (!docTitle) {
      setDocTitle(quickPrompt.label);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !prompt.trim()) {
      setError('Please provide both a document title and a description of your requirements.');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      // The API endpoint now expects title, prompt, and jurisdiction
      const payload = {
        title: docTitle,
        prompt: prompt,
        jurisdiction: jurisdiction
      };

      const result = await api.generateDocument(payload);
      const docId = result?.data?.document?.id || result?.document?.id || result?.id;
      
      if (docId) {
        navigate(`/documents/${docId}`);
      } else {
        throw new Error('Document was generated, but document ID was not returned.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate legal document draft.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-5xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
            <div>
              <h1 className="font-serif-legal text-2xl font-bold text-[#2D1C13] flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#E07A5F]" />
                Document AI
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                Describe the legal document you need, and our AI will draft it instantly.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isGenerating ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Prompt Area */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleGenerate} className="bg-white border border-[#EAE3D2] p-6 rounded-2xl space-y-6 shadow-sm">
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2D1C13]">Document Title</label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="e.g. Acme Corp NDA"
                        className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-4 py-2.5 text-xs text-[#2D1C13] placeholder-[#A0968F] focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D1C13]">Governing Jurisdiction</label>
                        <select
                          value={jurisdiction}
                          onChange={(e) => setJurisdiction(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-4 py-2.5 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all"
                        >
                          <option value="India (IN)">India (Central)</option>
                          <option value="Maharashtra, India">Maharashtra, India</option>
                          <option value="Karnataka, India">Karnataka, India</option>
                          <option value="Delhi, India">Delhi, India</option>
                          <option value="USA">United States (USA)</option>
                          <option value="UK">United Kingdom (UK)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2D1C13]">Document Requirements</label>
                      <textarea
                        required
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the document you want to draft. Include specific names, dates, amounts, and any special clauses you need..."
                        rows={8}
                        className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-4 py-3 text-sm text-[#2D1C13] placeholder-[#A0968F] focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all resize-y"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EAE3D2] flex justify-end">
                    <button
                      type="submit"
                      disabled={!prompt.trim() || !docTitle.trim()}
                      className="px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm flex items-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Draft</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Start Suggestions */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Quick Prompts</h3>
                <div className="flex flex-col gap-3">
                  {QUICK_PROMPTS.map((qp) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={qp.id}
                        type="button"
                        onClick={() => handleQuickPrompt(qp)}
                        className="text-left bg-white border border-[#EAE3D2] p-4 rounded-xl hover:border-[#E07A5F] hover:shadow-md transition-all group flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center shrink-0 group-hover:bg-[#E07A5F] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#2D1C13] group-hover:text-[#E07A5F] transition-colors">{qp.label}</h4>
                          <p className="text-[10px] text-[#70665F] mt-1 line-clamp-2 leading-relaxed">
                            {qp.prompt}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="bg-[#FEF7E0] border border-[#EAE3D2] p-4 rounded-xl mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-[#B06000]" />
                    <h4 className="text-xs font-bold text-[#B06000]">Legal Disclaimer</h4>
                  </div>
                  <p className="text-[10px] text-[#B06000]/80 leading-relaxed">
                    Documents generated by Lexora AI are drafts and should be reviewed by a qualified legal professional before execution.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* GENERATING STATE */
            <div className="bg-white border border-[#EAE3D2] p-16 rounded-2xl text-center space-y-6 shadow-sm max-w-2xl mx-auto mt-12">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-[#F4F1EA] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#E07A5F] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#E07A5F]">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-legal text-2xl font-bold text-[#2D1C13] mb-2">Drafting your document...</h3>
                <p className="text-sm text-[#70665F] max-w-sm mx-auto leading-relaxed">
                  Our Senior Advocate AI is structuring the clauses and verifying jurisdiction compliance. This usually takes about 10-15 seconds.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
