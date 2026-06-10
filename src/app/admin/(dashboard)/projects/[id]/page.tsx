import { prisma } from "@/lib/db/prisma";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({
    where: { id }
  });

  if (!project) {
    notFound();
  }

  // Parse JSON fields if they exist
  const initialData = {
    ...project,
    techStack: project.techStack ? JSON.parse(project.techStack) : [],
    gallery: project.gallery ? JSON.parse(project.gallery) : [],
  };

  return <ProjectForm initialData={initialData} />;
}
