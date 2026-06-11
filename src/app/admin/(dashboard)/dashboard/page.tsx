import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [projectCount, viewCount, unreadMessages] = await Promise.all([
    prisma.project.count(),
    prisma.pageView.count(),
    prisma.message.count({ where: { isRead: false } }),
  ]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {session?.user?.name || 'Admin'}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold">{projectCount}</p>
        </div>
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Total Page Views</h3>
          <p className="text-3xl font-bold">{viewCount}</p>
        </div>
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Unread Messages</h3>
          <p className="text-3xl font-bold">{unreadMessages}</p>
        </div>
      </div>
    </div>
  );
}
