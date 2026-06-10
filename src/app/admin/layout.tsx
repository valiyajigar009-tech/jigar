import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "Admin Panel | Dashboard",
  description: "Manage your portfolio content",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className={`${inter.variable} ${outfit.variable} font-sans`}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}
