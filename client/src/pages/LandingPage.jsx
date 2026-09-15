import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  FolderLock,
  Bot,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Scale,
  Lock,
  Star,
  Search,
  Mic,
  ChevronDown,
  Clock,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LegalDisclaimer } from '../components/LegalDisclaimer';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroQuery) {
      navigate(`/assistant`);
    }
  };

  const faqs = [
    { q: 'How does Lexora AI ensure legal accuracy for Indian law?', a: 'Lexora AI indexes verified Indian statutory acts including the Indian Contract Act (1872), Rent Control laws, and labor regulations, providing exact section citations for educational assistance.' },
    { q: 'Is my uploaded document data kept secure and private?', a: 'Yes. Every document uploaded to your Digital Vault is encrypted with object-level user authorization. Only you can access or query your contract chunks.' },
    { q: 'Can I consult with a real human legal advocate on Lexora AI?', a: 'Absoultely. Our Verified Lawyer Marketplace allows you to discover legal practitioners across India and book one-on-one consultation sessions.' },
    { q: 'Are generated legal drafts customizable?', a: 'Yes. Generated contract drafts can be previewed, edited inline, exported as PDF/TXT, and saved in multiple version iterations.' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION (Matches Figma) */}
        <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#EAE3D2]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF7E0] border border-[#EAE3D2] text-[#B06000] text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation LegalTech Platform for India</span>
            </div>

            <h1 className="font-serif-legal text-4xl sm:text-6xl font-bold text-[#2D1C13] tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Lexora AI — Your Smart <span className="text-[#E07A5F]">Legal Companion</span>
            </h1>

            <p className="text-sm sm:text-base text-[#70665F] max-w-2xl mx-auto leading-relaxed">
              Draft airtight contracts, get grounded answers cited under Indian law, and connect with verified advocates — all in one unified platform.
            </p>

            {/* Figma-matching Query Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative">
              <div className="flex items-center bg-white border-2 border-[#EAE3D2] hover:border-[#E07A5F] focus-within:border-[#E07A5F] rounded-2xl p-2 shadow-lg transition-all">
                <Search className="w-5 h-5 text-[#70665F] ml-3" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Type your legal query or contract question..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-semibold text-[#2D1C13] placeholder-[#70665F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert('Voice input activated')}
                  className="p-2 text-[#70665F] hover:text-[#E07A5F] transition-colors"
                  title="Voice Query"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-bold transition-all ml-1 shadow-sm"
                >
                  Ask Lexora
                </button>
              </div>
            </form>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/documents/new"
                className="px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Generate Legal Document</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/vault"
                className="px-6 py-3 rounded-xl bg-white hover:bg-[#F4F1EA] border border-[#EAE3D2] text-[#2D1C13] font-semibold text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                <FolderLock className="w-4 h-4 text-[#E07A5F]" />
                <span>Open Digital Vault</span>
              </Link>
            </div>

          </div>
        </section>

        {/* FEATURES SECTION (Matches Figma) */}
        <section className="py-20 bg-white border-b border-[#EAE3D2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-extrabold text-[#E07A5F] uppercase tracking-widest">FEATURES</span>
              <h2 className="font-serif-legal text-3xl font-bold text-[#2D1C13]">Everything you need for Modern Legal Work</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Feature 1: AI Document Generator */}
              <div className="figma-card figma-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF7E0] text-[#B06000] flex items-center justify-center border border-[#EAE3D2]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-legal text-xl font-bold text-[#2D1C13]">AI Document Generator</h3>
                  <p className="text-xs text-[#70665F] leading-relaxed">
                    Guided human-language questionnaires for NDAs, rental agreements, employment contracts, and freelance service agreements.
                  </p>
                </div>
                <Link to="/documents/new" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline pt-2">
                  <span>Create Contract</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 2: Grounded RAG Assistant */}
              <div className="figma-card figma-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center border border-[#EAE3D2]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-legal text-xl font-bold text-[#2D1C13]">Grounded RAG Assistant</h3>
                  <p className="text-xs text-[#70665F] leading-relaxed">
                    Ask document-specific questions to extract exact clause references, simple explanations, and statutory citations.
                  </p>
                </div>
                <Link to="/assistant" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline pt-2">
                  <span>Ask AI Assistant</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 3: Secure Digital Vault */}
              <div className="figma-card figma-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF7E0] text-[#E07A5F] flex items-center justify-center border border-[#EAE3D2]">
                    <FolderLock className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-legal text-xl font-bold text-[#2D1C13]">Secure Digital Vault</h3>
                  <p className="text-xs text-[#70665F] leading-relaxed">
                    Safely store, organize, and upload confidential legal files with user authorization, version tracking, and vector indexing.
                  </p>
                </div>
                <Link to="/vault" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline pt-2">
                  <span>Open Digital Vault</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 4: Verified Advocates */}
              <div className="figma-card figma-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] text-[#2D1C13] flex items-center justify-center border border-[#EAE3D2]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-legal text-xl font-bold text-[#2D1C13]">Verified Advocates</h3>
                  <p className="text-xs text-[#70665F] leading-relaxed">
                    Discover verified Indian legal practitioners, inspect detailed profiles, and request one-on-one consultation sessions.
                  </p>
                </div>
                <Link to="/lawyers" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline pt-2">
                  <span>Browse Marketplace</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* WHY US SECTION (Matches Figma) */}
        <section className="py-20 bg-[#FAF8F5] border-b border-[#EAE3D2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-extrabold text-[#E07A5F] uppercase tracking-widest">WHY US</span>
              <h2 className="font-serif-legal text-3xl font-bold text-[#2D1C13]">Why Choose Lexora AI</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white border border-[#EAE3D2] rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF7E0] text-[#B06000] flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13]">Affordable</h3>
                </div>
                <p className="text-xs text-[#70665F] leading-relaxed">
                  Significantly reduce legal consultation fees by generating structured draft contracts and getting initial AI grounded QA.
                </p>
              </div>

              <div className="bg-white border border-[#EAE3D2] rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#137333] flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13]">Fast</h3>
                </div>
                <p className="text-xs text-[#70665F] leading-relaxed">
                  Generate compliant legal contracts in minutes instead of waiting days for standard templates.
                </p>
              </div>

              <div className="bg-white border border-[#EAE3D2] rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F1EA] text-[#2D1C13] flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif-legal text-lg font-bold text-[#2D1C13]">Reliable</h3>
                </div>
                <p className="text-xs text-[#70665F] leading-relaxed">
                  All AI responses cite verified Indian statutory clauses, with easy escalation to verified Bar Council advocates.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION (Matches Figma) */}
        <section className="py-20 bg-white border-b border-[#EAE3D2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-extrabold text-[#E07A5F] uppercase tracking-widest">TESTIMONIALS</span>
              <h2 className="font-serif-legal text-3xl font-bold text-[#2D1C13]">What Our Users Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] p-6 rounded-2xl space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-[#2D1C13] italic leading-relaxed">
                  "Lexora AI helped me draft a airtight freelance client contract in 5 minutes. The plain-language clause explainer is amazing!"
                </p>
                <div>
                  <h4 className="text-xs font-bold text-[#2D1C13]">Priya Sharma</h4>
                  <span className="text-[11px] text-[#70665F]">Freelance UI/UX Designer, Bengaluru</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] p-6 rounded-2xl space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-[#2D1C13] italic leading-relaxed">
                  "The Digital Vault document Q&A gave me immediate clarity on my office lease notice period. Highly recommended for founders."
                </p>
                <div>
                  <h4 className="text-xs font-bold text-[#2D1C13]">Arjun Mehta</h4>
                  <span className="text-[11px] text-[#70665F]">Tech Startup Founder, Mumbai</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] p-6 rounded-2xl space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-[#2D1C13] italic leading-relaxed">
                  "Finding a specialized advocate and booking a consultation slot was completely hassle-free. Brilliant product!"
                </p>
                <div>
                  <h4 className="text-xs font-bold text-[#2D1C13]">Kavya Nair</h4>
                  <span className="text-[11px] text-[#70665F]">Law Student & Researcher, Delhi</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* EXPERT HELP CTA BANNER (Matches Figma Deep Espresso Banner) */}
        <section className="py-16 bg-[#2D1C13] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="font-serif-legal text-3xl font-bold text-white">Need Personal Legal Advice From an Advocate?</h2>
            <p className="text-xs text-[#EAE3D2] max-w-xl mx-auto leading-relaxed">
              Connect with 240+ verified legal practitioners across India for contract reviews, litigation guidance, and formal legal representation.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link
                to="/lawyers"
                className="px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-md transition-all"
              >
                Book Advocate Consultation
              </Link>
              <Link
                to="/assistant"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Ask Lexora AI First
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION (Matches Figma) */}
        <section className="py-20 bg-[#FAF8F5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

            <div className="text-center space-y-2">
              <span className="text-[11px] font-extrabold text-[#E07A5F] uppercase tracking-widest">FAQ</span>
              <h2 className="font-serif-legal text-3xl font-bold text-[#2D1C13]">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between font-serif-legal text-base font-bold text-[#2D1C13]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#70665F] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-xs text-[#70665F] leading-relaxed border-t border-[#F4F1EA] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <LegalDisclaimer />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
