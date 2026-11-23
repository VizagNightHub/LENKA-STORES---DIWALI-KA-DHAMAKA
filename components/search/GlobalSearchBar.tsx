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
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B5D3B]" />
        <input
          type="text"
          placeholder="Search across Fashion, Electronics, Diwali Combos & New Launch..."
          value={queryText}
          onFocus={ensureLoaded}
          onChange={(e) => {
            ensureLoaded();
            setQueryText(e.target.value);
          }}
          className="w-full rounded-full border border-[#DCE5DF] bg-white py-3.5 pl-11 pr-10 text-sm text-[#0B2219] placeholder:text-[#4A5D54]/70 shadow-[0_4px_16px_rgba(11,59,43,0.06)] outline-none transition focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15"
        />
        {queryText && (
          <button
            type="button"
            onClick={() => setQueryText("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-[#4A5D54] hover:text-[#0B5D3B]"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {clean && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[#DCE5DF] bg-white p-2 shadow-xl">
            {loading ? (
              <p className="p-3 text-xs text-[#4A5D54]">Searching store...</p>
            ) : matches.length === 0 ? (
              <p className="p-3 text-xs text-[#4A5D54]">
                No matching products found.
              </p>
            ) : (
              matches.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.category}#product-${p.id}`}
                  onClick={() => setQueryText("")}
                  className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition hover:bg-[#EDF5F0]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={p.images?.[0] || "/images/new-launch.png"}
                      alt={p.name}
                      className="h-10 w-10 shrink-0 rounded-lg border border-[#DCE5DF] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0B2219]">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#0B5D3B]">
                        {p.category.replace(/-/g, " ")}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#0B5D3B]">
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
