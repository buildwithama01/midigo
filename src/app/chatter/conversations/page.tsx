import type { Metadata } from "next";
import ConversationsClient from "@/src/components/chatter/ConversationsClient";

export const metadata: Metadata = {
  title: "Conversations | Chatter | Midigo",
  description: "Search and respond to assigned Midigo member conversations.",
};

export default function ConversationsPage() {
  return <ConversationsClient />;
}
