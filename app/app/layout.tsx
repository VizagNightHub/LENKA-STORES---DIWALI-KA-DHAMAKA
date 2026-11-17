import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LENKA STORE — Diwali Ka Dhamaka",
  description:
    "Official Lenka Store Diwali Ka Dhamaka —  Firecrackers, Fashion Wear, Electronics & New Launches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-[#09090b] antialiased`}>
        {children}
      </body>
    </html>
  );
}
