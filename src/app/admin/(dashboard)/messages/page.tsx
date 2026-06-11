import { prisma } from "@/lib/db/prisma";
import { Mail, MailOpen, Trash2, Search, Download } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { Input } from "@/components/admin/ui/Input";
import { MessagesClient } from "@/components/admin/messages/MessagesClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    where: { isArchived: false }
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Messages</h1>
          <p className="text-slate-400">Manage contact form submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      <MessagesClient initialMessages={messages} />
    </div>
  );
}
