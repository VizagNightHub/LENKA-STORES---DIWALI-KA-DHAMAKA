<meta name="google-site-verification" content="00e3XDew4RnhIASrndRNGXt_R-sCiNf8GwL47ry1Dig" />
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
  title: "LENKA STORE — Diwali Ka Dhamaka",
  description:
    "LENKA STORE offers Diwali firecracker combo packs, festive streetwear, ANC audio electronics, and limited-edition drops across Andhra Pradesh and Telangana.",
  icons: {
    icon: "/favicon.svg",
    apple: "/images/diwali.png",
  },
  openGraph: {
    title: "LENKA STORE — Diwali Ka Dhamaka",
    description:
      "Sivakasi-direct Diwali cracker combos, festive fashion wear, ANC electronics, and limited drops across Andhra Pradesh & Telangana.",
    type: "website",
    images: [
      {
        url: "/images/diwali.png",
        width: 1024,
        height: 1024,
        alt: "LENKA STORE Diwali Ka Dhamaka Combo Boxes",
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
