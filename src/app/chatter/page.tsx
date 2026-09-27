import type { Metadata } from "next";
import ChatterOverview from "@/src/components/chatter/ChatterOverview";

export const metadata: Metadata = {
  title: "Overview | Chatter | Midigo",
  description: "Review your Chatter queue, live rooms, and moderation alerts.",
};

export default function ChatterOverviewPage() {
  return <ChatterOverview />;
}
