"use client";

import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { recordRecentlyViewed } from "@/components/product/RecentlyViewedStrip";
import { CATEGORIES } from "@/data/categories";
import { db } from "@/lib/firebase";

interface VariantOption {
  label: string;
  stock: number;
}

interface HomeProduct {
  id: string;
  name: string;
  tagline?: string;
  category: string;
  price: number;
  mrp?: number;
  badge?: string;
  images?: string[];
  variants?: VariantOption[];
}

const CACHE_KEY = "lenka_all_products_search";
const CACHE_TTL_MS = 2 * 60 * 1000;

export const CategoryGrid = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { ts: number; data: HomeProduct[] };
          if (Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
            if (active) {
              setProducts(parsed.data);
              setLoading(false);
            }
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
          ...(d.data() as Omit<HomeProduct, "id">),
        }));
        if (active) {
          setProducts(list);
          setLoading(false);
        }
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ts: Date.now(), data: list })
          );
        } catch {
          // Ignore quota
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const departments = CATEGORIES.map((c) => ({
    slug: c.href.replace(/^\//, ""),
    title: c.title,
    href: c.href,
  }));

  const visibleDepartments =
    activeTab === "all"
      ? departments
      : departments.filter((d) => d.slug === activeTab);

  const handleQuickAdd = (p: HomeProduct) => {
    const firstInStock = Array.isArray(p.variants)
      ? p.variants.find((v) => v.stock > 0)?.label
      : undefined;

    recordRecentlyViewed({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      category: p.category,
      image: p.images?.[0],
    });

    addItem({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      variant: firstInStock,
      category: p.category,
    });
  };

  return (
    <section
      id="categories"
      className="w-full bg-[#F8FAF9] px-3 py-8 text-[#0B2219] sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Horizontal Department Tabs (Amazon / Myntra Style) */}
        <div className="flex items-center gap-5 overflow-x-auto border-b border-[#DCE5DF] pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`shrink-0 cursor-pointer border-b-2 pb-3 text-xs font-bold transition sm:text-sm ${
              activeTab === "all"
                ? "border-[#0B5D3B] text-[#0B5D3B]"
                : "border-transparent text-[#4A5D54] hover:text-[#0B2219]"
            }`}
          >
            All Departments
          </button>

          {departments.map((dept) => (
            <button
              key={dept.slug}
              type="button"
              onClick={() => setActiveTab(dept.slug)}
              className={`shrink-0 cursor-pointer border-b-2 pb-3 text-xs font-bold transition sm:text-sm ${
                activeTab === dept.slug
                  ? "border-[#0B5D3B] text-[#0B5D3B]"
                  : "border-transparent text-[#4A5D54] hover:text-[#0B2219]"
              }`}
            >
              {dept.title}
            </button>
          ))}
        </div>

        {/* Curated Product Shelves */}
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-60 animate-pulse rounded-xl border border-[#DCE5DF] bg-white sm:h-72 sm:rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-9">
            {visibleDepartments.map((dept) => {
              const deptProducts = products
                .filter((p) => p.category === dept.slug)
                .slice(0, activeTab === "all" ? 4 : 8);

              if (deptProducts.length === 0 && activeTab === "all") return null;

              return (
                <div key={dept.slug} className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-[#0B2219] sm:text-2xl">
                      {dept.title}
                    </h2>
                    <Link
                      href={dept.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5D3B] hover:underline sm:text-sm"
                    >
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {deptProducts.length === 0 ? (
                    <div className="rounded-2xl border border-[#DCE5DF] bg-white p-6 text-center text-xs text-[#4A5D54]">
                      New drops coming soon in {dept.title}.{" "}
                      <Link
                        href={dept.href}
                        className="font-bold text-[#0B5D3B] hover:underline"
                      >
                        Open Department →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
                      {deptProducts.map((p) => {
                        const mrp = Number(p.mrp || 0);
                        const price = Number(p.price || 0);
                        const discountPct =
                          mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                        return (
                          <div
                            key={p.id}
                            className="flex flex-col justify-between rounded-xl border border-[#DCE5DF] bg-white p-2.5 shadow-sm transition hover:border-[#0B5D3B]/50 hover:shadow-md sm:rounded-2xl sm:p-3.5"
                          >
                            <div>
                              <Link
                                href={`/${p.category}#product-${p.id}`}
                                className="relative block aspect-square w-full overflow-hidden rounded-lg bg-[#F3F6F4] sm:rounded-xl"
                              >
                                <img
                                  src={p.images?.[0] || "/images/new-launch.png"}
                                  alt={p.name}
                                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                                {discountPct > 0 && (
                                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[#0B5D3B] px-2 py-0.5 text-[9px] font-bold text-white sm:left-2 sm:top-2 sm:text-[10px]">
                                    {discountPct}% OFF
                                  </span>
                                )}
                              </Link>

                              <Link
                                href={`/${p.category}#product-${p.id}`}
                                className="mt-2.5 block line-clamp-2 text-xs font-bold leading-snug text-[#0B2219] hover:text-[#0B5D3B] sm:mt-3 sm:text-sm"
                              >
                                {p.name}
                              </Link>

                              <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                                <span className="text-sm font-bold text-[#0B5D3B] sm:text-base">
                                  ₹{price.toLocaleString("en-IN")}
                                </span>
                                {mrp > price && (
                                  <span className="text-[10px] text-[#4A5D54]/55 line-through sm:text-xs">
                                    ₹{mrp.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuickAdd(p)}
                              className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0B5D3B] py-1.5 text-[11px] font-bold text-white transition hover:bg-[#08472D] sm:mt-3 sm:py-2 sm:text-xs"
                            >
                              <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Add to Cart
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
