import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding instructors...');

  const instructors = [
    {
      name: 'Alex Mercer',
      certificationLevel: 4,
      email: 'alex.mercer@sunshine.ca',
      phone: '403-555-0101',
      isActive: true,
    },
    {
      name: 'Brianna Cole',
      certificationLevel: 4,
      email: 'brianna.cole@sunshine.ca',
      phone: '403-555-0102',
      isActive: true,
    },
    {
      name: 'Carlos Vega',
      certificationLevel: 3,
      email: 'carlos.vega@sunshine.ca',
      phone: '403-555-0103',
      isActive: true,
    },
    {
      name: 'Dana Kim',
      certificationLevel: 3,
      email: 'dana.kim@sunshine.ca',
      phone: '403-555-0104',
      isActive: true,
    },
    {
      name: 'Ethan Walsh',
      certificationLevel: 2,
      email: 'ethan.walsh@sunshine.ca',
      phone: '403-555-0105',
      isActive: true,
    },
    {
      name: 'Fiona Bell',
      certificationLevel: 2,
      email: 'fiona.bell@sunshine.ca',
      phone: '403-555-0106',
      isActive: true,
    },
    {
      name: 'George Park',
      certificationLevel: 1,
      email: 'george.park@sunshine.ca',
      phone: '403-555-0107',
      isActive: true,
    },
    {
      name: 'Hana Tanaka',
      certificationLevel: 1,
      email: 'hana.tanaka@sunshine.ca',
      phone: '403-555-0108',
      isActive: true,
    },
    {
      name: 'Ivan Petrov',
      certificationLevel: 3,
      email: 'ivan.petrov@sunshine.ca',
      phone: '403-555-0109',
      isActive: true,
    },
    {
      name: 'Julia Santos',
      certificationLevel: 2,
      email: 'julia.santos@sunshine.ca',
      phone: '403-555-0110',
      isActive: false,
    },
  ];

  // Clear existing and re-seed
  await prisma.instructor.deleteMany({});

  for (const instructor of instructors) {
    await prisma.instructor.create({ data: instructor });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
