import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const sourcer = await prisma.user.upsert({
    where: { email: 'sourcer@beloura.local' },
    update: {},
    create: {
      email: 'sourcer@beloura.local',
      passwordHash: hashedPassword,
      name: 'Alice Sourcer',
      role: 'sourcer',
    },
  });

  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@beloura.local' },
    update: {},
    create: {
      email: 'interviewer@beloura.local',
      passwordHash: hashedPassword,
      name: 'Bob Interviewer',
      role: 'interviewer',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@beloura.local' },
    update: {},
    create: {
      email: 'manager@beloura.local',
      passwordHash: hashedPassword,
      name: 'Carol Manager',
      role: 'chatting_managers',
    },
  });

  // Create admin user "mikey"
  const adminPassword = await bcrypt.hash('Blackpool11-', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'mikey@beloura.local' },
    update: {},
    create: {
      email: 'mikey@beloura.local',
      username: 'mikey',
      passwordHash: adminPassword,
      name: 'Mikey Admin',
      role: 'sourcer', // Using sourcer role as admin role
    },
  });

  console.log('✅ Users created:', { sourcer: sourcer.email, interviewer: interviewer.email, manager: manager.email, admin: admin.username });

  // Create sources
  const sources = await Promise.all([
    prisma.source.upsert({
      where: { name: 'LinkedIn Referral' },
      update: {},
      create: { name: 'LinkedIn Referral', type: 'referral' },
    }),
    prisma.source.upsert({
      where: { name: 'Direct Application' },
      update: {},
      create: { name: 'Direct Application', type: 'direct' },
    }),
    prisma.source.upsert({
      where: { name: 'Job Board' },
      update: {},
      create: { name: 'Job Board', type: 'external' },
    }),
  ]);

  console.log('✅ Sources created:', sources.length);

  // Create referrers
  const referrers = await Promise.all([
    prisma.referrer.upsert({
      where: { name_externalId: { name: 'Jane Smith', externalId: 'REF001' } },
      update: {},
      create: {
        name: 'Jane Smith',
        externalId: 'REF001',
        telegram: '@janesmith',
      },
    }),
    prisma.referrer.upsert({
      where: { name_externalId: { name: 'John Doe', externalId: 'REF002' } },
      update: {},
      create: {
        name: 'John Doe',
        externalId: 'REF002',
        telegram: '@johndoe',
      },
    }),
  ]);

  console.log('✅ Referrers created:', referrers.length);

  // Create sample candidates
  const candidate1 = await prisma.candidate.create({
    data: {
      name: 'Maria Garcia',
      telegram: '@mariagarcia',
      country: 'Philippines',
      timezone: 'Asia/Manila',
      sourceId: sources[0].id,
      referrerId: referrers[0].id,
      currentStage: 'new',
      currentOwner: 'sourcer',
      notes: 'Strong communication skills. Asked thoughtful questions.',
      interviewRating: 2,
    },
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      name: 'Alex Chen',
      telegram: '@alexchen',
      country: 'Singapore',
      timezone: 'Asia/Singapore',
      sourceId: sources[1].id,
      currentStage: 'qualifying',
      currentOwner: 'sourcer',
      notes: 'Needs to improve typing speed before moving forward.',
      interviewRating: 4,
    },
  });

  console.log('✅ Sample candidates created:', { candidate1: candidate1.name, candidate2: candidate2.name });

  console.log('🎉 Seeding complete!');
  console.log('\nTest credentials:');
  console.log('  Email: sourcer@beloura.local');
  console.log('  Email: interviewer@beloura.local');
  console.log('  Email: manager@beloura.local');
  console.log('  Password: password123');
  console.log('\nAdmin credentials:');
  console.log('  Username: mikey');
  console.log('  Email: mikey@beloura.local');
  console.log('  Password: Blackpool11-');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
