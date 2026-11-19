"use client";

import Link from "next/link";
import { useState } from "react";

const SITE_URL = "https://lenka-stores-diwali-ka-dhamaka.vercel.app";

export const ShareMenuButton = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareSite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LENKA STORE — Diwali Ka Dhamaka",
          text: "Check out LENKA STORE — Diwali Ka Dhamaka combos, streetwear & electronics!",
          url: SITE_URL,
        });
        return;
      } catch {
        // Fallback to copy if user cancels
      }
    }
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/85 text-[#E1E0CC] backdrop-blur-md transition-colors hover:border-[#FFD54A] hover:text-[#FFD54A]"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/15 bg-zinc-950/95 p-3 text-xs text-[#E1E0CC] shadow-2xl backdrop-blur-xl">
          <div className="space-y-1 border-b border-white/10 pb-2.5">
            <Link href="/diwali-ka-dhamaka" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              Diwali Ka Dhamaka
            </Link>
            <Link href="/fashion-wear" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              Fashion Wear
            </Link>
            <Link href="/electronics" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              Electronics
            </Link>
            <Link href="/new-launch" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              New Launch
            </Link>
            <Link href="/track-order" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              Track Order
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10 hover:text-[#FFD54A]">
              Contact
            </Link>
          </div>

          <div className="mt-2.5 space-y-2">
            <button
              type="button"
              onClick={handleShareSite}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD54A] px-3 py-2.5 font-bold text-black hover:bg-[#ffe27a]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              {copied ? "Website Link Copied!" : "Share Website"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
