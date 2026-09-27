"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import CategoryNav from "./CategoryNav";
import FeaturedCollection from "./FeaturedCollection";
import MasonryGallery from "./MasonryGallery";
import MediaLightbox, { MediaItem } from "./MediaLightbox";

type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];

const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function mapMediaAsset(row: MediaAssetRow): MediaItem {
  const src =
    row.storage_path?.startsWith("http") || row.storage_path?.startsWith("/")
      ? row.storage_path
      : SUPABASE_STORAGE_URL
        ? `${SUPABASE_STORAGE_URL}/${row.storage_path}`
        : row.storage_path ?? "/images/placeholder.jpg";

  return {
    id: row.id,
    src,
    title: row.title,
    category: row.category,
    date: formatDate(row.updated_at),
    locked: row.visibility === "vip",
  };
}

export default function GalleryClient() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => createClient())
      .then(async (supabase) => {
        if (cancelled) return;

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          // Client-side auth guard — redirect if session expired
          router.push("/sign-in");
          return;
        }

        const { data, error: queryError } = await supabase
          .from("media_assets")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(48);

        if (cancelled) return;

        if (queryError) {
          setError(queryError.message);
        } else {
          setMedia((data ?? []).map(mapMediaAsset));
        }
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load media assets.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMedia =
    activeCategory === "All"
      ? media
      : media.filter((m) => m.category === activeCategory);

  return (
    <>
      <CategoryNav
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {activeCategory === "All" && <FeaturedCollection />}

      {error && (
        <p role="alert" style={{ color: "#b42318", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {loading && (
        <p className="admin-table-cell-secondary" style={{ marginTop: "1rem" }}>
          Loading gallery…
        </p>
      )}

      <MasonryGallery items={filteredMedia} onOpenMedia={setActiveMedia} />

      {activeMedia && (
        <MediaLightbox media={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
    </>
  );
}
