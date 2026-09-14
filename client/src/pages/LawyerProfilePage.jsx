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
import { LegalDisclaimer } from '../components/LegalDisclaimer';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2D1C13]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-[#70665F]">
          Loading advocate profile...
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2D1C13]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3 bg-white border border-[#EAE3D2] p-8 rounded-2xl shadow-sm">
            <p className="text-xs text-[#70665F]">Lawyer profile not found.</p>
            <Link to="/lawyers" className="px-4 py-2 bg-[#2D1C13] text-white text-xs font-semibold rounded-xl inline-block">
              Back to Lawyers Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2D1C13]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl overflow-y-auto">
          
          <button
            onClick={() => navigate('/lawyers')}
            className="flex items-center gap-1.5 text-xs text-[#70665F] hover:text-[#2D1C13] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lawyers Directory</span>
          </button>

          {/* Lawyer Profile Card */}
          <div className="bg-white border border-[#EAE3D2] p-8 rounded-2xl space-y-6 shadow-sm">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#EAE3D2] pb-6">
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#2D1C13] text-[#E07A5F] border border-[#EAE3D2] flex items-center justify-center text-2xl font-bold font-serif-legal shadow-sm">
                  {lawyer.name.replace('Advocate ', '').charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#2D1C13] font-serif-legal flex items-center gap-2">
                    {lawyer.name}
                    <ShieldCheck className="w-5 h-5 text-[#E07A5F]" />
                  </h1>
                  <p className="text-xs text-[#E07A5F] font-semibold mt-0.5">{lawyer.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Consultation Fee</span>
                  <span className="text-xl font-bold text-[#2D1C13]">{formatCurrency(lawyer.fee)}</span>
                </div>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Request Consultation
                </button>
              </div>

            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#F4F1EA] border border-[#EAE3D2] p-4 rounded-xl space-y-1">
                <span className="text-[#70665F] font-bold block">Experience</span>
                <span className="text-[#2D1C13] font-semibold">{lawyer.experience} Years Practice</span>
              </div>
              <div className="bg-[#F4F1EA] border border-[#EAE3D2] p-4 rounded-xl space-y-1">
                <span className="text-[#70665F] font-bold block">Location</span>
                <span className="text-[#2D1C13] font-semibold">{lawyer.location}</span>
              </div>
              <div className="bg-[#F4F1EA] border border-[#EAE3D2] p-4 rounded-xl space-y-1">
                <span className="text-[#70665F] font-bold block">Languages</span>
                <span className="text-[#2D1C13] font-semibold">{lawyer.languages}</span>
              </div>
            </div>

            {/* About / Bio */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#2D1C13] font-serif-legal">About Practitioner</h3>
              <p className="text-xs text-[#70665F] leading-relaxed">
                {lawyer.bio}
              </p>
            </div>

          </div>

          <LegalDisclaimer compact={true} />

        </main>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D2] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-[#2D1C13]">
            
            <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
              <h3 className="text-base font-bold text-[#2D1C13] font-serif-legal flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E07A5F]" />
                Book Consultation with {lawyer.name}
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-[#70665F] hover:text-[#2D1C13] font-bold">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="bg-[#FEF7E0] border border-[#EAE3D2] text-[#B06000] p-4 rounded-xl text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#E07A5F] mx-auto" />
                <h4 className="font-bold text-[#2D1C13] font-serif-legal">Consultation Confirmed!</h4>
                <p>Redirecting to your consultations management dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookConsultation} className="space-y-4">
                
                {bookingError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#2D1C13]">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-3 py-2 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#2D1C13]">Select Time Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl px-3 py-2 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                    <option value="05:00 PM">05:00 PM - Evening Slot</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#2D1C13]">Describe Legal Issue / Contract Review</label>
                  <textarea
                    rows={3}
                    required
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="e.g. Review NDA non-compete terms and liability risks..."
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-3 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE3D2]">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#F4F1EA] text-[#70665F] text-xs font-semibold hover:text-[#2D1C13]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold disabled:opacity-50 transition-all"
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
