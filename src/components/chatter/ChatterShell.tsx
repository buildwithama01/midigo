"use client";

import { useState } from "react";

import ChatterHeader from "./ChatterHeader";
import ChatterSidebar from "./ChatterSidebar";
import { ChatterWorkspaceProvider } from "./ChatterWorkspaceContext";

export default function ChatterShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ChatterWorkspaceProvider>
      <div className="chatter-app">
        <ChatterHeader
          mobileNavOpen={mobileNavOpen}
          onMobileNavChange={setMobileNavOpen}
        />
        <div className="chatter-workspace">
          <ChatterSidebar
            mobileNavOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            onNavigate={() => setMobileNavOpen(false)}
          />
          <main className="chatter-main">{children}</main>
        </div>

      </div>
    </ChatterWorkspaceProvider>
  );
}
