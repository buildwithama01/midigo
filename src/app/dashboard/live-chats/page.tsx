import { Metadata } from "next";
import ChatsHeader from "@/src/components/dashboard/live-chats/ChatsHeader";
import LiveChatsClient from "@/src/components/dashboard/live-chats/LiveChatsClient";

export const metadata: Metadata = {
  title: "Live Chats | Midigo",
  description: "Participate in Midigo's exclusive Q&A sessions, view upcoming drops, and revisit past broadcasts.",
};

export default function LiveChatsPage() {
  return (
    <div className="container">
      <ChatsHeader />
      <div style={{ maxWidth: "1000px" }}>
        <LiveChatsClient />
      </div>
    </div>
  );
}
