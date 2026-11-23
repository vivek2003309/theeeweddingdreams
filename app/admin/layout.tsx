import type { Metadata } from "next";
import { AdminStoreProvider } from "@/components/admin/AdminStoreContext";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin CMS — The Wedding Dreams",
  description:
    "Private concierge workspace for hero curation, partner verification, listings management, and couple leads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
