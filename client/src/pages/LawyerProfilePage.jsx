import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Globe, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export const LawyerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [issueDesc, setIssueDesc] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLawyerDetail();
  }, [id]);

  const fetchLawyerDetail = async () => {
    try {
      const data = await api.getLawyerDetail(id);
      setLawyer(data);
    } catch (e) {
      console.error('Failed to load lawyer profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);

    try {
      await api.bookConsultation(id, bookingDate, bookingTime, issueDesc);
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/consultations');
      }, 1500);
    } catch (err) {
      setBookingError(err.message || 'Failed to request consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading advocate profile...
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-400">Lawyer profile not found.</p>
            <Link to="/lawyers" className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl inline-block">
              Back to Lawyers Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-5xl overflow-y-auto">
          
          <button
            onClick={() => navigate('/lawyers')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lawyers Directory</span>
          </button>

          {/* Lawyer Profile Card */}
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {lawyer.name.replace('Advocate ', '').charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {lawyer.name}
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </h1>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">{lawyer.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Consultation Fee</span>
                  <span className="text-xl font-bold text-white">₹{lawyer.fee} INR</span>
                </div>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
                >
                  Request Consultation
                </button>
              </div>

            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-bold block">Experience</span>
                <span className="text-slate-200 font-semibold">{lawyer.experience} Years Practice</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-bold block">Location</span>
                <span className="text-slate-200 font-semibold">{lawyer.location}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-bold block">Languages</span>
                <span className="text-slate-200 font-semibold">{lawyer.languages}</span>
              </div>
            </div>

            {/* About / Bio */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">About Practitioner</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lawyer.bio}
              </p>
            </div>

          </div>

        </main>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Book Consultation with {lawyer.name}
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white">Consultation Confirmed!</h4>
                <p>Redirecting to your consultations management dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookConsultation} className="space-y-4">
                
                {bookingError && (
                  <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Select Time Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                    <option value="05:00 PM">05:00 PM - Evening Slot</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Describe Legal Issue / Contract Review</label>
                  <textarea
                    rows={3}
                    required
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="e.g. Review NDA non-compete terms and liability risks..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Confirming Booking...' : 'Confirm Request'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
