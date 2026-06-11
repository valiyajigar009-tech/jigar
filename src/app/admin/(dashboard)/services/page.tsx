import { prisma } from "@/lib/db/prisma";
import { Plus, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/admin/ui/Button";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Services</h1>
          <p className="text-slate-400">Manage your "WHAT I DO" offerings</p>
        </div>
        <Link href="/admin/services/new">
          <Button className="gap-2">
            <Plus size={16} /> Add Service
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
            <p className="text-slate-500 mb-4">No services added yet.</p>
            <Link href="/admin/services/new">
              <Button variant="outline">Add Your First Service</Button>
            </Link>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 group transition-all hover:border-indigo-500/50">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  {service.icon?.substring(0, 2).toUpperCase() || "SV"}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/services/${service.id}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <Edit3 size={14} />
                    </Button>
                  </Link>
                  {/* Note: Delete logic should ideally be a client component, but for simplicity we will just handle edit here. */}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3">{service.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
