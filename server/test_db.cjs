const { PrismaClient } = require('@prisma/client');

async function test(url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  const start = Date.now();
  await prisma.document.findMany({ take: 1 });
  const end = Date.now();
  console.log(`Time: ${end - start}ms`);
  await prisma.$disconnect();
}

(async () => {
  console.log("Direct (5432):");
  await test("postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres");
  
  console.log("Direct + pgbouncer (5432):");
  await test("postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true");
  
  console.log("Pooler (6543):");
  await test("postgresql://postgres.plrtkkkswyueselrkban:Maxplanck%4094@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true");
})();
