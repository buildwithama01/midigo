import type { Metadata } from "next";
import { Ysabeau } from "next/font/google";
import "./globals.css";
import SessionTimeoutProvider from "@/components/SessionTimeoutProvider";

const ysabeau = Ysabeau({
  variable: "--font-ysabeau",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Midigo | Exclusive Virtual Muse",
  description:
    "Step into Midigo's digital world. Access exclusive photoshoots, behind-the-scenes content, and interact directly with the virtual muse.",
  openGraph: {
    title: "Midigo | Exclusive Virtual Muse",
    description:
      "Step into Midigo's digital world. Access exclusive photoshoots, behind-the-scenes content, and interact directly with the virtual muse.",
    url: "https://midigo.example.com",
    siteName: "Midigo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Midigo AI Model Community",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midigo | Exclusive Virtual Muse",
    description:
      "Step into Midigo's digital world. Access exclusive photoshoots, behind-the-scenes content, and interact directly with the virtual muse.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ysabeau.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionTimeoutProvider>
          {children}
        </SessionTimeoutProvider>
      </body>
    </html>
  );
}
