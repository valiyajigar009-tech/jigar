import { prisma } from "@/lib/db/prisma";
import { SocialsForm } from "@/components/admin/socials/SocialsForm";

export const dynamic = "force-dynamic";

export default async function SocialsPage() {
  let settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  
  if (!settings) {
    settings = await prisma.globalSettings.create({ data: { id: 1 } });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Social Links</h1>
          <p className="text-slate-400">Manage your sidebar social icons and contact links</p>
        </div>
      </div>

      <SocialsForm initialData={settings} />
    </div>
  );
}
