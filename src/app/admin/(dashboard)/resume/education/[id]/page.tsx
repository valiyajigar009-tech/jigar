import { prisma } from "@/lib/db/prisma";
import { EducationForm } from "@/components/admin/resume/EducationForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const education = await prisma.education.findUnique({
    where: { id }
  });

  if (!education) {
    notFound();
  }

  return <EducationForm initialData={education} />;
}
