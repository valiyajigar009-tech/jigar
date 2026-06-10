import { prisma } from "@/lib/db/prisma";
import { ServiceForm } from "@/components/admin/services/ServiceForm";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const service = await prisma.service.findUnique({
    where: { id }
  });

  if (!service) {
    notFound();
  }

  return <ServiceForm initialData={service} />;
}
