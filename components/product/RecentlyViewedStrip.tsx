"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface RecentProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

const RECENT_KEY = "lenka_recently_viewed";

export function recordRecentlyViewed(item: RecentProductItem) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: RecentProductItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.id !== item.id);
    const updated = [item, ...filtered].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export const RecentlyViewedStrip = () => {
  const [items, setItems] = useState<RecentProductItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
          Recently Viewed
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${item.category}#product-${item.id}`}
            className="flex items-center gap-3 rounded-2xl border border-[#DCE5DF] bg-white p-3 shadow-sm transition hover:border-[#0B5D3B]"
          >
            <img
              src={item.image || "/images/new-launch.png"}
              alt={item.name}
              className="h-12 w-12 shrink-0 rounded-xl border border-[#DCE5DF] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#0B2219]">{item.name}</p>
              <p className="text-xs font-semibold text-[#0B5D3B]">
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedStrip;
