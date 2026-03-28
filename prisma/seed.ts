import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  const tasks = [
    { title: 'Research Next.js 15 best practices', completed: true },
    { title: 'Implement AI streaming backend', completed: true },
    { title: 'Design premium glassmorphism dashboard', completed: true },
    { title: 'Add task prioritization system', completed: false },
    { title: 'Optimize API response times', completed: false },
    { title: 'Write comprehensive documentation', completed: false },
  ];

  for (const task of tasks) {
    const t = await prisma.task.create({
      data: task,
    });
    console.log(`Created task with id: ${t.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
