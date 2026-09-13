import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const LegalDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#70665F] bg-white border border-[#EAE3D2] rounded-xl px-3 py-2 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-[#E07A5F] shrink-0" />
        <span>
          <strong>Lexora AI Disclaimer:</strong> AI-assisted legal information & document drafting tool based on Indian law. Not a substitute for formal legal representation.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FEF7E0] border border-[#EAE3D2] rounded-2xl p-4 my-4 flex items-start gap-3 shadow-sm text-[#2D1C13]">
      <AlertTriangle className="w-5 h-5 text-[#B06000] shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <p className="font-bold text-[#2D1C13] font-serif-legal">Legal Safety & Compliance Disclaimer</p>
        <p className="text-[#70665F] leading-relaxed">
          Lexora AI provides AI-assisted legal information and document drafting support based on standard templates and automated groundings. 
          Lexora AI does not provide formal legal advice, court validity guarantees, or court representation. For high-risk or complex legal matters, please consult a verified legal professional through our Lawyer Marketplace.
        </p>
      </div>
    </div>
  );
};
