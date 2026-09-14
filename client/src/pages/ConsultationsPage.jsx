import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, ShieldCheck, User, Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const data = await api.getConsultations();
      setConsultations(data || []);
    } catch (e) {
      console.error('Failed to load consultations:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2D1C13]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE3D2] pb-5 gap-4">
            <div>
              <h1 className="font-serif-legal text-2xl lg:text-3xl font-bold text-[#2D1C13] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2D1C13] text-[#E07A5F] flex items-center justify-center shadow-sm">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span>Legal Consultation Bookings</span>
              </h1>
              <p className="text-xs text-[#70665F] mt-1 font-medium">
                Track your booked legal consultations with verified Advocates in India.
              </p>
            </div>

            <Link
              to="/lawyers"
              className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-2 self-start sm:self-auto transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Consultation</span>
            </Link>
          </div>

          <LegalDisclaimer compact={true} />

          {loading ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F] shadow-sm">
              Loading consultation requests...
            </div>
          ) : consultations.length === 0 ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#E07A5F] flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#2D1C13] font-serif-legal">No Consultation Bookings Yet</p>
              <p className="text-xs text-[#70665F] max-w-md mx-auto">
                You haven't scheduled any consultations with Advocates. Browse our marketplace to connect with specialized legal professionals.
              </p>
              <Link 
                to="/lawyers" 
                className="inline-block mt-2 px-5 py-2.5 bg-[#2D1C13] hover:bg-[#1A110B] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                Browse Advocates Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((c) => (
                <div key={c.id} className="bg-white border border-[#EAE3D2] p-5 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-all">
                  
                  {/* Lawyer Info & Status */}
                  <div className="flex items-start justify-between border-b border-[#EAE3D2] pb-3 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#2D1C13] text-[#E07A5F] border border-[#EAE3D2] flex items-center justify-center font-bold text-base shadow-sm">
                        {c.lawyer?.name ? c.lawyer.name.replace('Advocate ', '').charAt(0) : 'A'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#2D1C13] font-serif-legal">{c.lawyer?.name || 'Advocate Consultation'}</h3>
                        <p className="text-xs text-[#E07A5F] font-semibold">{c.lawyer?.specialization}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] rounded-lg">
                      {c.status}
                    </span>
                  </div>

                  {/* Date, Time & Fee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-[#70665F]">
                      <Clock className="w-4 h-4 text-[#E07A5F]" />
                      <span>Scheduled: <strong className="text-[#2D1C13]">{c.date}</strong> at <strong className="text-[#2D1C13]">{c.time}</strong></span>
                    </div>
                    <div className="text-[#70665F]">
                      <span>Consultation Fee: </span>
                      <strong className="text-[#2D1C13] font-bold">{formatCurrency(c.lawyer?.fee || 2500)}</strong>
                    </div>
                  </div>

                  {/* Described Issue */}
                  <div className="bg-[#F4F1EA] border border-[#EAE3D2] p-3.5 rounded-xl text-xs space-y-1">
                    <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Described Legal Matter</span>
                    <p className="text-[#2D1C13] leading-relaxed">{c.issue}</p>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
