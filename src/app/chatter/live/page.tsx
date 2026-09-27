import type { Metadata } from "next";
import LiveRoomsClient from "@/src/components/chatter/LiveRoomsClient";

export const metadata: Metadata = {
  title: "Live Rooms | Chatter | Midigo",
  description: "Monitor live rooms, reply as Chatter, and manage room controls.",
};

export default function LiveRoomsPage() {
  return <LiveRoomsClient />;
}
