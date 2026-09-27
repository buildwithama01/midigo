import { Metadata } from "next";
import SignInForm from "@/src/app/(auth)/sign-in/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | Midigo",
  description: "Sign in to your Midigo account to join live rooms and customize your feed.",
  openGraph: {
    title: "Sign In | Midigo",
    description: "Sign in to your Midigo account to join live rooms and customize your feed.",
    url: "https://midigo.example.com/sign-in",
    siteName: "Midigo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Midigo",
    description: "Sign in to your Midigo account to join live rooms and customize your feed.",
  },
};

export default function SignInPage() {
  return <SignInForm />;
}
