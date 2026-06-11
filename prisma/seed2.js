
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const skCount = await prisma.skill.count();
  if (skCount === 0) {
    await prisma.skill.createMany({
      data: [
        { name: "Figma", category: "Design", proficiency: 95, sortOrder: 1 },
        { name: "UI/UX Design", category: "Design", proficiency: 90, sortOrder: 2 },
        { name: "HTML/CSS", category: "Frontend", proficiency: 85, sortOrder: 3 },
        { name: "Next.js", category: "Frontend", proficiency: 80, sortOrder: 4 },
        { name: "Graphic Design", category: "Design", proficiency: 85, sortOrder: 5 },
        { name: "MySQL", category: "Database", proficiency: 75, sortOrder: 6 }
      ]
    });
    console.log("Skills seeded.");
  }

  const expCount = await prisma.experience.count();
  if(expCount === 0) {
    await prisma.experience.create({
      data: {
        company: "Freelance",
        position: "UI/UX & Web Developer",
        startDate: new Date("2023-01-01"),
        description: "Delivering intuitive design and web solutions for varied clients.",
        sortOrder: 1
      }
    });
    console.log("Experience seeded.");
  }
  
  const eduCount = await prisma.education.count();
  if(eduCount === 0) {
    await prisma.education.create({
      data: {
        institution: "Your University",
        degree: "MCA (Master of Computer Applications)",
        field: "Computer Science",
        startDate: new Date("2022-06-01"),
        description: "Specialized in UI/UX and graphic design alongside software development.",
      }
    });
    console.log("Education seeded.");
  }
}

main().finally(() => prisma.$disconnect());

