"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminFooter from "./AdminFooter";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { AdminWorkspaceProvider } from "./AdminWorkspaceContext";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AdminWorkspaceProvider>
        <div className="admin-app admin-login-app">
          {children}
        </div>
      </AdminWorkspaceProvider>
    );
  }

  return (
    <AdminWorkspaceProvider>
      <div className="admin-app">
        <AdminHeader
          mobileNavOpen={mobileNavOpen}
          onMobileNavChange={setMobileNavOpen}
        />
        <div className="admin-workspace">
          <AdminSidebar
            mobileNavOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />
          <main className="admin-main">
            <div className="admin-container">{children}</div>
            <div className="admin-container">
              <AdminFooter />
            </div>
          </main>
        </div>
      </div>
    </AdminWorkspaceProvider>
  );
}
