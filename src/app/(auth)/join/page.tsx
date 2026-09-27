import { Metadata } from "next";
import JoinForm from "@/src/app/(auth)/join/JoinForm";

export const metadata: Metadata = {
  title: "Join Now | Midigo",
  description: "Create an account to participate in live rooms, save models, and customize your news feed.",
  openGraph: {
    title: "Join Now | Midigo",
    description: "Create an account to participate in live rooms, save models, and customize your news feed.",
    url: "https://midigo.example.com/join",
    siteName: "Midigo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Now | Midigo",
    description: "Create an account to participate in live rooms, save models, and customize your news feed.",
  },
};

export default function JoinPage() {
  return <JoinForm />;
}
