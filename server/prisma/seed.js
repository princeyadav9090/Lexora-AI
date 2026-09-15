import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateLegalDocument } from '../services/documentGenerator.js';
import { processAndChunkDocument } from '../services/ragService.js';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Lexora AI database seeding...');

  // Clean old records
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.lawyerProfile.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(env.SEED_USER_PASSWORD, 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: env.SEED_ADMIN_EMAIL,
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. Create Demo Client User
  const demoUser = await prisma.user.create({
    data: {
      email: 'user@lexora.ai',
      name: 'Rahul Mehta',
      passwordHash: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE'
    }
  });

  // 3. Create Demo Lawyers
  const lawyerUsers = [
    {
      email: 'rajesh.verma@lawyers.in',
      name: 'Advocate Rajesh Verma',
      specialization: 'Corporate & Contract Law',
      experience: 12,
      languages: 'English, Hindi',
      location: 'New Delhi, India',
      fee: 3500,
      rating: 4.9,
      bio: 'Senior advocate at Delhi High Court specializing in commercial NDA agreements, corporate structuring, and M&A compliance.'
    },
    {
      email: 'priya.sharma@lawyers.in',
      name: 'Advocate Priya Sharma',
      specialization: 'Real Estate & Property Lease',
      experience: 9,
      languages: 'English, Kannada, Hindi',
      location: 'Bengaluru, Karnataka',
      fee: 2500,
      rating: 4.8,
      bio: 'Legal consultant with expertise in commercial lease deeds, residential rental agreements, and Karnataka RERA compliance.'
    },
    {
      email: 'vikram.singh@lawyers.in',
      name: 'Advocate Vikramaditya Singh',
      specialization: 'Employment & Labor Law',
      experience: 15,
      languages: 'English, Hindi, Marathi',
      location: 'Mumbai, Maharashtra',
      fee: 4000,
      rating: 5.0,
      bio: 'Employment law specialist assisting tech startups and enterprises with executive contracts, IP assignment, and severance terms.'
    },
    {
      email: 'ananya.iyer@lawyers.in',
      name: 'Advocate Ananya Iyer',
      specialization: 'Startup & Freelance IP Agreements',
      experience: 7,
      languages: 'English, Telugu, Tamil',
      location: 'Hyderabad, Telangana',
      fee: 2000,
      rating: 4.7,
      bio: 'Tech-focused legal practitioner assisting freelancers and agency owners in drafting airtight master service agreements.'
    }
  ];

  for (const l of lawyerUsers) {
    const user = await prisma.user.create({
      data: {
        email: l.email,
        name: l.name,
        passwordHash: userPasswordHash,
        role: 'LAWYER',
        status: 'ACTIVE'
      }
    });

    await prisma.lawyerProfile.create({
      data: {
        userId: user.id,
        name: l.name,
        specialization: l.specialization,
        experience: l.experience,
        languages: l.languages,
        location: l.location,
        fee: l.fee,
        rating: l.rating,
        bio: l.bio,
        isVerified: true
      }
    });
  }

  // 4. Create Sample Generated Documents for Demo User
  const ndaAnswers = {
    disclosingParty: 'Lexora Technologies Pvt Ltd',
    receivingParty: 'Apex Software Labs',
    purpose: 'Evaluation of AI Legal RAG Search Algorithm Partnership',
    confidentialScope: 'All technical, financial, and business data',
    duration: '2 Years',
    governingState: 'New Delhi'
  };
  const ndaContent = generateLegalDocument('NDA', ndaAnswers);

  const sampleNda = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Mutual Non-Disclosure Agreement (NDA)',
      type: 'NDA',
      jurisdiction: 'IN',
      status: 'READY',
      fileType: 'TXT',
      currentVersion: 1
    }
  });

  await prisma.documentVersion.create({
    data: {
      documentId: sampleNda.id,
      version: 1,
      content: ndaContent,
      structuredData: JSON.stringify(ndaAnswers),
      createdById: demoUser.id,
      changeLog: 'AI Initial Guided Generation'
    }
  });

  await processAndChunkDocument(sampleNda.id, ndaContent);

  const rentalAnswers = {
    landlordName: 'Rajesh Kumar',
    tenantName: 'Rahul Mehta',
    propertyAddress: 'Flat 402, Green Park Heights, Indiranagar, Bengaluru, Karnataka',
    monthlyRent: '32000',
    securityDeposit: '150000',
    startDate: '2026-10-01',
    tenureMonths: '11 Months',
    noticePeriodDays: '30 Days',
    maintenancePayer: 'Tenant',
    governingState: 'Karnataka'
  };
  const rentalContent = generateLegalDocument('RENTAL_AGREEMENT', rentalAnswers);

  const sampleRental = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Residential Rental Agreement - Indiranagar',
      type: 'RENTAL_AGREEMENT',
      jurisdiction: 'IN',
      status: 'READY',
      fileType: 'TXT',
      currentVersion: 1
    }
  });

  await prisma.documentVersion.create({
    data: {
      documentId: sampleRental.id,
      version: 1,
      content: rentalContent,
      structuredData: JSON.stringify(rentalAnswers),
      createdById: demoUser.id,
      changeLog: 'AI Initial Guided Generation'
    }
  });

  await processAndChunkDocument(sampleRental.id, rentalContent);

  // 5. Create Initial Conversation
  const sampleConv = await prisma.conversation.create({
    data: {
      userId: demoUser.id,
      documentId: sampleNda.id,
      title: 'NDA Notice & Disclosure Terms',
      contextMode: 'DOCUMENT'
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: sampleConv.id,
        sender: 'USER',
        content: 'What information is considered confidential in this NDA?'
      },
      {
        conversationId: sampleConv.id,
        sender: 'AI',
        content: 'Confidential Information encompasses all technical, financial, and business data including source code, software architectures, algorithms, financial statements, and strategic roadmaps.',
        explanation: 'You must treat all technical and financial files disclosed by Lexora Technologies as private.',
        relevantClause: 'Clause 2 — Definition of Confidential Information',
        sourceCitation: 'Mutual Non-Disclosure Agreement (NDA) — Clause 2 (Page 1)'
      }
    ]
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`   Admin login: ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  console.log(`   Demo user login: user@lexora.ai / ${env.SEED_USER_PASSWORD}`);
}

main()
  .catch(e => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
