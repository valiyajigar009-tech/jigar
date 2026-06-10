import { prisma } from "@/lib/db/prisma";
import { ExperienceForm } from "@/components/admin/resume/ExperienceForm";
import { notFound } from "next/navigation";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const experience = await prisma.experience.findUnique({
    where: { id }
  });

  if (!experience) {
    notFound();
  }

  return <ExperienceForm initialData={experience} />;
}
