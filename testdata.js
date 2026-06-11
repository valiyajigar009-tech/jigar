
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.service.findMany();
  const p = await prisma.project.findMany();
  const eq = await prisma.experience.findMany();
  const ed = await prisma.education.findMany();
  const sk = await prisma.skill.findMany();
  
  console.log("Services:", s);
  console.log("Projects:", p.length);
  console.log("Experience:", eq.length);
  console.log("Education:", ed.length);
  console.log("Skills:", sk.length);
}
main().finally(() => prisma.$disconnect());

