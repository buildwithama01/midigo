import type { Metadata } from "next";
import ModerationClient from "@/src/components/chatter/ModerationClient";

export const metadata: Metadata = {
  title: "Moderation | Chatter | Midigo",
  description: "Review flagged messages and take moderation actions in Midigo live rooms.",
};

export default function ModerationPage() {
  return <ModerationClient />;
}
