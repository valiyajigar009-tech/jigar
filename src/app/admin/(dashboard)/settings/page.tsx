import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export default async function SettingsPage() {
  let settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  
  if (!settings) {
    settings = await prisma.globalSettings.create({ data: { id: 1 } });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Settings</h1>
          <p className="text-slate-400">Manage global website settings, contact details, and preferences</p>
        </div>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
