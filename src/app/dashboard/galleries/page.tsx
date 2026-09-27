import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import GalleryHeader from "@/src/components/dashboard/galleries/GalleryHeader";
import GalleryClient from "@/src/components/dashboard/galleries/GalleryClient";

export const metadata: Metadata = {
  title: "Media Vault | Midigo",
  description: "Browse Midigo's private collection of high-resolution digital photography.",
};

export default async function GalleriesPage() {
  // Server-side auth guard — redirect unauthenticated users to sign in.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/sign-in");
    }
  }

  return (
    <div className="container">
      <GalleryHeader />
      <GalleryClient />
    </div>
  );
}
