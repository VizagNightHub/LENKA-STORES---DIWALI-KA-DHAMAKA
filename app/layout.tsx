import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import { PushpinTearFooter } from "@/components/ui/pushpin-tear-footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lenka-stores-diwali-ka-dhamaka.vercel.app"),
  title: "LENKA STORE — Diwali Ka Dhamaka",
  description:
    "LENKA STORE offers Diwali firecracker combo packs, festive streetwear, ANC audio electronics, and limited-edition drops across Andhra Pradesh and Telangana.",
  verification: {
    google: "00e3XDew4RnhIASrndRNGXt_R-sCiNf8GwL47ry1Dig",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "LENKA STORE — Diwali Ka Dhamaka",
    description:
      "Lenka Stores-direct Diwali cracker combos, festive fashion wear, ANC electronics, and limited drops across Andhra Pradesh & Telangana.",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1024,
        height: 1024,
        alt: "LENKA STORE Logo",
      },
    ],
  },
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
        <PushpinTearFooter />
      </body>
    </html>
  );
}
