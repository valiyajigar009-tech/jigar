"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, FolderKanban, FileText, Settings, User, LogOut, Menu, X, Image, Mail, Layers, BookOpen, Share2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "@/components/admin/ui/NotificationBadge";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "About Me", icon: User },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/resume", label: "My Story", icon: BookOpen },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/socials", label: "Social Links", icon: Share2 },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/account", label: "My Account", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Open sidebar by default only on desktop
  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 h-full bg-slate-900/50 border-r border-slate-800 backdrop-blur-xl transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={cn("font-outfit font-bold text-xl tracking-wide", !isSidebarOpen && "md:hidden")}>
            Admin Panel
          </div>
          {/* Logo icon when collapsed */}
          {!isSidebarOpen && (
            <div className="hidden md:flex w-full justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">A</div>
            </div>
          )}
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
                title={link.label}
              >
                <link.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span className={cn("transition-opacity duration-200", !isSidebarOpen && "md:hidden")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors font-medium text-sm group"
            )}
            title="Logout"
          >
            <LogOut size={20} className="shrink-0 text-slate-400 group-hover:text-white" />
            <span className={cn("transition-opacity duration-200", !isSidebarOpen && "md:hidden")}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800 z-30">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <NotificationBadge />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{session?.user?.name || "Admin"}</div>
                <div className="text-xs text-slate-500">{session?.user?.email}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
