import type { Metadata } from "next";
import "./chatter.css";
import "./chatter-features.css";
import ChatterShell from "@/src/components/chatter/ChatterShell";

export const metadata: Metadata = {
  title: "Chatter | Midigo",
  description: "Manage assigned conversations, live rooms, member support, and community moderation for Midigo.",
};

export default function ChatterLayout({ children }: { children: React.ReactNode }) {
  return <ChatterShell>{children}</ChatterShell>;
}
