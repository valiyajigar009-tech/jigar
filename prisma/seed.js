
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created/verified.");

  // 2. Setup Global Settings
  const settings = await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "Jigar Portfolio",
      siteDescription: "Creative UI/UX Designer and Developer",
      contactEmail: "admin@example.com",
      contactPhone: "8200951722",
      address: "India",
      instagram: "https://www.instagram.com/jigarr_18?igsh=MWhobWQwZW52c2Zlag==",
      linkedin: "https://www.linkedin.com/in/jigar-valiya-b411a8359?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    }
  });
  console.log("GlobalSettings created.");

  // 3. Hero Section
  const hero = await prisma.heroSection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      headline: "Hello,\nI`m Jigar",
      subheadline: "Creative UI/UX Designer",
      description: "I am an MCA student specializing in UI/UX and graphic design. I bridge the gap between design and development by combining my foundation in web technologies with a passion for visual design.",
      primaryCtaText: "View Work",
      primaryCtaLink: "/#projects"
    }
  });
  console.log("HeroSection created.");

  // 4. About Section
  const about = await prisma.aboutSection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      headline: "About Me",
      longBio: "I am Jigar Valiya, an MCA student specializing in UI/UX and graphic design. I bridge the gap between design and development by combining my foundation in web technologies (HTML, CSS, JS, PHP, MySQL) with a passion for branding and visual design. My focus is on transforming complex ideas into intuitive, user-centered digital experiences through research, wireframing, and thoughtful interface design.",
    }
  });
  console.log("AboutSection created.");

  // 5. Default Services (Only insert if DB has 0 services)
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          title: "UI/UX Design",
          description: "Creating intuitive, attractive, and user-centric interfaces.",
          icon: "Layers",
          sortOrder: 1
        },
        {
          title: "Web Development",
          description: "Building responsive and scalable full-stack web applications.",
          icon: "Code2",
          sortOrder: 2
        },
        {
          title: "Graphic Design",
          description: "Crafting striking visual graphics and branding materials.",
          icon: "Sparkles",
          sortOrder: 3
        }
      ]
    });
    console.log("Default Services created.");
  }

  // 6. Default Projects (Only insert if DB has 0)
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        title: "Sample E-commerce Project",
        slug: "sample-ecommerce",
        shortDescription: "A fully functional e-commerce UI design.",
        fullDescription: "This is a detailed description of the e-commerce project showcasing product listing, cart, and checkout flow.",
        thumbnail: "https://via.placeholder.com/800x600?text=Project+1",
        category: "UI/UX",
        status: "PUBLISHED"
      }
    });
    console.log("Default Project created.");
  }
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

