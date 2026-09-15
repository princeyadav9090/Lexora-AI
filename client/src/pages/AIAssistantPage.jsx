import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  X,
  ChevronRight,
  PanelLeft,
  Paperclip,
  ArrowUpRight,
  User,
  Scale,
  Mic
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Helper component for markdown-like rich text rendering
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 text-[#2D1C13] text-xs sm:text-sm leading-relaxed font-sans">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

        // Headers
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lineIdx} className="font-serif-legal text-sm sm:text-base font-bold text-[#2D1C13] mt-3 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#E07A5F] rounded-full inline-block shrink-0"></span>
              {renderBoldText(headerText)}
            </h4>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="text-[#E07A5F] font-bold text-sm leading-snug shrink-0">•</span>
              <span className="flex-1">{renderBoldText(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s*(.*)/);
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2 my-1">
              <span className="font-bold text-[#E07A5F] text-xs sm:text-sm shrink-0">{match[1]}.</span>
              <span className="flex-1">{renderBoldText(match[2])}</span>
            </div>
          );
        }

        // Blockquote / Citation clause
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote key={lineIdx} className="border-l-3 border-[#E07A5F] pl-3.5 py-1.5 bg-[#FEF7E0]/60 rounded-r-xl text-[#70665F] italic my-2 text-xs">
              {renderBoldText(quoteText)}
            </blockquote>
          );
        }

        // Standard Paragraph
        return <p key={lineIdx}>{renderBoldText(trimmed)}</p>;
      })}
    </div>
  );
};

const renderBoldText = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#2D1C13]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

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
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(true);

  // Explain Clause Modal State
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [clauseInput, setClauseInput] = useState('');
  const [clauseResult, setClauseResult] = useState(null);
  const [clauseLoading, setClauseLoading] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { isListening, toggleListening, error: voiceError } = useSpeechRecognition((text) => {
    setInputQuery(text);
  });

  useEffect(() => {
    loadInitialData();
  }, [documentIdParam]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
          setConversations(prev => [newConv, ...prev]);
        }
      } else if (convs.length > 0) {
        setActiveConvId(convs[0].id);
        setMessages(convs[0].messages || []);
        if (convs[0].documentId) setSelectedDocId(convs[0].documentId);
      } else {
        const newConv = await api.createConversation('General Legal QA', null, 'GENERAL');
        setActiveConvId(newConv.id);
        setMessages([]);
        setConversations([newConv]);
      }
    } catch (e) {
      console.error('Failed to load AI assistant data:', e);
    }
  };

  const handleNewChat = async () => {
    try {
      setSelectedDocId('');
      const newConv = await api.createConversation('New Legal Conversation', null, 'GENERAL');
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
    setSelectedDocId(conv.documentId || '');
  };

  const handleContextChange = async (docId) => {
    setSelectedDocId(docId);
    if (!docId) {
      const newConv = await api.createConversation('General Legal QA', null, 'GENERAL');
      setActiveConvId(newConv.id);
      setConversations(prev => [newConv, ...prev]);
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
        setConversations(prev => [newConv, ...prev]);
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
        setConversations(prev => [newConv, ...prev]);
      }

      const res = await api.sendMessage(currentConvId, textToSend);
      setMessages(prev => [
        ...prev.filter(m => m !== tempUserMsg), 
        { sender: 'USER', content: textToSend }, 
        res.message
      ]);
    } catch (err) {
      alert(err.message || 'Failed to send message to Lexora AI');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleExplainClause = async (e) => {
    e.preventDefault();
    if (!clauseInput.trim()) return;
    setClauseLoading(true);
    try {
      const res = await api.explainClause(clauseInput);
      setClauseResult(res);
    } catch (err) {
      alert(err.message || 'Failed to simplify legal clause.');
    } finally {
      setClauseLoading(false);
    }
  };

  const selectedDocObj = documents.find(d => d.id === selectedDocId);

  // Modern Prompt Card suggestions
  const PROMPT_SUGGESTIONS = selectedDocId ? [
    {
      title: 'Notice Period & Termination',
      subtitle: 'What is the required notice period for ending this agreement?',
      icon: FileText
    },
    {
      title: 'Confidential Information Scope',
      subtitle: 'What specific data is classified as confidential?',
      icon: ShieldCheck
    },
    {
      title: 'Obligations & Liabilities',
      subtitle: 'What are the main duties assigned to each party?',
      icon: Scale
    },
    {
      title: 'Expiry & Renewal Terms',
      subtitle: 'When does this legal contract terminate or renew?',
      icon: Zap
    }
  ] : [
    {
      title: 'NDA Legal Essentials',
      subtitle: 'What essential clauses should every Indian NDA include?',
      icon: ShieldCheck
    },
    {
      title: 'Rental Agreement Checklist',
      subtitle: 'What should tenants verify before signing a lease in India?',
      icon: BookOpen
    },
    {
      title: 'Notice Period Obligations',
      subtitle: 'How does notice period enforcement work in employment law?',
      icon: FileText
    },
    {
      title: 'Explain Legal Terms',
      subtitle: 'Explain Indemnity and Liquidated Damages in plain English.',
      icon: Sparkles
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex overflow-hidden">
          
          {/* ========================================== */}
          {/* LEFT CONVERSATION HISTORY DRAWER / SIDEBAR */}
          {/* ========================================== */}
          <AnimatePresence initial={false}>
            {showHistoryDrawer && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-r border-[#EAE3D2] flex flex-col h-[calc(100vh-4rem)] shrink-0 overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-[#EAE3D2] flex items-center justify-between">
                  <button
                    onClick={handleNewChat}
                    className="flex-1 py-2.5 px-4 bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#E07A5F]" />
                    <span>New Chat</span>
                  </button>
                </div>

                {/* History List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-4 custom-scrollbar">
                  <div>
                    <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider px-2">
                      Recent Legal Sessions
                    </span>
                    <div className="mt-2 space-y-1">
                      {conversations.length === 0 ? (
                        <p className="text-xs text-[#70665F] px-2 py-1">No previous chats</p>
                      ) : (
                        conversations.map((conv) => {
                          const isActive = conv.id === activeConvId;
                          return (
                            <button
                              key={conv.id}
                              onClick={() => handleSelectConversation(conv)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                                isActive
                                  ? 'bg-[#FEF7E0] border border-[#EAE3D2] text-[#2D1C13] font-bold shadow-xs'
                                  : 'text-[#70665F] hover:bg-[#FAF8F5] hover:text-[#2D1C13]'
                              }`}
                            >
                              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E07A5F]' : 'text-[#70665F]'}`} />
                              <span className="truncate flex-1">{conv.title || 'Legal Chat'}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Grounded Status Footer */}
                <div className="p-3 border-t border-[#EAE3D2] bg-[#FAF8F5]">
                  <div className="flex items-center gap-2 text-[11px] text-[#70665F]">
                    <ShieldCheck className="w-4 h-4 text-[#E07A5F]" />
                    <span className="font-semibold text-[#2D1C13]">Indian Jurisprudential AI</span>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ========================================== */}
          {/* MAIN MODERN CHAT CONSOLE AREA */}
          {/* ========================================== */}
          <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#FAF8F5]">
            
            {/* TOP MODEL & CONTEXT HEADER */}
            <header className="bg-white/90 backdrop-blur-md border-b border-[#EAE3D2] px-6 py-3.5 flex items-center justify-between shrink-0 shadow-xs z-10">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                  className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] transition-colors"
                  title="Toggle Chat History"
                >
                  <PanelLeft className="w-4 h-4 text-[#70665F]" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif-legal text-base font-bold text-[#2D1C13] flex items-center gap-2">
                      Lexora Legal AI 2.0
                    </h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#E07A5F]" /> Grounded RAG
                    </span>
                  </div>
                  <p className="text-[11px] text-[#70665F] truncate max-w-md">
                    {selectedDocId ? `Context: ${selectedDocObj?.title}` : 'General Legal & Contractual Assistant'}
                  </p>
                </div>
              </div>

              {/* RIGHT CONTEXT CONTROLS */}
              <div className="flex items-center gap-2">
                
                {/* Document Selector Pill */}
                <div className="relative">
                  <select
                    value={selectedDocId}
                    onChange={(e) => handleContextChange(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#EAE3D2] hover:bg-[#F4F1EA] text-[#2D1C13] text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#E07A5F] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="">🌐 General Legal QA (No Document)</option>
                    <optgroup label="Grounded Document Context">
                      {documents.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          📄 {doc.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#70665F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Explain Clause Action */}
                <button
                  onClick={() => setExplainModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Explain Clause</span>
                </button>

              </div>

            </header>

            {/* CHAT MESSAGES CONTAINER (ChatGPT / Gemini Centered Layout) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
              
              <div className="max-w-4xl mx-auto space-y-6">
                
                {messages.length === 0 ? (
                  
                  /* ========================================== */
                  /* HERO INITIAL STATE (CHATGPT/GEMINI STYLE) */
                  /* ========================================== */
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto"
                  >
                    {/* Glowing Logo Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D1C13] to-[#4A3022] text-[#E07A5F] flex items-center justify-center shadow-lg border border-[#EAE3D2]">
                        <Bot className="w-9 h-9" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E07A5F] text-white flex items-center justify-center border-2 border-white text-xs shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-serif-legal text-2xl sm:text-3xl font-bold text-[#2D1C13]">
                        {selectedDocId ? `Ask about "${selectedDocObj?.title}"` : 'Hello! What legal matter can Lexora simplify?'}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#70665F] max-w-lg leading-relaxed">
                        {selectedDocId
                          ? 'Queries perform vector search across your exact contract clauses with grounded citations.'
                          : 'Ask general Indian legal questions, contract terms, statutory requirements, or notice period rules.'}
                      </p>
                    </div>

                    {/* SUGGESTED PROMPT CARDS (2x2 Grid) */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
                      {PROMPT_SUGGESTIONS.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSendMessage(item.subtitle)}
                            className="figma-card figma-card-hover p-4 rounded-2xl cursor-pointer flex flex-col justify-between space-y-3 group border border-[#EAE3D2] bg-white text-left shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="w-8 h-8 rounded-lg bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center group-hover:bg-[#E07A5F] group-hover:text-white transition-all">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-[#70665F] group-hover:text-[#E07A5F] transition-colors" />
                            </div>

                            <div>
                              <h3 className="text-xs font-bold text-[#2D1C13] group-hover:text-[#E07A5F] transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-[#70665F] mt-0.5 line-clamp-2 leading-relaxed">
                                "{item.subtitle}"
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                  </motion.div>

                ) : (
                  
                  /* ========================================== */
                  /* MESSAGES THREAD (CHATGPT/GEMINI STREAM) */
                  /* ========================================== */
                  messages.map((msg, idx) => {
                    const isUser = msg.sender === 'USER';
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-[#2D1C13] text-[#E07A5F] flex items-center justify-center shrink-0 border border-[#EAE3D2] shadow-xs mt-1">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`space-y-2 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                          
                          {/* Message Bubble Card */}
                          <div className={`p-4 sm:p-5 rounded-2xl text-xs leading-relaxed shadow-xs transition-all ${
                            isUser
                              ? 'bg-[#2D1C13] text-white rounded-tr-none font-medium'
                              : 'bg-white border border-[#EAE3D2] text-[#2D1C13] rounded-tl-none shadow-sm'
                          }`}>
                            
                            {!isUser && (
                              <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2 mb-3 text-[10px] font-bold text-[#E07A5F]">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 fill-current" /> LEXORA AI ANALYSIS
                                </span>
                                {msg.sourceCitation && (
                                  <span className="text-[#70665F] font-semibold bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE3D2]">
                                    {msg.sourceCitation}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Render Message Content with Markdown Parsing */}
                            {isUser ? (
                              <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-white/95">{msg.content}</p>
                            ) : (
                              <FormattedMessage content={msg.content} />
                            )}

                            {/* Grounded Citation & Explanation Block */}
                            {!isUser && msg.explanation && (
                              <div className="mt-4 pt-3.5 border-t border-[#EAE3D2] space-y-2 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE3D2]">
                                <div className="text-[11px] font-bold text-[#2D1C13] flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#E07A5F]" />
                                  <span>Grounded Explanation:</span>
                                </div>
                                <p className="text-[11px] text-[#2D1C13] leading-relaxed">{msg.explanation}</p>
                                {msg.relevantClause && msg.relevantClause !== 'N/A' && (
                                  <div className="text-[11px] text-[#70665F] border-l-2 border-[#E07A5F] pl-2.5 italic my-1">
                                    "{msg.relevantClause}"
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                          {/* Message Action Bar (For AI Messages) */}
                          {!isUser && (
                            <div className="flex items-center gap-2 px-1 text-[11px] text-[#70665F]">
                              <button
                                onClick={() => handleCopyMessage(msg.content, idx)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white hover:text-[#2D1C13] border border-transparent hover:border-[#EAE3D2] transition-all"
                              >
                                {copiedIdx === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setClauseInput(msg.content);
                                  setExplainModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white hover:text-[#E07A5F] border border-transparent hover:border-[#EAE3D2] transition-all"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Simplify Clause</span>
                              </button>
                            </div>
                          )}

                        </div>

                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center shrink-0 border border-[#EAE3D2] shadow-xs mt-1 font-bold text-xs">
                            <User className="w-4 h-4 text-[#2D1C13]" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}

                {/* TYPING / THINKING STATE */}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 items-start max-w-2xl"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2D1C13] text-[#E07A5F] flex items-center justify-center shrink-0 border border-[#EAE3D2] shadow-xs">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-[#EAE3D2] rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse"></span>
                        <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse [animation-delay:0.4s]"></span>
                      </div>
                      <span className="text-xs font-semibold text-[#70665F]">
                        Lexora AI is searching clauses & analyzing legal context...
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />

              </div>

            </div>

            {/* ========================================== */}
            {/* FLOATING INPUT BAR (CHATGPT / GEMINI STYLE) */}
            {/* ========================================== */}
            <div className="p-4 sm:p-6 pt-2 shrink-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5] to-transparent">
              <div className="max-w-4xl mx-auto space-y-2">
                
                <div className="bg-white border border-[#EAE3D2] p-2.5 sm:p-3 rounded-2xl shadow-lg focus-within:border-[#E07A5F] focus-within:ring-2 focus-within:ring-[#E07A5F]/20 transition-all flex flex-col gap-2">
                  
                  {/* Context Badge Pill inside Input Bar */}
                  {selectedDocId && (
                    <div className="flex items-center justify-between bg-[#FEF7E0] border border-[#EAE3D2] px-3 py-1 rounded-xl text-[11px] font-bold text-[#B06000]">
                      <span className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                        <span>Grounded Context: {selectedDocObj?.title}</span>
                      </span>
                      <button
                        onClick={() => handleContextChange('')}
                        className="hover:text-red-600 transition-colors shrink-0"
                        title="Remove Document Context"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        isListening
                          ? 'Listening... Speak your question now'
                          : selectedDocId 
                            ? `Ask any question about ${selectedDocObj?.title}...` 
                            : 'Ask Lexora any legal question under Indian law...'
                      }
                      className="flex-1 bg-transparent border-0 px-2 py-1 text-xs sm:text-sm text-[#2D1C13] placeholder-[#70665F] focus:outline-none resize-none max-h-32 font-sans"
                    />

                    {/* Mic Voice Dictation Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative shrink-0 ${
                        isListening
                          ? 'bg-[#FEF7E0] text-[#E07A5F] border border-[#EAE3D2] scale-105'
                          : 'bg-[#FAF8F5] text-[#70665F] hover:text-[#E07A5F] border border-[#EAE3D2]'
                      }`}
                      title={isListening ? 'Stop Listening' : 'Voice Input'}
                    >
                      <Mic className="w-4 h-4" />
                      {isListening && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E07A5F] animate-ping" />
                      )}
                    </button>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={loading || !inputQuery.trim()}
                      className="w-10 h-10 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white flex items-center justify-center shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {isListening && (
                    <div className="text-[11px] font-bold text-[#E07A5F] flex items-center justify-center gap-2 animate-pulse pt-1">
                      <span className="w-2 h-2 rounded-full bg-[#E07A5F]"></span>
                      <span>Listening to your voice... Speak your legal prompt</span>
                    </div>
                  )}

                  {voiceError && (
                    <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 text-center">
                      {voiceError}
                    </div>
                  )}

                </div>

                <p className="text-[10px] text-center text-[#70665F] leading-tight">
                  Lexora AI provides legal information grounded in contract context. Verify critical statutory terms with a licensed advocate.
                </p>

              </div>
            </div>

          </main>

        </div>
      </div>

      {/* ========================================== */}
      {/* EXPLAIN CLAUSE MODAL (ELEGANT DESIGN) */}
      {/* ========================================== */}
      <AnimatePresence>
        {explainModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EAE3D2] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
                <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#E07A5F] fill-current" />
                  Plain-Language Legal Clause Simplifier
                </h3>
                <button 
                  onClick={() => setExplainModalOpen(false)} 
                  className="p-1 rounded-lg hover:bg-[#FAF8F5] text-[#70665F] hover:text-[#2D1C13]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExplainClause} className="space-y-3">
                <label className="text-xs font-bold text-[#2D1C13]">Paste Legal Clause or Contract Paragraph:</label>
                <textarea
                  rows={4}
                  required
                  value={clauseInput}
                  onChange={(e) => setClauseInput(e.target.value)}
                  placeholder="e.g. The Receiving Party agrees to indemnify and hold harmless the Disclosing Party against any losses..."
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-3.5 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                />
                <button 
                  type="submit" 
                  disabled={clauseLoading || !clauseInput.trim()}
                  className="w-full py-3 rounded-xl bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  {clauseLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-[#E07A5F]" />
                      <span>Translating Legal Legalese...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#E07A5F]" />
                      <span>Simplify Clause with Lexora AI</span>
                    </>
                  )}
                </button>
              </form>

              {clauseResult && (
                <div className="bg-[#FEF7E0]/60 border border-[#EAE3D2] p-4 rounded-xl space-y-2.5 text-xs">
                  <p className="font-bold text-[#E07A5F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Simplified Plain-Language Explanation:
                  </p>
                  <p className="text-[#2D1C13] leading-relaxed font-medium">{clauseResult.simplifiedExplanation}</p>
                  
                  {clauseResult.keyObligations && clauseResult.keyObligations.length > 0 && (
                    <div>
                      <p className="font-bold text-[#2D1C13] pt-1">Key Obligations:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[#70665F] mt-1">
                        {clauseResult.keyObligations.map((ob, i) => (
                          <li key={i}>{ob}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
