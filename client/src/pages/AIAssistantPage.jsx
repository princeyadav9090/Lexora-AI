import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

export const AIAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const documentIdParam = searchParams.get('documentId');
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(documentIdParam || '');
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [clauseInput, setClauseInput] = useState('');
  const [clauseResult, setClauseResult] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, [documentIdParam]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadInitialData = async () => {
    try {
      const [docs, convs] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getConversations().catch(() => [])
      ]);
      setDocuments(docs || []);
      setConversations(convs || []);

      if (documentIdParam) {
        setSelectedDocId(documentIdParam);
        const existingDocConv = convs.find(c => c.documentId === documentIdParam);
        if (existingDocConv) {
          setActiveConvId(existingDocConv.id);
          setMessages(existingDocConv.messages || []);
        } else {
          const docObj = docs.find(d => d.id === documentIdParam);
          const newConv = await api.createConversation(`Q&A: ${docObj?.title || 'Document'}`, documentIdParam, 'DOCUMENT');
          setActiveConvId(newConv.id);
          setMessages([]);
        }
      } else if (convs.length > 0) {
        setActiveConvId(convs[0].id);
        setMessages(convs[0].messages || []);
        if (convs[0].documentId) setSelectedDocId(convs[0].documentId);
      } else {
        const newConv = await api.createConversation('General Legal QA', null, 'GENERAL');
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to load AI assistant data:', e);
    }
  };

  const handleContextChange = async (docId) => {
    setSelectedDocId(docId);
    if (!docId) {
      const newConv = await api.createConversation('General Legal QA', null, 'GENERAL');
      setActiveConvId(newConv.id);
      setMessages([]);
    } else {
      const docObj = documents.find(d => d.id === docId);
      const existingConv = conversations.find(c => c.documentId === docId);
      if (existingConv) {
        setActiveConvId(existingConv.id);
        setMessages(existingConv.messages || []);
      } else {
        const newConv = await api.createConversation(`Q&A: ${docObj?.title || 'Document'}`, docId, 'DOCUMENT');
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || textToSend.trim().length === 0 || loading) return;

    setInputQuery('');
    setLoading(true);

    const tempUserMsg = { sender: 'USER', content: textToSend, createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      let currentConvId = activeConvId;
      if (!currentConvId) {
        const newConv = await api.createConversation(
          selectedDocId ? 'Document Q&A' : 'General Legal QA',
          selectedDocId || null,
          selectedDocId ? 'DOCUMENT' : 'GENERAL'
        );
        currentConvId = newConv.id;
        setActiveConvId(currentConvId);
      }

      const res = await api.sendMessage(currentConvId, textToSend);
      setMessages(prev => [...prev.filter(m => m !== tempUserMsg), { sender: 'USER', content: textToSend }, res.message]);
    } catch (err) {
      alert(err.message || 'Failed to send message to Lexora AI');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainClause = async (e) => {
    e.preventDefault();
    if (!clauseInput) return;
    try {
      const res = await api.explainClause(clauseInput);
      setClauseResult(res);
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedDocObj = documents.find(d => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 flex flex-col gap-4 max-w-6xl overflow-hidden h-[calc(100vh-4rem)]">
          
          {/* HEADER & DUAL CONTEXT SELECTOR */}
          <div className="bg-white border border-[#EAE3D2] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 shadow-sm">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D1C13] flex items-center justify-center text-[#E07A5F]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif-legal text-lg font-bold text-[#2D1C13] flex items-center gap-2">
                  Lexora AI Assistant
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2]">
                    Dual Mode RAG
                  </span>
                </h1>
                <p className="text-xs text-[#70665F]">
                  {selectedDocId ? `Asking about: ${selectedDocObj?.title}` : 'Educational legal questions & Indian contract fundamentals'}
                </p>
              </div>
            </div>

            {/* CONTEXT DROPDOWN */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#2D1C13] shrink-0">Context:</span>
              <div className="relative flex-1 sm:w-64">
                <select
                  value={selectedDocId}
                  onChange={(e) => handleContextChange(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-3 py-2 text-xs font-bold text-[#2D1C13] focus:outline-none focus:border-[#E07A5F] cursor-pointer"
                >
                  <option value="">General Legal Questions (No Document)</option>
                  <optgroup label="My Documents (Grounded RAG)">
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        📄 {doc.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <button
                onClick={() => setExplainModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#E07A5F] text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Explain Clause</span>
              </button>
            </div>

          </div>

          {/* CHAT THREAD AREA */}
          <div className="bg-white border border-[#EAE3D2] rounded-2xl flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar shadow-sm">
            
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF7E0] text-[#E07A5F] border border-[#EAE3D2] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13]">
                    {selectedDocId ? `Ask about "${selectedDocObj?.title}"` : 'Ask Lexora Anything Legal'}
                  </h3>
                  <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
                    {selectedDocId
                      ? 'Queries search exact clauses in your contract and provide grounded answers with citations.'
                      : 'Ask about Non-Disclosure Agreements, rental laws, notice periods, or indemnity obligations under Indian law.'}
                  </p>
                </div>

                {/* SUGGESTED PROMPT EXAMPLES */}
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider text-left">Suggested Prompt Examples:</p>
                  <div className="grid grid-cols-1 gap-2 text-left">
                    {(selectedDocId ? [
                      "What is my notice period in this agreement?",
                      "What information is considered confidential?",
                      "What are the obligations of the receiving party?",
                      "When does this agreement expire?"
                    ] : [
                      "What is a Non-Disclosure Agreement (NDA)?",
                      "What should I check before signing a rental agreement?",
                      "What is a notice period in employment contracts?",
                      "Explain indemnity in simple plain language."
                    ]).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FEF7E0] border border-[#EAE3D2] text-xs font-bold text-[#2D1C13] hover:text-[#E07A5F] transition-all text-left flex items-center justify-between group"
                      >
                        <span>{prompt}</span>
                        <Zap className="w-3.5 h-3.5 text-[#70665F] group-hover:text-[#E07A5F] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                  
                  <div className={`max-w-2xl rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-[#2D1C13] text-white rounded-br-none'
                      : 'bg-[#FAF8F5] border border-[#EAE3D2] text-[#2D1C13] rounded-bl-none shadow-sm'
                  }`}>
                    
                    {msg.sender === 'AI' && (
                      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2 mb-2 text-[10px] font-bold text-[#E07A5F]">
                        <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> LEXORA AI ANSWER</span>
                        {msg.sourceCitation && <span className="text-[#70665F] font-normal">{msg.sourceCitation}</span>}
                      </div>
                    )}

                    {msg.sender === 'USER' ? (
                      <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm prose-p:leading-relaxed prose-a:text-[#E07A5F] max-w-none text-[#2D1C13] font-sans w-full">
                        {(() => {
                          try {
                            const parsed = JSON.parse(msg.content);
                            if (parsed.timeline && Array.isArray(parsed.timeline)) {
                              return (
                                <div className="mt-2 relative border-l-2 border-[#E07A5F] pl-6 py-2 space-y-6">
                                  {parsed.timeline.map((event, idx) => (
                                    <div key={idx} className="relative">
                                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#E07A5F] border-4 border-white shadow-sm" />
                                      <div className="bg-white border border-[#EAE3D2] rounded-xl p-4 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                                          <span className="text-xs font-bold text-[#2D1C13] bg-[#FEF7E0] px-2 py-1 rounded">
                                            {event.date} {event.is_ambiguous && <span className="text-[#E07A5F] italic ml-1">(Estimated)</span>}
                                          </span>
                                          {event.limitation_warning && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                              <AlertCircle className="w-3 h-3" /> Time-Barred Warning (&gt;3 Yrs)
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-[#2D1C13] leading-relaxed mb-2">{event.description}</p>
                                        {event.parties && event.parties.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {event.parties.map((party, pIdx) => (
                                              <span key={pIdx} className="text-[10px] font-medium text-[#70665F] bg-[#FAF8F5] border border-[#EAE3D2] px-1.5 py-0.5 rounded">
                                                {party}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            if (parsed.is_draft) {
                              const handleDownloadDoc = () => {
                                const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Lexora Draft</title></head><body>";
                                const footer = "</body></html>";
                                const sourceHTML = header + `<div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">${parsed.draft.replace(/\n/g, '<br>')}</div>` + footer;
                                const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
                                const fileDownload = document.createElement("a");
                                document.body.appendChild(fileDownload);
                                fileDownload.href = source;
                                fileDownload.download = 'Lexora_Draft.doc';
                                fileDownload.click();
                                document.body.removeChild(fileDownload);
                              };

                              return (
                                <div className="mt-4 border border-[#EAE3D2] rounded-xl overflow-hidden shadow-sm bg-white">
                                  <div className="bg-[#FAF8F5] border-b border-[#EAE3D2] px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D1C13]">
                                      <FileText className="w-4 h-4 text-[#E07A5F]" />
                                      Legal Document Draft
                                    </div>
                                    <button
                                      onClick={handleDownloadDoc}
                                      className="px-3 py-1.5 bg-[#E07A5F] hover:bg-[#C85A32] text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                    >
                                      Download .doc
                                    </button>
                                  </div>
                                  <div className="p-6 bg-white overflow-y-auto max-h-96 text-[11px] leading-relaxed text-[#2D1C13] font-serif custom-scrollbar" style={{ whiteSpace: 'pre-wrap' }}>
                                    {parsed.draft}
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            // Fallback to markdown
                          }
                          return <ReactMarkdown>{msg.content}</ReactMarkdown>;
                        })()}
                      </div>
                    )}

                    {/* Grounded RAG Citation Box & Advanced Citations */}
                    {msg.sender === 'AI' && msg.explanation && (
                      <div className="mt-3 pt-3 border-t border-[#EAE3D2] space-y-3 bg-white p-4 rounded-xl border">
                        <div className="text-[11px] font-bold text-[#2D1C13]">
                          <span className="text-[#E07A5F]">✓ Simple Explanation:</span> {msg.explanation}
                        </div>
                        
                        {/* Try parsing advanced JSON citations */}
                        {(() => {
                          try {
                            const parsed = JSON.parse(msg.sourceCitation);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                              return (
                                <div className="space-y-2">
                                  <div className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> Related Statutes & Precedents
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {parsed.map((cite, i) => (
                                      <div key={i} className={`p-2.5 rounded-lg border ${cite.is_overruled ? 'bg-red-50 border-red-200' : 'bg-[#FAF8F5] border-[#EAE3D2]'}`}>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className={`text-[10px] font-bold leading-tight ${cite.is_overruled ? 'text-red-700' : 'text-[#2D1C13]'}`}>
                                            {cite.act_name || cite.case_name}
                                          </div>
                                          {cite.is_overruled ? (
                                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                          ) : (
                                            <ShieldCheck className="w-3 h-3 text-green-600 shrink-0" />
                                          )}
                                        </div>
                                        {cite.section_number && <div className="text-[9px] text-[#E07A5F] font-semibold mb-1">Section {cite.section_number}</div>}
                                        {cite.status && (
                                          <div className={`text-[9px] font-bold mb-1 ${cite.is_overruled ? 'text-red-600' : 'text-green-600'}`}>
                                            {cite.is_overruled ? `🚩 ${cite.status} (${cite.overruled_by})` : `✅ ${cite.status}`}
                                          </div>
                                        )}
                                        {cite.text && <div className={`text-[10px] line-clamp-3 italic ${cite.is_overruled ? 'text-red-500/80' : 'text-[#70665F]'}`}>"{cite.text}"</div>}
                                        {cite.summary && <div className={`text-[10px] line-clamp-3 italic ${cite.is_overruled ? 'text-red-500/80' : 'text-[#70665F]'}`}>"{cite.summary}"</div>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            // Fallback to legacy single string rendering if not JSON
                          }
                          
                          // Fallback legacy display
                          if (msg.relevantClause && msg.relevantClause !== 'N/A') {
                            return (
                              <div className="text-[11px] text-[#70665F] border-l-2 border-[#E07A5F] pl-2 italic">
                                "{msg.relevantClause}"
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                  </div>

                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#E07A5F] bg-[#FEF7E0] border border-[#EAE3D2] rounded-xl p-3 w-max">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Lexora AI is searching clauses & analyzing context...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="bg-white border border-[#EAE3D2] p-3 rounded-2xl flex items-center gap-3 shrink-0 shadow-sm">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedDocId ? `Ask a question about ${selectedDocObj?.title}...` : 'Ask any general legal question...'}
              className="flex-1 bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-4 py-3 text-xs text-[#2D1C13] placeholder-[#70665F] focus:outline-none focus:border-[#E07A5F]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>

      {/* EXPLAIN CLAUSE MODAL */}
      {explainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D2] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
              <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#E07A5F]" />
                Explain Clause with Lexora
              </h3>
              <button onClick={() => setExplainModalOpen(false)} className="text-[#70665F] hover:text-[#2D1C13]">✕</button>
            </div>

            <form onSubmit={handleExplainClause} className="space-y-3">
              <label className="text-xs font-bold text-[#2D1C13]">Paste Legal Clause / Paragraph:</label>
              <textarea
                rows={4}
                required
                value={clauseInput}
                onChange={(e) => setClauseInput(e.target.value)}
                placeholder="e.g. The Receiving Party shall indemnify and hold harmless the Disclosing Party from any liabilities..."
                className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-3 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#2D1C13] text-white text-xs font-bold">
                Generate Plain-Language Explanation
              </button>
            </form>

            {clauseResult && (
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-[#E07A5F]">Simplified Plain-Language Explanation:</p>
                <p className="text-[#2D1C13] leading-relaxed">{clauseResult.simplifiedExplanation}</p>
                <p className="font-bold text-[#2D1C13] pt-2">Key Obligations:</p>
                <ul className="list-disc pl-4 space-y-1 text-[#70665F]">
                  {clauseResult.keyObligations.map((ob, i) => <li key={i}>{ob}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
