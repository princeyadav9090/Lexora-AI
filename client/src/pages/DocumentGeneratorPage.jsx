import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Home, 
  Briefcase, 
  PenTool, 
  GraduationCap
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

const ICON_MAP = {
  NDA: Building2,
  RENTAL_AGREEMENT: Home,
  EMPLOYMENT_CONTRACT: Briefcase,
  FREELANCE_AGREEMENT: PenTool,
  INTERNSHIP_AGREEMENT: GraduationCap
};

export const DocumentGeneratorPage = () => {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const tmpls = await api.getTemplates();
        setTemplates(tmpls);
      } catch (e) {
        console.error('Failed to load templates:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleSelectType = (tmpl) => {
    setSelectedType(tmpl);
    setAnswers({});
    setDocTitle(`${tmpl.name}`);
    setStep(2);
  };

  const handleInputChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setStep(3);

    try {
      const result = await api.generateDocument(selectedType.id, docTitle, answers);
      navigate(`/documents/${result.document.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate legal document draft.');
      setStep(2);
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
                Guided AI Legal Document Generator
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                Generate compliant, structured draft legal agreements tailored for Indian jurisdiction.
              </p>
            </div>
            
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Template
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE DOCUMENT TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Select Legal Document Category</h2>
                <span className="text-xs font-bold text-[#2D1C13]">Jurisdiction: 🇮🇳 India (IN)</span>
              </div>

              {loading ? (
                <p className="text-xs text-[#70665F]">Loading document templates...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((tmpl) => {
                    const IconComp = ICON_MAP[tmpl.id] || FileText;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => handleSelectType(tmpl)}
                        className="figma-card figma-card-hover p-6 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-xl bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center border border-[#EAE3D2] group-hover:bg-[#E07A5F] group-hover:text-white transition-all">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#2D1C13] border border-[#EAE3D2]">
                            {tmpl.category}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13] group-hover:text-[#E07A5F] transition-colors">
                            {tmpl.name}
                          </h3>
                          <p className="text-xs text-[#70665F] leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#E07A5F] group-hover:translate-x-1 transition-transform">
                          <span>Start Questionnaire ({tmpl.questions.length} questions)</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: GUIDED QUESTIONNAIRE */}
          {step === 2 && selectedType && (
            <form onSubmit={handleGenerate} className="bg-white border border-[#EAE3D2] p-6 rounded-2xl space-y-6 shadow-sm">
              
              <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
                <div>
                  <h2 className="font-serif-legal text-xl font-bold text-[#2D1C13]">{selectedType.name}</h2>
                  <p className="text-xs text-[#70665F]">Answer simple human-language questions to assemble approved Indian legal clauses.</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] rounded-lg">
                  {selectedType.id}
                </span>
              </div>

              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D1C13]">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-4 py-2.5 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              {/* Questions Loop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedType.questions.map((q) => {
                  if (q.condition) {
                    const parentVal = answers[q.condition.field];
                    if (parentVal !== q.condition.value) return null;
                  }

                  return (
                    <div key={q.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2D1C13]">
                        {q.label} {q.required && <span className="text-[#E07A5F]">*</span>}
                      </label>

                      {q.type === 'select' ? (
                        <select
                          required={q.required}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                        >
                          <option value="">Select option...</option>
                          {q.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={q.type}
                          required={q.required}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          placeholder={q.placeholder || ''}
                          className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-3.5 py-2.5 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#EAE3D2] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#70665F]">
                  <ShieldCheck className="w-4 h-4 text-[#E07A5F]" />
                  <span>Approved Indian Legal Clauses & Schema Validation</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Legal Draft</span>
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: GENERATING LOADING STATE */}
          {step === 3 && (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center mx-auto animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif-legal text-xl font-bold text-[#2D1C13]">Generating Legal Contract Draft...</h3>
              <p className="text-xs text-[#70665F] max-w-sm mx-auto">
                Assembling approved clauses, applying Indian legal standards, and indexing document for grounded AI Q&A.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
