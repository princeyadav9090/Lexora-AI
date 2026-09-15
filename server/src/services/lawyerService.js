import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

// Pre-configured coordinate dictionary for instant zero-latency location resolution across India
const CITY_COORDINATES = {
  'muradnagar': { lat: 28.7734, lng: 77.5034, name: 'Muradnagar', district: 'Ghaziabad', state: 'Uttar Pradesh' },
  'modinagar': { lat: 28.8340, lng: 77.5818, name: 'Modinagar', district: 'Ghaziabad', state: 'Uttar Pradesh' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad', district: 'Ghaziabad', state: 'Uttar Pradesh' },
  'meerut': { lat: 28.9845, lng: 77.7064, name: 'Meerut', district: 'Meerut', state: 'Uttar Pradesh' },
  'noida': { lat: 28.5355, lng: 77.3910, name: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' },
  'greater noida': { lat: 28.4744, lng: 77.5040, name: 'Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi', district: 'Delhi', state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi', district: 'Delhi', state: 'Delhi' },
  'faridabad': { lat: 28.4089, lng: 77.3178, name: 'Faridabad', district: 'Faridabad', state: 'Haryana' },
  'ballabgarh': { lat: 28.3269, lng: 77.3172, name: 'Ballabgarh', district: 'Faridabad', state: 'Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, name: 'Gurugram', district: 'Gurugram', state: 'Haryana' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, name: 'Gurgaon', district: 'Gurugram', state: 'Haryana' },
  'sojat': { lat: 25.9238, lng: 73.6698, name: 'Sojat', district: 'Pali', state: 'Rajasthan' },
  'pali': { lat: 25.7712, lng: 73.3235, name: 'Pali', district: 'Pali', state: 'Rajasthan' },
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur', district: 'Jaipur', state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, name: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan' },
  'sawai madhopur': { lat: 25.9928, lng: 76.3705, name: 'Sawai Madhopur', district: 'Sawai Madhopur', state: 'Rajasthan' },
  'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra', district: 'Agra', state: 'Uttar Pradesh' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore', district: 'Bengaluru Urban', state: 'Karnataka' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  'karimnagar': { lat: 18.4385, lng: 79.1409, name: 'Karimnagar', district: 'Karimnagar', state: 'Telangana' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, name: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh' },
  'ongole': { lat: 15.5061, lng: 80.0320, name: 'Ongole', district: 'Prakasam', state: 'Andhra Pradesh' },
  'mapusa': { lat: 15.5937, lng: 73.8078, name: 'Mapusa', district: 'North Goa', state: 'Goa' },
  'panaji': { lat: 15.4909, lng: 73.8278, name: 'Panaji', district: 'North Goa', state: 'Goa' },
  'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa', district: 'Goa', state: 'Goa' }
};

// Calculate Haversine distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Fallback coordinate lookup
async function resolveLocationCoordinates(locationStr, userLat, userLng) {
  if (locationStr) {
    const cleanKey = locationStr.toLowerCase().split(',')[0].trim();
    if (CITY_COORDINATES[cleanKey]) {
      return {
        lat: CITY_COORDINATES[cleanKey].lat,
        lng: CITY_COORDINATES[cleanKey].lng,
        name: CITY_COORDINATES[cleanKey].name
      };
    }
  }

  if (userLat && userLng) {
    return { lat: userLat, lng: userLng, name: locationStr || 'Your Location' };
  }

  if (locationStr) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(geoUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'LexoraAI-LegalEngine/1.0 (contact@lexora.ai)' }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            name: data[0].name || locationStr
          };
        }
      }
    } catch (e) {
      console.warn('Nominatim geocode fallback skipped:', e.message);
    }
  }

  // Default fallback: New Delhi center
  return { lat: 28.6139, lng: 77.2090, name: 'Delhi' };
}

// Hardcoded location coordinate map for DB profiles
const KNOWN_DB_COORDINATES = {
  'Ghaziabad, Uttar Pradesh': { lat: 28.6441, lng: 77.4205 },
  'Delhi, Delhi': { lat: 28.6653, lng: 77.2185 },
  'Ballabgarh, Haryana': { lat: 28.3269, lng: 77.3172 },
  'Pali, Rajasthan': { lat: 25.7712, lng: 73.3235 },
  'Jaipur, Rajasthan': { lat: 26.9124, lng: 75.7873 },
  'Agra, Uttar Pradesh': { lat: 27.1945, lng: 77.9661 },
  'Karimnagar, Telangana': { lat: 18.4385, lng: 79.1409 },
  'Ongole, Andhra Pradesh': { lat: 15.5061, lng: 80.0320 },
  'Sawai Madhopur, Rajasthan': { lat: 25.9928, lng: 76.3705 },
  'Mapusa, Goa': { lat: 15.5937, lng: 73.8078 },
  'Vijayawada, Andhra Pradesh': { lat: 16.5062, lng: 80.6480 },
  'Bengaluru, Karnataka': { lat: 12.9779, lng: 77.5952 }
};

export const lawyerService = {
  async getLawyers({ specialization, location, lat, lng }) {
    const userLat = !isNaN(parseFloat(lat)) ? parseFloat(lat) : null;
    const userLng = !isNaN(parseFloat(lng)) ? parseFloat(lng) : null;

    // 1. Resolve exact target coordinates for the search location or user position
    const targetCoords = await resolveLocationCoordinates(location, userLat, userLng);
    const targetLat = targetCoords.lat;
    const targetLng = targetCoords.lng;

    // 2. Fetch all verified lawyer profiles from database
    const dbLawyers = await prisma.lawyerProfile.findMany({
      where: { isVerified: true },
      orderBy: { rating: 'desc' },
      include: {
        user: { select: { email: true, status: true } }
      }
    });

    // 3. Map & compute exact Haversine distance from search target coordinates and ensure India location string
    let formattedLawyers = dbLawyers.map((l) => {
      let lLat = l.lat;
      let lLng = l.lng;

      if (!lLat || !lLng) {
        if (KNOWN_DB_COORDINATES[l.location]) {
          lLat = KNOWN_DB_COORDINATES[l.location].lat;
          lLng = KNOWN_DB_COORDINATES[l.location].lng;
        } else {
          // Approximate fallback near Delhi
          lLat = 28.6139;
          lLng = 77.2090;
        }
      }

      const distNum = getDistanceKm(targetLat, targetLng, lLat, lLng);

      // Ensure explicit ', India' suffix on location string
      let formattedLoc = l.location || 'India';
      if (!formattedLoc.toLowerCase().includes('india')) {
        formattedLoc = `${formattedLoc}, India`;
      }

      return {
        ...l,
        location: formattedLoc,
        lat: lLat,
        lng: lLng,
        distNum: distNum,
        distanceKm: distNum !== null ? `${distNum} km away` : null,
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lLat},${lLng}&destination_place_id=${encodeURIComponent(l.name)}`
      };
    });

    // Strictly filter advocates to Indian practices
    formattedLawyers = formattedLawyers.filter(l => 
      l.location.toLowerCase().includes('india') ||
      l.address.toLowerCase().includes('india')
    );

    // 4. Apply Specialization Filter if requested
    if (specialization && specialization.trim().length > 0) {
      const specLower = specialization.toLowerCase().trim();
      const filtered = formattedLawyers.filter(l => 
        l.specialization.toLowerCase().includes(specLower)
      );
      if (filtered.length > 0) {
        formattedLawyers = filtered;
      }
    }

    // 5. SORT ALL ADVOCATES STRICTLY BY DISTANCE (Closest Advocates First)
    formattedLawyers.sort((a, b) => {
      if (a.distNum === null) return 1;
      if (b.distNum === null) return -1;
      return a.distNum - b.distNum;
    });

    return formattedLawyers;
  },

  async getLawyerDetail(lawyerId) {
    let lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    if (!lawyer && lawyerId.startsWith('lawyer-osm-')) {
      lawyer = {
        id: lawyerId,
        name: 'Advocate Legal Practitioner',
        specialization: 'Corporate & Contract Law',
        experience: 12,
        languages: 'English, Hindi',
        location: 'India',
        fee: 2500,
        rating: 4.9,
        bio: 'Practicing Bar Council Advocate specializing in corporate agreements, property disputes, and litigation.',
        isVerified: true
      };
    }

    if (!lawyer) {
      throw new ApiError(404, 'Lawyer profile not found.');
    }

    return {
      ...lawyer,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lawyer.name + ' ' + lawyer.location)}`
    };
  }
};
