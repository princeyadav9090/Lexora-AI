import React from 'react';
import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#2D1C13] border-t border-[#3D261A] text-[#EAE3D2] py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E07A5F] flex items-center justify-center text-white">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif-legal text-lg font-bold text-white tracking-tight">LEXORA AI</span>
            </div>
            <p className="text-xs text-[#EAE3D2]/80 leading-relaxed">
              Your Smart Legal Companion. AI-assisted legal contract generation, Digital Vault storage, grounded RAG assistant, and advocate marketplace in India.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/documents/new" className="hover:text-[#E07A5F] transition-colors">Document Generator</Link></li>
              <li><Link to="/vault" className="hover:text-[#E07A5F] transition-colors">Digital Vault</Link></li>
              <li><Link to="/assistant" className="hover:text-[#E07A5F] transition-colors">Legal Assistant</Link></li>
              <li><Link to="/lawyers" className="hover:text-[#E07A5F] transition-colors">Lawyer Marketplace</Link></li>
            </ul>
          </div>

          {/* Legal Documents */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Templates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/documents/new" className="hover:text-[#E07A5F] transition-colors">Non-Disclosure Agreement (NDA)</Link></li>
              <li><Link to="/documents/new" className="hover:text-[#E07A5F] transition-colors">Residential Rental Agreement</Link></li>
              <li><Link to="/documents/new" className="hover:text-[#E07A5F] transition-colors">Employment Agreement</Link></li>
              <li><Link to="/documents/new" className="hover:text-[#E07A5F] transition-colors">Freelance Service Contract</Link></li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Trust & Security</h4>
            <p className="text-xs text-[#EAE3D2]/80 leading-relaxed mb-3">
              Built with server-side access controls, AWS Cognito security, and Indian legal template standards.
            </p>
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold bg-[#1A110B] border border-[#3D261A] rounded text-[#E07A5F]">
              🇮🇳 Tailored for India Legal Market
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-[#3D261A] flex flex-col sm:flex-row items-center justify-between text-xs text-[#EAE3D2]/60 gap-4">
          <p>© 2026 Lexora AI Technologies. All rights reserved.</p>
          <p className="text-[11px]">
            Lexora AI provides AI-assisted legal information. Not a substitute for formal legal representation.
          </p>
        </div>

      </div>
    </footer>
  );
};
