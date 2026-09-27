"use client";

import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminWorkspaceContextValue = {
  notify: (message: string) => void;
};

const AdminWorkspaceContext = createContext<AdminWorkspaceContextValue | null>(
  null,
);
const AdminWorkspaceProviderComponent = AdminWorkspaceContext.Provider;

type AdminWorkspaceProviderProps = {
  children: ReactNode;
};

export function AdminWorkspaceProvider({
  children,
}: AdminWorkspaceProviderProps) {
  const [notice, setNotice] = useState("");

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <AdminWorkspaceProviderComponent value={value}>
      <Fragment>
        {children}
        <div
          aria-live="polite"
          className={`admin-toast ${notice ? "admin-toast-visible" : ""}`}
          role="status"
        >
          {notice}
        </div>
      </Fragment>
    </AdminWorkspaceProviderComponent>
  );
}

export function useAdminWorkspace(): AdminWorkspaceContextValue {
  const context = useContext(AdminWorkspaceContext);

  if (!context) {
    throw new Error(
      "useAdminWorkspace must be used inside AdminWorkspaceProvider",
    );
  }

  return context;
}
