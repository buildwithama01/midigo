"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatterWorkspaceContextValue = {
  online: boolean;
  setOnline: (online: boolean) => void;
  notify: (message: string) => void;
};

const ChatterWorkspaceContext = createContext<ChatterWorkspaceContextValue | null>(
  null,
);

type ChatterWorkspaceProviderProps = {
  children: ReactNode;
};

export function ChatterWorkspaceProvider({
  children,
}: ChatterWorkspaceProviderProps) {
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState("");

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }, []);

  const value = useMemo(
    () => ({ online, setOnline, notify }),
    [online, notify],
  );

  return createElement(
    ChatterWorkspaceContext.Provider,
    { value },
    children,
    createElement(
      "div",
      {
        "aria-live": "polite",
        className: `chatter-toast ${notice ? "chatter-toast-visible" : ""}`,
        role: "status",
      },
      notice,
    ),
  );
}

export function useChatterWorkspace(): ChatterWorkspaceContextValue {
  const context = useContext(ChatterWorkspaceContext);

  if (!context) {
    throw new Error(
      "useChatterWorkspace must be used inside ChatterWorkspaceProvider",
    );
  }

  return context;
}
