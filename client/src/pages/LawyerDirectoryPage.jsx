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
  Navigation,
  Compass,
  Locate,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export const LawyerDirectoryPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  // Location states
  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null,
    addressName: '',
    detected: false
  });
  
  const [locationInput, setLocationInput] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [locationNotice, setLocationNotice] = useState('');

  const specializations = [
    'All Specializations',
    'Corporate & Contract Law',
    'Real Estate & Property Lease',
    'Employment & Labor Law',
    'Startup & Freelance IP Agreements',
    'Criminal & Civil Litigation'
  ];

  useEffect(() => {
    // Automatically attempt browser geolocation on mount
    detectUserLocation();
  }, []);

  // HTML5 Geolocation API Handler
  const detectUserLocation = () => {
    setDetectingLocation(true);
    setLocationNotice('');

    if (!navigator.geolocation) {
      setLocationNotice('HTML5 Geolocation is not supported by your browser. Please search manually by city.');
      setDetectingLocation(false);
      fetchLawyers();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedAddress = 'Your Current Location';

        try {
          // Reverse Geocode using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.district || '';
            const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || 'New Delhi';
            const state = addr.state || 'India';
            detectedAddress = locality ? `${locality}, ${city}, ${state}` : `${city}, ${state}`;
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        const locObj = {
          lat: latitude,
          lng: longitude,
          addressName: detectedAddress,
          detected: true
        };

        setUserLocation(locObj);
        setLocationInput(detectedAddress);
        setDetectingLocation(false);
        fetchLawyers({ lat: latitude, lng: longitude, location: detectedAddress, specialization: selectedSpecialization });
      },
      (error) => {
        console.warn('Geolocation Error:', error);
        setDetectingLocation(false);
        let msg = 'Location permission denied. Enter your city in search bar below to find nearby advocates.';
        if (error.code === error.TIMEOUT) msg = 'Location request timed out. Please enter your city manually.';
        setLocationNotice(msg);
        fetchLawyers({ location: 'New Delhi', specialization: selectedSpecialization });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const fetchLawyers = async (opts = {}) => {
    setLoading(true);
    try {
      const spec = opts.specialization !== undefined ? opts.specialization : selectedSpecialization;
      const specQuery = spec === 'All Specializations' ? '' : spec;

      const loc = opts.location !== undefined ? opts.location : (locationInput || userLocation.addressName);
      const lat = opts.lat !== undefined ? opts.lat : (opts.location ? null : userLocation.lat);
      const lng = opts.lng !== undefined ? opts.lng : (opts.location ? null : userLocation.lng);

      const data = await api.getLawyers({
        specialization: specQuery,
        location: loc,
        lat: lat,
        lng: lng
      });

      setLawyers(data || []);
    } catch (e) {
      console.error('Failed to load lawyers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLawyers({ location: locationInput, specialization: selectedSpecialization, lat: null, lng: null });
  };

  const handleSpecializationChange = (spec) => {
    setSelectedSpecialization(spec);
    fetchLawyers({ specialization: spec, location: locationInput });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1C13] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE3D2] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] border border-[#EAE3D2] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#E07A5F]" />
                  BAR COUNCIL VERIFIED ADVOCATES
                </span>
              </div>
              <h1 className="font-serif-legal text-2xl lg:text-3xl font-bold text-[#2D1C13] mt-1 flex items-center gap-2">
                <Users className="w-7 h-7 text-[#E07A5F]" />
                Legal Practitioner & Advocate Directory
              </h1>
              <p className="text-xs text-[#70665F] mt-1">
                Locate and connect with practicing advocates nearby your current location for expert legal review and consultation.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={detectUserLocation}
                disabled={detectingLocation}
                className="px-4 py-2.5 rounded-xl bg-[#2D1C13] hover:bg-[#422C20] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {detectingLocation ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E07A5F]" />
                ) : (
                  <Locate className="w-4 h-4 text-[#E07A5F]" />
                )}
                <span>{detectingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>
          </div>

          {/* Location & Search Bar */}
          <div className="bg-white border border-[#EAE3D2] p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Geolocation Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] border border-[#EAE3D2] p-3.5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FEF7E0] border border-[#EAE3D2] flex items-center justify-center text-[#E07A5F]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Current Detected Location</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D1C13]">
                    {userLocation.detected ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#137333] animate-pulse"></span>
                        <span>{userLocation.addressName}</span>
                      </>
                    ) : (
                      <span className="text-[#70665F] font-normal">Location not set (Enter city below)</span>
                    )}
                  </div>
                </div>
              </div>

              {locationNotice && (
                <div className="text-[11px] text-amber-800 bg-[#FEF7E0] border border-[#EAE3D2] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{locationNotice}</span>
                </div>
              )}
            </div>

            {/* Location & Specialty Search Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <MapPin className="w-4 h-4 text-[#E07A5F] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter city or locality (e.g., Muradnagar, Sojat, Ghaziabad, Jaipur, Delhi...)"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D1C13] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search Advocates Nearby</span>
              </button>
            </form>

            {/* Specialization Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {specializations.map((spec) => {
                const isActive = (selectedSpecialization === spec) || (spec === 'All Specializations' && !selectedSpecialization);
                return (
                  <button
                    key={spec}
                    onClick={() => handleSpecializationChange(spec === 'All Specializations' ? '' : spec)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#2D1C13] text-[#FAF8F5] border-[#2D1C13] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#70665F] border-[#EAE3D2] hover:border-[#2D1C13] hover:text-[#2D1C13]'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F] space-y-3">
              <RefreshCw className="w-6 h-6 text-[#E07A5F] animate-spin mx-auto" />
              <p>Searching verified advocates nearby your location...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="bg-white border border-[#EAE3D2] p-12 rounded-2xl text-center text-xs text-[#70665F] space-y-2">
              <AlertCircle className="w-8 h-8 text-[#E07A5F] mx-auto" />
              <p className="font-bold text-[#2D1C13]">No Advocates Found Nearby</p>
              <p>Try searching for a major city or changing your specialization filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Small Town / Expanded Range Notification Banner */}
              {lawyers[0]?.distanceKm && parseFloat(lawyers[0].distanceKm) > 10 && (
                <div className="bg-[#FEF7E0] border border-[#EAE3D2] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#2D1C13]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#2D1C13] text-[#E07A5F] flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#2D1C13] block">Expanded Search Radius Active</span>
                      <span className="text-[11px] text-[#70665F]">
                        Expanded search area to nearby district & court centers to display {lawyers.length} real advocates (sorted closest first).
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#E07A5F] text-white px-2.5 py-1 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
                    Nearest: {lawyers[0].distanceKm}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lawyers.map((lawyer) => (
                  <div key={lawyer.id} className="figma-card figma-card-hover p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                    
                    <div className="space-y-3.5">
                      
                      {/* Header with Distance & Rating */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#2D1C13] text-[#E07A5F] border border-[#EAE3D2] flex items-center justify-center font-bold text-lg font-serif-legal shrink-0">
                            {lawyer.name.replace('Advocate ', '').charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-serif-legal text-base font-bold text-[#2D1C13] line-clamp-1">
                              {lawyer.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[11px] text-[#137333] font-semibold mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#137333]" />
                              <span>Verified Advocate</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-amber-800 text-xs font-bold bg-[#FEF7E0] px-2 py-0.5 rounded border border-[#EAE3D2]">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{lawyer.rating || 4.9}</span>
                          </div>
                          {lawyer.distanceKm && (
                            <span className="text-[10px] font-bold text-[#E07A5F] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE3D2]">
                              📍 {lawyer.distanceKm}
                            </span>
                          )}
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
                          <span className="line-clamp-1">{lawyer.location} ({lawyer.experience} Yrs Exp)</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#70665F]">
                          <Globe className="w-3.5 h-3.5 text-[#70665F] shrink-0" />
                          <span>Languages: {lawyer.languages}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#70665F] line-clamp-2 leading-relaxed pt-1 border-t border-[#EAE3D2]/60">
                        {lawyer.bio}
                      </p>
                    </div>

                    {/* Fee & Action Buttons */}
                    <div className="pt-4 border-t border-[#EAE3D2] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#70665F] uppercase font-bold block">Consultation Fee</span>
                        <span className="font-serif-legal text-lg font-bold text-[#2D1C13]">
                          ₹{lawyer.fee} <span className="text-[10px] font-normal text-[#70665F]">/ session</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {lawyer.mapsUrl && (
                          <a
                            href={lawyer.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Get Google Maps Directions"
                            className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:bg-[#FEF7E0] text-[#70665F] hover:text-[#E07A5F] transition-all"
                          >
                            <Navigation className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          to={`/lawyers/${lawyer.id}`}
                          className="px-3.5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C85A32] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
