import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  MapPin, 
  Briefcase, 
  Globe, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export const LawyerDirectoryPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSpecialization, setSearchSpecialization] = useState('');

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const data = await api.getLawyers(searchSpecialization);
      setLawyers(data || []);
    } catch (e) {
      console.error('Failed to load lawyers:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D2] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2]">
                  247 VERIFIED PROFESSIONALS
                </span>
              </div>
              <h1 className="font-serif-legal text-2xl font-bold text-[#2D1C13] mt-1 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#E07A5F]" />
                Legal Practitioner Marketplace
              </h1>
              <p className="text-xs text-[#70665F] mt-0.5">
                Connect with verified legal professionals in India for expert contract review and consultation.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D2] text-[#2D1C13] shadow-sm">
                🇮🇳 Verified Bar Council Advocates
              </span>
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F]">
              Loading verified legal practitioners...
            </div>
          ) : lawyers.length === 0 ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F]">
              No legal practitioners found matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer) => (
                <div key={lawyer.id} className="figma-card figma-card-hover p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                  
                  <div className="space-y-3.5">
                    {/* Profile Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#2D1C13] text-[#E07A5F] flex items-center justify-center font-bold text-lg">
                          {lawyer.name.replace('Advocate ', '').charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-serif-legal text-base font-bold text-[#2D1C13]">
                            {lawyer.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-[#137333] font-semibold mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Advocate</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-700 text-xs font-bold bg-[#FEF7E0] px-2 py-0.5 rounded border border-[#EAE3D2]">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{lawyer.rating}</span>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#2D1C13]">
                        <Briefcase className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                        <span className="font-bold">{lawyer.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#70665F]">
                        <MapPin className="w-3.5 h-3.5 text-[#70665F] shrink-0" />
                        <span>{lawyer.location} ({lawyer.experience} Years Exp)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#70665F]">
                        <Globe className="w-3.5 h-3.5 text-[#70665F] shrink-0" />
                        <span>Languages: {lawyer.languages}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#70665F] line-clamp-2 leading-relaxed pt-1">
                      {lawyer.bio}
                    </p>
                  </div>

                  {/* Fee & Action Button */}
                  <div className="pt-4 border-t border-[#EAE3D2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#70665F] uppercase font-bold block">Consultation Fee</span>
                      <span className="font-serif-legal text-lg font-bold text-[#2D1C13]">₹{lawyer.fee} <span className="text-xs font-normal text-[#70665F]">/ session</span></span>
                    </div>

                    <Link
                      to={`/lawyers/${lawyer.id}`}
                      className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
