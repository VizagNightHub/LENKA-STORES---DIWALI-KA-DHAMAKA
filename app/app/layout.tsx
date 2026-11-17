import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LENKA STORE — Lenka Stores Diwali Ka Dhamaka",
  description:
    "Official Lenka Store Diwali Ka Dhamaka — Sivakasi Direct Firecrackers, Fashion Wear, Electronics & New Launches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-[#09090b] antialiased`}>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
