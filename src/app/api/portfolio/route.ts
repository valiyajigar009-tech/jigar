import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all required data from Prisma in parallel
    const [globalSettings, heroSection, aboutSection, skills, services, experiences, educations, projects] = await Promise.all([
      prisma.globalSettings.findUnique({ where: { id: 1 } }),
      prisma.heroSection.findUnique({ where: { id: 1 } }),
      prisma.aboutSection.findUnique({ where: { id: 1 } }),
      prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
    ]);

    // Format the response to match what the frontend expects
    const formattedData = {
      about: {
        name: globalSettings?.siteName?.replace(" Portfolio", "") || "Jigar Valiya",
        headline: aboutSection?.headline || "Hello,\nI'm Jigar",
        bio: aboutSection?.longBio || "",
        aboutImageUrl: aboutSection?.aboutImageUrl || "",
        skills: skills.map(s => s.name),
        stats: [
          { label: "Design Tool Proficiency", value: "95%" },
          { label: "Coffee Cups", value: "400+" },
          { label: "Pixel Perfection", value: "100%" }
        ]
      },
      hero: {
        title: heroSection?.headline || "Creative UI/UX Designer",
        email: globalSettings?.contactEmail || "",
        phone: globalSettings?.contactPhone || "",
        location: globalSettings?.address || "India",
        description: heroSection?.description || "",
        imageUrl: heroSection?.heroImage || "",
        bgColor: "#0f172a", // We can add these to GlobalSettings later
        accentColor: "#38bdf8",
        grayscale: false,
        imageFit: "contain",
        imagePosition: "bottom",
        imageMask: false
      },
      socials: {
        instagram: globalSettings?.instagram || "https://www.instagram.com/jigarr_18?igsh=MWhobWQwZW52c2Zlag==",
        linkedin: globalSettings?.linkedin || "https://www.linkedin.com/in/jigar-valiya-b411a8359?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        whatsapp: `https://wa.me/91${globalSettings?.contactPhone ? globalSettings.contactPhone.replace(/[^0-9]/g, '') : "8200951722"}`,
        phone: globalSettings?.contactPhone || "8200951722",
      },
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        icon: s.icon || "Layers",
        description: s.description
      })),
      workflow: [
        {
          id: "w1",
          title: "Research & Strategy",
          description: "Understanding user needs, analyzing competitors, and defining a clear strategy before touching pixels or code."
        },
        {
          id: "w2",
          title: "UI/UX & Graphic Design",
          description: "Crafting intuitive interfaces, striking visual graphics, and interactive high-fidelity prototypes."
        },
        {
          id: "w3",
          title: "Web & App Development",
          description: "Building responsive full-stack web applications and robust, high-performance mobile experiences."
        },
        {
          id: "w4",
          title: "Testing & Deployment",
          description: "Ensuring pixel-perfect implementation, rigorous testing, and seamless launch of the final product."
        }
      ],
      resume: {
        experience: experiences.map(e => ({
          id: e.id,
          role: e.position,
          company: e.company,
          duration: `${new Date(e.startDate).getFullYear()} - ${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}`,
          description: e.description || ""
        })),
        education: educations.map(e => ({
          id: e.id,
          degree: e.degree,
          school: e.institution,
          duration: `${new Date(e.startDate).getFullYear()} - ${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}`,
          description: e.description || ""
        }))
      },
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        imageUrl: p.thumbnail,
        link: p.liveUrl || "#"
      }))
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: "Failed to load data from database" }, { status: 500 });
  }
}

// Disable POST for now as updates happen through the Admin Panel using Server Actions
export async function POST(req: Request) {
  return NextResponse.json({ error: "Method not allowed. Use the Admin Panel to update content." }, { status: 405 });
}
