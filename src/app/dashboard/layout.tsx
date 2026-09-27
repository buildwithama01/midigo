import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import DashboardFooter from "@/src/components/dashboard/DashboardFooter";
import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/config";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Database } from "@/src/lib/supabase/database.types";

type DashboardProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "name" | "handle" | "avatar_url" | "email"
>;

export const metadata: Metadata = {
  title: "Dashboard | Midigo",
  description: "Your Midigo Fan Dashboard.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, handle, avatar_url, email")
    .eq("id", user.id)
    .maybeSingle();
  const initialProfile: DashboardProfile = {
    id: user.id,
    name: profile?.name ?? user.user_metadata?.name ?? null,
    handle: profile?.handle ?? null,
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? profile?.email ?? "",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
      }}
    >
      <DashboardHeader initialProfile={initialProfile} />
      <main style={{ flex: 1, padding: "3rem 0" }}>{children}</main>
      <DashboardFooter />
    </div>
  );
}
