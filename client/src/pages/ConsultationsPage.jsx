import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, ShieldCheck, User, Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

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
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-6xl overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-purple-400" />
                Legal Consultation Requests
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track your booked legal consultations with Advocates in India.
              </p>
            </div>

            <Link
              to="/lawyers"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Consultation</span>
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-xs text-slate-400">
              Loading consultation requests...
            </div>
          ) : consultations.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
              <CalendarCheck className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">You have no active legal consultation bookings.</p>
              <Link to="/lawyers" className="inline-block px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl">
                Browse Advocates Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((c) => (
                <div key={c.id} className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800 hover:border-purple-500/40 transition-colors">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40 flex items-center justify-center font-bold text-sm">
                        {c.lawyer?.name ? c.lawyer.name.replace('Advocate ', '').charAt(0) : 'A'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{c.lawyer?.name || 'Advocate Consultation'}</h3>
                        <p className="text-[11px] text-purple-400 font-medium">{c.lawyer?.specialization}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800 rounded-lg">
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Date & Time: <strong className="text-white">{c.date}</strong> at <strong className="text-white">{c.time}</strong></span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400">Fee: </span>
                      <strong className="text-white">₹{c.lawyer?.fee || '2500'} INR</strong>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Described Legal Issue:</span>
                    <p className="text-slate-200">{c.issue}</p>
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
