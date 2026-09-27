import type { Metadata } from "next";
import AdminShell from "@/src/components/admin/AdminShell";
import "@/src/components/admin/admin.css";

export const metadata: Metadata = {
  title: "Admin | Midigo",
  description: "Manage Midigo users, content, rooms, safety, and platform settings.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
