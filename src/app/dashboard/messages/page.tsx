import { Metadata } from "next";
import InboxHeader from "@/src/components/dashboard/messages/InboxHeader";
import MessagesClient from "@/src/components/dashboard/messages/MessagesClient";

export const metadata: Metadata = {
  title: "Messages | Midigo",
  description:
    "Your private messages and personalized voice notes from Midigo.",
};

export default function MessagesPage() {
  return (
    <div className="container">
      <InboxHeader />
      <MessagesClient />
    </div>
  );
}
