const { PrismaClient } = require('@prisma/client');

async function testConnection(urlName, url) {
  console.log(`\nTesting ${urlName}: ${url}`);
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error']
  });

  try {
    const user = await prisma.user.findFirst();
    console.log(`SUCCESS ${urlName}: Found user ${user?.email}`);
  } catch (err) {
    console.error(`FAILURE ${urlName}: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await testConnection('Default (5432)', 'postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');
  await testConnection('5432 with SSL', 'postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30');
  await testConnection('6543 pgbouncer', 'postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=30');
}

run();
