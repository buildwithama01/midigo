import { Metadata } from "next";
import ForgotPasswordForm from "@/src/app/(auth)/forgot-password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Midigo",
  description: "Recover your Midigo account password.",
  openGraph: {
    title: "Forgot Password | Midigo",
    description: "Recover your Midigo account password.",
    url: "https://midigo.example.com/forgot-password",
    siteName: "Midigo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password | Midigo",
    description: "Recover your Midigo account password.",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
