"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

const SITE_URL = "https://lenka-stores-diwali-ka-dhamaka.vercel.app";

export const ShareMenuButton = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { items, openDrawer } = useCart();

  const totalCount = items.reduce((s, i) => s + i.qty, 0);

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
        // Fallback to copy
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
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/95 text-[#0B5D3B] shadow-md transition hover:scale-105"
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
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#DCE5DF] bg-white p-3 text-xs text-[#0B2219] shadow-xl">
          <div className="space-y-1 border-b border-[#E6ECE8] pb-2.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openDrawer();
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-[#EDF5F0] px-3 py-2 font-bold text-[#0B5D3B] hover:bg-[#DCECE3]"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                View Cart
              </span>
              <span className="rounded-full bg-[#0B5D3B] px-2 py-0.5 text-[10px] text-white">
                {totalCount}
              </span>
            </button>

            <Link href="/account" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              My Account
            </Link>
            <Link href="/diwali-ka-dhamaka" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              Diwali Ka Dhamaka
            </Link>
            <Link href="/fashion-wear" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              Fashion Wear
            </Link>
            <Link href="/electronics" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              Electronics
            </Link>
            <Link href="/new-launch" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              New Launch
            </Link>
            <Link href="/track-order" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              Track Order
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium hover:bg-[#EDF5F0] hover:text-[#0B5D3B]">
              Contact
            </Link>
          </div>

          <div className="mt-2.5 space-y-2">
            <button
              type="button"
              onClick={handleShareSite}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0B5D3B] px-3 py-2.5 font-bold text-white transition hover:bg-[#08472D]"
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
