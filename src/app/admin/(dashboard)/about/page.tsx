import { prisma } from "@/lib/db/prisma";
import { AboutForm } from "@/components/admin/about/AboutForm";

export default async function AboutPage() {
  try {
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
  } catch (error) {
    // Defensive fallback: render the form with empty initial data instead of letting the page hang
    // This helps when the database is unreachable or throws in dev environments
    console.error("AboutPage error:", error);
    const fallback = { headline: "", longBio: "", aboutImageUrl: "" };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-outfit">About Me</h1>
            <p className="text-slate-400">Manage your bio, photo, and personal story</p>
          </div>
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          Failed to load about data — showing fallback form. Check server logs or DB connection.
        </div>

        <AboutForm initialData={fallback} />
      </div>
    );
  }
}
