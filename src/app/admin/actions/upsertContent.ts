"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ContentArticlesInsert = Database["public"]["Tables"]["content_articles"]["Insert"];
type ContentArticlesUpdate = Database["public"]["Tables"]["content_articles"]["Update"];

/**
 * Server Action: create or update a content article.
 */
export async function upsertContentAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const statusMap: Record<string, string> = {
    published: "published",
    draft: "draft",
    scheduled: "scheduled",
  };

  if (!values.id) {
    const insertData: ContentArticlesInsert = {
      title: values.Title || "Untitled article",
      type: values.Type || "Article",
      category: values.Category || "Community",
      status: (statusMap[values.Status] || "draft") as "published" | "draft" | "scheduled",
      author_name: values.Author || "Unknown",
    };

    const { error } = await supabase.from("content_articles").insert(insertData);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const updateData: ContentArticlesUpdate = {};

    if (values.Title !== undefined) updateData.title = values.Title;
    if (values.Type !== undefined) updateData.type = values.Type;
    if (values.Category !== undefined) updateData.category = values.Category;
    if (values.Status !== undefined) updateData.status = (statusMap[values.Status] || "draft") as ContentArticlesUpdate["status"];
    if (values.Author !== undefined) updateData.author_name = values.Author;

    const { error } = await supabase
      .from("content_articles")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
