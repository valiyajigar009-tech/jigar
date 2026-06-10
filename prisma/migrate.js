const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration...");
  
  const dataPath = path.join(__dirname, '../src/data/portfolio.json');
  if (!fs.existsSync(dataPath)) {
    console.error("portfolio.json not found!");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 1. Migrate Global Settings & Hero
  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {
      siteName: data.about?.name + " Portfolio" || "My Portfolio",
      contactEmail: data.hero?.email || "valiyajigar009@gmail.com",
      contactPhone: data.hero?.phone || "",
    },
    create: {
      siteName: data.about?.name + " Portfolio" || "My Portfolio",
      contactEmail: data.hero?.email || "valiyajigar009@gmail.com",
      contactPhone: data.hero?.phone || "",
    }
  });

  await prisma.heroSection.upsert({
    where: { id: 1 },
    update: {
      headline: data.hero?.title || "Welcome",
      description: data.hero?.description || "",
      heroImage: data.hero?.imageUrl || "",
      bgImage: "", // Will use Global color settings
    },
    create: {
      headline: data.hero?.title || "Welcome",
      description: data.hero?.description || "",
      heroImage: data.hero?.imageUrl || "",
      bgImage: "",
    }
  });

  // 2. Migrate About Section
  await prisma.aboutSection.upsert({
    where: { id: 1 },
    update: {
      headline: data.about?.headline || "About Me",
      longBio: data.about?.bio || "",
      aboutImageUrl: data.about?.aboutImageUrl || "",
    },
    create: {
      headline: data.about?.headline || "About Me",
      longBio: data.about?.bio || "",
      aboutImageUrl: data.about?.aboutImageUrl || "",
    }
  });

  // 3. Migrate Skills
  if (data.about?.skills && Array.isArray(data.about.skills)) {
    // Clear existing to avoid duplicates during multiple runs
    await prisma.skill.deleteMany();
    for (const [index, skill] of data.about.skills.entries()) {
      await prisma.skill.create({
        data: {
          name: skill,
          sortOrder: index,
        }
      });
    }
  }

  // 4. Migrate Services
  if (data.services && Array.isArray(data.services)) {
    await prisma.service.deleteMany();
    for (const [index, srv] of data.services.entries()) {
      await prisma.service.create({
        data: {
          title: srv.title,
          description: srv.description,
          icon: srv.icon,
          sortOrder: index,
        }
      });
    }
  }

  // 5. Migrate Experience
  if (data.resume?.experience && Array.isArray(data.resume.experience)) {
    await prisma.experience.deleteMany();
    for (const [index, exp] of data.resume.experience.entries()) {
      await prisma.experience.create({
        data: {
          company: exp.company || "Unknown",
          position: exp.role || "Unknown",
          startDate: new Date("2020-01-01"), // placeholder
          endDate: exp.duration?.includes("Present") ? null : new Date(),
          description: exp.description,
          sortOrder: index,
        }
      });
    }
  }

  // 6. Migrate Education
  if (data.resume?.education && Array.isArray(data.resume.education)) {
    await prisma.education.deleteMany();
    for (const [index, edu] of data.resume.education.entries()) {
      await prisma.education.create({
        data: {
          institution: edu.school || "Unknown",
          degree: edu.degree || "Unknown",
          startDate: new Date("2020-01-01"), // placeholder
          description: edu.description,
          sortOrder: index,
        }
      });
    }
  }

  // 7. Migrate Projects
  if (data.projects && Array.isArray(data.projects)) {
    await prisma.project.deleteMany();
    for (const proj of data.projects) {
      await prisma.project.create({
        data: {
          title: proj.title,
          slug: proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          shortDescription: "",
          fullDescription: "",
          thumbnail: proj.imageUrl || "",
          category: proj.category || "Design",
          liveUrl: proj.link || "",
          status: "PUBLISHED",
        }
      });
    }
  }

  console.log("Migration completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
