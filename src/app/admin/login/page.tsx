import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Portal Sign In | Midigo",
  description:
    "Secure administrator authentication portal for Midigo control plane.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p>Loading sign-in…</p>}>
      <AdminLoginForm />
    </Suspense>
  );
}
