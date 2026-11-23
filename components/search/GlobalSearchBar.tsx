"use client";

import { collection, getDocs } from "firebase/firestore";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";

interface SearchProduct {
  id: string;
  name: string;
  tagline?: string;
  category: string;
  price: number;
  images?: string[];
}

const CACHE_KEY = "lenka_all_products_search";
const CACHE_TTL_MS = 2 * 60 * 1000;

export const GlobalSearchBar = () => {
  const [queryText, setQueryText] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensureLoaded = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { ts: number; data: SearchProduct[] };
        if (Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          setProducts(parsed.data);
          setLoaded(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SearchProduct, "id">),
      }));
      setProducts(list);
      setLoaded(true);
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ts: Date.now(), data: list })
        );
      } catch {
        // Ignore quota errors
      }
    } finally {
      setLoading(false);
    }
  };

  const clean = queryText.trim().toLowerCase();
  const matches = clean
    ? products
        .filter((p) =>
          `${p.name} ${p.tagline || ""} ${p.category}`
            .toLowerCase()
            .includes(clean)
        )
        .slice(0, 8)
    : [];

  return (
    <section className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A45C]" />
        <input
          type="text"
          placeholder="Search across Fashion, Electronics, Diwali Combos & New Launch..."
          value={queryText}
          onFocus={ensureLoaded}
          onChange={(e) => {
            ensureLoaded();
            setQueryText(e.target.value);
          }}
          className="w-full rounded-full border border-[#C9A45C]/30 bg-[#0D211B] py-3 pl-11 pr-10 text-sm text-[#FFFDF2] placeholder:text-[#FFFDF2]/50 outline-none focus:border-[#C9A45C]"
        />
        {queryText && (
          <button
            type="button"
            onClick={() => setQueryText("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-[#FFFDF2]/60 hover:text-[#C9A45C]"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {clean && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[#C9A45C]/30 bg-[#0D211B] p-2 shadow-2xl">
            {loading ? (
              <p className="p-3 text-xs text-[#FFFDF2]/70">Searching store...</p>
            ) : matches.length === 0 ? (
              <p className="p-3 text-xs text-[#FFFDF2]/70">
                No matching products found.
              </p>
            ) : (
              matches.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.category}#product-${p.id}`}
                  onClick={() => setQueryText("")}
                  className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition hover:bg-[#071410]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={p.images?.[0] || "/images/new-launch.png"}
                      alt={p.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#FFFDF2]">
                        {p.name}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-[#C9A45C]">
                        {p.category.replace(/-/g, " ")}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#C9A45C]">
                    ₹{Number(p.price || 0).toLocaleString("en-IN")}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalSearchBar;
