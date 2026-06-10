import { prisma } from "@/lib/db/prisma";
import { Plus, Edit3, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/admin/ui/Button";

export default async function ResumePage() {
  const experiences = await prisma.experience.findMany({
    orderBy: { startDate: 'desc' }
  });

  const educations = await prisma.education.findMany({
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold font-outfit mb-2">My Story (Resume)</h1>
        <p className="text-slate-400">Manage your Experience and Education timeline.</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <Briefcase size={24} className="text-indigo-500" /> Experience
          </h2>
          <Link href="/admin/resume/experience/new">
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Experience
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {experiences.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No experience added yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {experiences.map(exp => (
                <div key={exp.id} className="p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg">{exp.position}</h3>
                    <p className="text-indigo-400 font-medium">{exp.company}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(exp.startDate).getFullYear()} - {exp.currentJob ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                    </p>
                  </div>
                  <Link href={`/admin/resume/experience/${exp.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit3 size={14} /> Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <GraduationCap size={24} className="text-indigo-500" /> Education
          </h2>
          <Link href="/admin/resume/education/new">
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Education
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {educations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No education added yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {educations.map(edu => (
                <div key={edu.id} className="p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg">{edu.degree}</h3>
                    <p className="text-indigo-400 font-medium">{edu.institution}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : ""}
                    </p>
                  </div>
                  <Link href={`/admin/resume/education/${edu.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit3 size={14} /> Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
