import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Room = Database["public"]["Tables"]["live_rooms"]["Row"];
type Article = Database["public"]["Tables"]["content_articles"]["Row"];
type Conversation = Pick<
  Database["public"]["Tables"]["conversations"]["Row"],
  "id" | "subject" | "updated_at" | "status" | "message_count"
>;

export type DashboardOverviewData = {
  profile: Profile | null;
  rooms: Room[];
  articles: Article[];
  conversations: Conversation[];
};

const EMPTY_DASHBOARD_DATA: DashboardOverviewData = {
  profile: null,
  rooms: [],
  articles: [],
  conversations: [],
};

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  if (!isSupabaseConfigured()) return EMPTY_DASHBOARD_DATA;

  try {
    const supabase = await createClient();
    const [
      {
        data: { user },
      },
      { data: rooms },
      { data: articles },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("live_rooms")
        .select("*")
        .in("status", ["live", "upcoming"])
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .limit(6),
      supabase
        .from("content_articles")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    let profile: Profile | null = null;
    let conversations: Conversation[] = [];

    if (user) {
      const [{ data: profileData }, { data: fan }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("fans")
          .select("id")
          .eq("profile_id", user.id)
          .maybeSingle(),
      ]);
      profile = profileData;

      if (fan) {
        const { data: conversationData } = await supabase
          .from("conversations")
          .select("id, subject, updated_at, status, message_count")
          .eq("fan_id", fan.id)
          .order("updated_at", { ascending: false })
          .limit(3);
        conversations = conversationData ?? [];
      }
    }

    return {
      profile,
      rooms: rooms ?? [],
      articles: articles ?? [],
      conversations,
    };
  } catch {
    return EMPTY_DASHBOARD_DATA;
  }
}
