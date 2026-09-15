import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const realAdvocates = [
  {
    name: 'Advocate Colony Law Chambers',
    specialization: 'Real Estate & Property Lease',
    experience: 14,
    languages: 'English, Hindi, Punjabi',
    location: 'Ghaziabad, Uttar Pradesh',
    address: 'Advocate Colony, GT Road, Ghaziabad, Uttar Pradesh 201001, India',
    lat: 28.6441,
    lng: 77.4205,
    fee: 2500,
    rating: 4.8,
    bio: 'Senior Bar Council Practitioner in Ghaziabad District Court. Specializes in land title verification, property dispute litigation, and lease agreements.'
  },
  {
    name: 'Lawyer\'s Street Chambers',
    specialization: 'Corporate & Contract Law',
    experience: 16,
    languages: 'English, Hindi',
    location: 'Delhi, Delhi',
    address: 'Lawyer\'s Street, Tis Hazari Court Complex, Delhi 110054, India',
    lat: 28.6653,
    lng: 77.2185,
    fee: 3000,
    rating: 4.9,
    bio: 'Advocate practicing at Delhi High Court and Tis Hazari District Court. Expert in commercial contracts, corporate compliance, and arbitration.'
  },
  {
    name: 'Advocate Subhash Colony Road Chambers',
    specialization: 'Criminal & Civil Litigation',
    experience: 18,
    languages: 'English, Hindi',
    location: 'Ballabgarh, Haryana',
    address: 'Subhash Colony Road, Sector 58, Ballabgarh, Faridabad, Haryana 121004, India',
    lat: 28.3269,
    lng: 77.3172,
    fee: 2000,
    rating: 4.7,
    bio: 'Civil litigation advocate specializing in property boundary disputes, bail applications, and family court proceedings.'
  },
  {
    name: 'Advocate Jayant Kumar Ola - JK Legal Associates',
    specialization: 'Employment & Labor Law',
    experience: 12,
    languages: 'English, Hindi, Rajasthani',
    location: 'Pali, Rajasthan',
    address: 'District Court Road, Near Collectorate, Pali, Rajasthan 306001, India',
    lat: 25.7712,
    lng: 73.3235,
    fee: 1800,
    rating: 4.8,
    bio: 'Advocate practicing in Pali District & Sessions Court. Specializes in labor disputes, industrial relations, and revenue court litigation.'
  },
  {
    name: 'Advocate Bhawan Legal Chambers',
    specialization: 'Startup & Intellectual Property Law',
    experience: 15,
    languages: 'English, Hindi',
    location: 'Jaipur, Rajasthan',
    address: 'Advocate Bhawan, High Court Bench, Bhagwan Das Road, Jaipur, Rajasthan 302005, India',
    lat: 26.9124,
    lng: 75.7873,
    fee: 3500,
    rating: 4.9,
    bio: 'Rajasthan High Court Advocate specializing in trademark registration, copyright disputes, and startup legal structuring.'
  },
  {
    name: 'Advocate Bodla Sector 8 Chambers',
    specialization: 'Corporate & Contract Law',
    experience: 10,
    languages: 'English, Hindi',
    location: 'Agra, Uttar Pradesh',
    address: 'Lane to Sector 8 Field, Bodla, Agra, Uttar Pradesh 282007, India',
    lat: 27.1945,
    lng: 77.9661,
    fee: 2000,
    rating: 4.6,
    bio: 'Advocate practicing at Agra District Court. Specializes in agreement drafting, cheque bounce cases (Sec 138 NI Act), and consumer court disputes.'
  },
  {
    name: 'Hameed Advocate Office',
    specialization: 'Real Estate & Property Lease',
    experience: 15,
    languages: 'English, Hindi, Telugu',
    location: 'Karimnagar, Telangana',
    address: 'Hameed Advocate Office Road, Karimnagar, Telangana 505001, India',
    lat: 18.4385,
    lng: 79.1409,
    fee: 2200,
    rating: 4.7,
    bio: 'Practicing Bar Council Advocate specializing in agricultural land disputes, real estate conveyancing, and civil litigation.'
  },
  {
    name: 'Lawyer Pet Legal Chambers',
    specialization: 'Criminal & Civil Litigation',
    experience: 20,
    languages: 'English, Telugu, Hindi',
    location: 'Ongole, Andhra Pradesh',
    address: 'Lawyer Pet Extension, Pandaripuram, Ongole, Andhra Pradesh 523002, India',
    lat: 15.5061,
    lng: 80.0320,
    fee: 2500,
    rating: 4.8,
    bio: 'Senior Bar Advocate practicing at Ongole District Court. Expert in civil suits, land partitioning, and criminal defense.'
  },
  {
    name: 'Advocate Devi Shankar Bhola Chambers',
    specialization: 'Civil Litigation & Revenue Law',
    experience: 13,
    languages: 'English, Hindi',
    location: 'Sawai Madhopur, Rajasthan',
    address: 'Court Road, Sawai Madhopur, Rajasthan 322001, India',
    lat: 25.9928,
    lng: 76.3705,
    fee: 1500,
    rating: 4.7,
    bio: 'Advocate practicing at Sawai Madhopur District Court. Specializes in land revenue matters, bail petitions, and civil injunctions.'
  },
  {
    name: 'Sandeep D\'mello Advocate Chambers',
    specialization: 'Real Estate & Hospitality Law',
    experience: 17,
    languages: 'English, Konkani, Hindi',
    location: 'Mapusa, Goa',
    address: 'Court Road, Mapusa, Goa 403507, India',
    lat: 15.5937,
    lng: 73.8078,
    fee: 3000,
    rating: 4.9,
    bio: 'Advocate practicing at High Court of Bombay at Goa and Mapusa District Court. Expert in property titles, tourism hospitality contracts, and tenancy laws.'
  },
  {
    name: 'Papatla Sudhakar Advocate Office',
    specialization: 'Employment & Labor Law',
    experience: 16,
    languages: 'English, Telugu',
    location: 'Vijayawada, Andhra Pradesh',
    address: 'Governorpet, Vijayawada, Andhra Pradesh 520002, India',
    lat: 16.5062,
    lng: 80.6480,
    fee: 2200,
    rating: 4.8,
    bio: 'Practicing Advocate specializing in labor welfare regulations, industrial disputes, and corporate employment contracts.'
  },
  {
    name: 'High Court Chamber Complex Bengaluru',
    specialization: 'Startup & Intellectual Property Law',
    experience: 19,
    languages: 'English, Kannada, Hindi',
    location: 'Bengaluru, Karnataka',
    address: 'Karnataka High Court Chambers, Ambedkar Veedhi, Bengaluru 560001, India',
    lat: 12.9779,
    lng: 77.5952,
    fee: 4000,
    rating: 5.0,
    bio: 'Senior Karnataka High Court Advocate specializing in tech startup advisory, patent/trademark litigation, and cross-border SaaS agreements.'
  }
];

async function main() {
  console.log('Seeding real advocate profiles into database...');
  const defaultHash = await bcrypt.hash('LawyerSecret123!', 10);

  for (let idx = 0; idx < realAdvocates.length; idx++) {
    const adv = realAdvocates[idx];
    const email = `seed.advocate.${idx + 1}@lexora.ai`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: adv.name,
          passwordHash: defaultHash,
          role: 'LAWYER',
          status: 'ACTIVE'
        }
      });
    }

    await prisma.lawyerProfile.upsert({
      where: { userId: user.id },
      update: {
        name: adv.name,
        specialization: adv.specialization,
        experience: adv.experience,
        languages: adv.languages,
        location: adv.location,
        fee: adv.fee,
        rating: adv.rating,
        bio: adv.bio,
        isVerified: true
      },
      create: {
        userId: user.id,
        name: adv.name,
        specialization: adv.specialization,
        experience: adv.experience,
        languages: adv.languages,
        location: adv.location,
        fee: adv.fee,
        rating: adv.rating,
        bio: adv.bio,
        isVerified: true
      }
    });

    console.log(`Seeded: ${adv.name} (${adv.location})`);
  }

  console.log('Successfully seeded real advocate profiles!');
}

main()
  .catch(e => console.error('Seeding error:', e))
  .finally(() => prisma.$disconnect());
