"use client";

import { useState } from "react";

interface ShareProductButtonProps {
  productId: string;
  productName: string;
  price: number;
  categoryPath: string;
}

export const ShareProductButton = ({
  productId,
  productName,
  price,
  categoryPath,
}: ShareProductButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://lenka-stores-diwali-ka-dhamaka.vercel.app${categoryPath}#product-${productId}`;
    const text = `Check out ${productName} (₹${price.toLocaleString("en-IN")}) on LENKA STORE!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text, url });
        return;
      } catch {
        // Fallback to copy
      }
    }
    navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this product"
      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-[#E1E0CC]/80 transition-colors hover:border-[#FFD54A] hover:text-[#FFD54A]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
};
