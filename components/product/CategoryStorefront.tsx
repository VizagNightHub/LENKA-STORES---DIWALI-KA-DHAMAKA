"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { ShareProductButton } from "@/components/product/ShareProductButton";
import { db } from "@/lib/firebase";

interface VariantOption {
  label: string;
  stock: number;
}

interface StoreProduct {
  id: string;
  category: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  images: string[];
  variants?: VariantOption[];
}

interface CategoryStorefrontProps {
  category?: string;
  categorySlug?: string;
  title: string;
  subtitle?: string;
  accent?: string;
}

const CACHE_TTL_MS = 2 * 60 * 1000;

export const CategoryStorefront = ({
  category,
  categorySlug,
  title,
  subtitle,
  accent = "#FFD54A",
}: CategoryStorefrontProps) => {
  const activeCategory = category || categorySlug || "";
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addItem } = useCart();

  useEffect(() => {
    if (!activeCategory) {
      setLoading(false);
      return;
    }

    let active = true;
    const cacheKey = `lenka_cat_${activeCategory}`;

    const loadProducts = async () => {
      try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as { ts: number; data: StoreProduct[] };
          if (Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
            if (active) {
              setProducts(parsed.data);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Ignore storage parse/quota errors
      }

      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", activeCategory)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoreProduct, "id">),
        }));

        if (active) {
          setProducts(list);
          setLoading(false);
        }

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ ts: Date.now(), data: list })
          );
        } catch {
          // Ignore if product images exceed sessionStorage quota
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, [activeCategory]);

  const filtered = products.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.tagline || "").toLowerCase().includes(q)
    );
  });

  const handleAdd = (p: StoreProduct) => {
    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    const chosenVariant =
      selectedVariants[p.id] ||
      (hasVariants ? p.variants?.find((v) => v.stock > 0)?.label : undefined);

    addItem({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      variant: chosenVariant,
      category: p.category,
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-white/15 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#FFD54A]"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-white/10 bg-zinc-900/60 p-10 text-center text-sm text-zinc-400">
          No products found in this category right now. Check back soon!
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const variants = Array.isArray(p.variants) ? p.variants : [];
            const availableVariants = variants.filter((v) => v.stock > 0);
            const activeVariant =
              selectedVariants[p.id] || availableVariants[0]?.label || "";
            const isOutOfStock =
              variants.length > 0 && availableVariants.length === 0;

            return (
              <div
                key={p.id}
                id={`product-${p.id}`}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111114] p-4 transition hover:border-[#FFD54A]/40"
              >
                <div>
                  <div className="relative">
                    <ProductViewer3D
                      images={
                        p.images?.length ? p.images : ["/images/new-launch.png"]
                      }
                      alt={p.name}
                    />
                    {p.badge && (
                      <span
                        style={{ backgroundColor: accent }}
                        className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black"
                      >
                        {p.badge}
                      </span>
                    )}
                    <div className="absolute right-2 top-2">
                      <ShareProductButton productId={p.id} productName={p.name} />
                    </div>
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-white">{p.name}</h2>
                  {p.tagline && (
                    <p className="mt-1 text-xs text-zinc-400">{p.tagline}</p>
                  )}

                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      style={{ color: accent }}
                      className="text-xl font-bold"
                    >
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </span>
                    {p.mrp > p.price && (
                      <span className="text-xs text-zinc-500 line-through">
                        ₹{Number(p.mrp).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {variants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {variants.map((v) => {
                        const out = v.stock <= 0;
                        const selected = activeVariant === v.label;
                        return (
                          <button
                            key={v.label}
                            type="button"
                            disabled={out}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [p.id]: v.label,
                              }))
                            }
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                              out
                                ? "cursor-not-allowed border-white/5 bg-zinc-900/40 text-zinc-600 line-through"
                                : selected
                                ? "cursor-pointer border-[#FFD54A] bg-[#FFD54A]/15 text-[#FFD54A]"
                                : "cursor-pointer border-white/15 bg-black/40 text-zinc-300 hover:border-white/30"
                            }`}
                          >
                            {v.label} ({v.stock})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleAdd(p)}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD54A] py-2.5 text-sm font-bold text-black transition hover:bg-[#ffdf70] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CategoryStorefront;
