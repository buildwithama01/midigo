"use client";

import ChatterPageHeader from "./ChatterPageHeader";
import RealtimeRoomChat from "@/components/chat/RealtimeRoomChat";

export default function LiveRoomsClient() {
  return (
    <div className="chatter-live-page">
      <ChatterPageHeader
        eyebrow="Live operations"
        title="Live rooms"
        description="Join live rooms, follow messages in real time, and reply as Chatter."
      />
      <RealtimeRoomChat />
    </div>
  );
}
