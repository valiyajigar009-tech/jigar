import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AccountForm } from "@/components/admin/account/AccountForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true }
  });

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">My Account</h1>
          <p className="text-slate-400">Manage your admin login credentials and profile</p>
        </div>
      </div>

      <AccountForm initialData={{ name: user.name, email: user.email }} />
    </div>
  );
}
