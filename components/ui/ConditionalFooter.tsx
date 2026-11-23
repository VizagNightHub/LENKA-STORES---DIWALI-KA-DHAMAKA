"use client";

import { usePathname } from "next/navigation";
import { PushpinTearFooter } from "@/components/ui/pushpin-tear-footer";

const FOOTER_PATHS = ["/", "/about", "/contact", "/privacy", "/terms"];

export const ConditionalFooter = () => {
  const pathname = usePathname() || "/";
  if (!FOOTER_PATHS.includes(pathname)) return null;

  return (
    <PushpinTearFooter
      sheet="#0D211B"
      paper="#C9A45C"
      sheetInk="#FFFDF2"
      paperInk="#071410"
    />
  );
};

export default ConditionalFooter;
