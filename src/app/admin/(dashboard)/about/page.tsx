import { prisma } from "@/lib/db/prisma";
import { AboutForm } from "@/components/admin/about/AboutForm";

export default async function AboutPage() {
  let about = await prisma.aboutSection.findUnique({ where: { id: 1 } });
  
  if (!about) {
    about = await prisma.aboutSection.create({ data: { id: 1 } });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">About Me</h1>
          <p className="text-slate-400">Manage your bio, photo, and personal story</p>
        </div>
      </div>

      <AboutForm initialData={about} />
    </div>
  );
}
