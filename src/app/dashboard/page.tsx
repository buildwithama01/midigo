import WelcomeSection from "@/src/components/dashboard/WelcomeSection";
import LiveStatus from "@/src/components/dashboard/LiveStatus";
import FanProfileSummary from "@/src/components/dashboard/FanProfileSummary";
import FanActivity from "@/src/components/dashboard/FanActivity";
import FeaturedRooms from "@/src/components/dashboard/FeaturedRooms";
import LatestUpdates from "@/src/components/dashboard/LatestUpdates";
import { getDashboardOverviewData } from "@/src/lib/supabase/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardOverviewData();
  const liveRooms = data.rooms.filter((room) => room.status === "live");
  const activeParticipants = liveRooms.reduce(
    (total, room) => total + room.current_participants,
    0,
  );

  return (
    <div className="container">
      {/* Top area - Welcome & Live Status */}
      <WelcomeSection
        name={data.profile?.name ?? null}
        activeParticipants={activeParticipants}
        liveRoomCount={liveRooms.length}
      />
      <LiveStatus room={liveRooms[0] ?? null} />

      {/* Main Editorial Grid */}
      <div className="dashboard-grid">
        {/* Left Column (Content & Rooms) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <FeaturedRooms rooms={data.rooms} />
          <LatestUpdates articles={data.articles} />
        </div>

        {/* Right Column (Profile & Activity) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <FanProfileSummary profile={data.profile} />
          <FanActivity conversations={data.conversations} />
        </div>
      </div>

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 7fr 4fr;
            gap: 4rem;
          }
        }
      `}</style>
    </div>
  );
}
