"use client";

import { collection, getDocs } from "firebase/firestore";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (open) {
      ensureLoaded();
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/95 text-[#0B5D3B] shadow-md transition hover:scale-105"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B2219]/55 px-4 pt-16 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-[#DCE5DF] bg-white p-3 shadow-2xl"
          >
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#0B5D3B]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Fashion, Electronics, Diwali Combos & New Launch..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] py-2.5 pl-10 pr-10 text-sm text-[#0B2219] placeholder:text-[#4A5D54]/70 outline-none focus:border-[#0B5D3B] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  setQueryText("");
                  setOpen(false);
                }}
                className="absolute right-3 cursor-pointer text-[#4A5D54] hover:text-[#0B5D3B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {clean && (
              <div className="mt-2 max-h-80 overflow-y-auto border-t border-[#E6ECE8] pt-2">
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
                      onClick={() => {
                        setQueryText("");
                        setOpen(false);
                      }}
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
        </div>
      )}
    </>
  );
};

export default GlobalSearchBar;
