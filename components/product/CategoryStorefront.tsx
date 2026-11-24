"use client";

import { onAuthStateChanged } from "firebase/auth";
import { recordRecentlyViewed } from "@/components/product/RecentlyViewedStrip";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  Heart,
  LayoutGrid,
  Search,
  ShoppingBag,
  Star,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductReviewsModal } from "@/components/product/ProductReviewsModal";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { ShareProductButton } from "@/components/product/ShareProductButton";
import { SUBCATEGORIES } from "@/data/subcategories";
import { auth, db } from "@/lib/firebase";

interface VariantOption {
  label: string;
  stock: number;
}

interface StoreProduct {
  id: string;
  category: string;
  subcategory?: string | null;
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
}: CategoryStorefrontProps) => {
  const activeCategory = category || categorySlug || "";
  const subList = SUBCATEGORIES[activeCategory] || [];

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [customerUid, setCustomerUid] = useState<string | null>(null);
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lenka_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {
      // Ignore
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        setCustomerUid(u.uid);
        const snap = await getDoc(doc(db, "customers", u.uid));
        if (snap.exists() && Array.isArray(snap.data().wishlist)) {
          setWishlist(snap.data().wishlist);
        }
      } else {
        setCustomerUid(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setSelectedSub("all");
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
  }, [activeCategory]);

  const toggleWishlist = async (productId: string) => {
    const exists = wishlist.includes(productId);
    const updated = exists
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    try {
      localStorage.setItem("lenka_wishlist", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (customerUid) {
      try {
        await updateDoc(doc(db, "customers", customerUid), {
          wishlist: exists ? arrayRemove(productId) : arrayUnion(productId),
        });
      } catch {
        // Ignore
      }
    }
  };

  const filtered = products.filter((p) => {
    const matchesSub =
      selectedSub === "all" || p.subcategory === selectedSub;
    if (!matchesSub) return false;

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
      variant: chosenVariant,
      category: p.category,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAF9] pb-20 text-[#0B2219] md:pb-10">
      <section className="mx-auto max-w-7xl overflow-x-hidden px-3 py-5 sm:px-6 sm:py-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5D54] transition hover:text-[#0B5D3B] sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Lenka Store
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE5DF] bg-white px-3 py-1 text-[11px] font-semibold text-[#0B2219] shadow-sm transition hover:border-[#0B5D3B] sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            <UserIcon className="h-3 w-3 text-[#0B5D3B] sm:h-3.5 sm:w-3.5" />
            {customerUid ? "My Profile" : "Login / Sign Up"}
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#DCE5DF] pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0B2219] sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs text-[#4A5D54] sm:text-sm">{subtitle}</p>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0B5D3B] sm:h-4 sm:w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-[#DCE5DF] bg-white py-2 pl-9 pr-4 text-xs text-[#0B2219] placeholder:text-[#4A5D54]/60 shadow-sm outline-none focus:border-[#0B5D3B] sm:py-2.5 sm:pl-10 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-6">
          {subList.length > 0 && (
            <aside className="min-w-0 lg:col-span-3">
              <div className="flex w-full max-w-full gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border lg:border-[#DCE5DF] lg:bg-white lg:p-3 lg:shadow-sm">
                <button
                  type="button"
                  onClick={() => setSelectedSub("all")}
                  className={`flex shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-full px-3 py-1.5 text-left text-[11px] font-semibold transition lg:rounded-xl lg:px-3.5 lg:py-2.5 lg:text-xs ${
                    selectedSub === "all"
                      ? "bg-[#0B5D3B] text-white"
                      : "border border-[#DCE5DF] bg-white text-[#4A5D54] hover:border-[#0B5D3B] hover:text-[#0B5D3B] lg:border-transparent lg:bg-transparent"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    All Items
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                      selectedSub === "all"
                        ? "bg-white text-[#0B5D3B]"
                        : "bg-[#EDF5F0] text-[#0B5D3B]"
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {subList.map((sub) => {
                  const count = products.filter((p) => p.subcategory === sub.slug).length;
                  const isSelected = selectedSub === sub.slug;
                  return (
                    <button
                      key={sub.slug}
                      type="button"
                      onClick={() => setSelectedSub(sub.slug)}
                      className={`flex shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-full px-3 py-1.5 text-left text-[11px] font-semibold transition lg:rounded-xl lg:px-3.5 lg:py-2.5 lg:text-xs ${
                        isSelected
                          ? "bg-[#0B5D3B] text-white"
                          : "border border-[#DCE5DF] bg-white text-[#4A5D54] hover:border-[#0B5D3B] hover:text-[#0B5D3B] lg:border-transparent lg:bg-transparent"
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                          isSelected
                            ? "bg-white text-[#0B5D3B]"
                            : "bg-[#EDF5F0] text-[#0B5D3B]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          <div className={subList.length > 0 ? "min-w-0 lg:col-span-9" : "min-w-0 lg:col-span-12"}>
            {loading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-60 animate-pulse rounded-xl border border-[#DCE5DF] bg-white sm:h-72 sm:rounded-2xl"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-[#DCE5DF] bg-white p-8 text-center text-xs text-[#4A5D54] sm:p-10 sm:text-sm">
                No products in this section yet. Check another category or check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {filtered.map((p) => {
                  const variants = Array.isArray(p.variants) ? p.variants : [];
                  const availableVariants = variants.filter((v) => v.stock > 0);
                  const activeVariant =
                    selectedVariants[p.id] || availableVariants[0]?.label || "";
                  const isOutOfStock =
                    variants.length > 0 && availableVariants.length === 0;
                  const liked = wishlist.includes(p.id);
                  const discountPct =
                    p.mrp > p.price
                      ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                      : 0;

                  return (
                    <div
                      key={p.id}
                      id={`product-${p.id}`}
                      className="flex flex-col justify-between rounded-xl border border-[#DCE5DF] bg-white p-2.5 shadow-sm transition hover:border-[#0B5D3B]/50 hover:shadow-md sm:rounded-2xl sm:p-3.5"
                    >
                      <div>
                        <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                          <ProductViewer3D
                            images={
                              p.images?.length ? p.images : ["/images/new-launch.png"]
                            }
                            alt={p.name}
                          />
                          {p.badge && (
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-[#0B5D3B] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:left-2.5 sm:top-2.5 sm:text-[10px]">
                              {p.badge}
                            </span>
                          )}
                          <div className="absolute right-1.5 top-1.5 flex items-center gap-1 sm:right-2 sm:top-2">
                            <button
                              type="button"
                              onClick={() => toggleWishlist(p.id)}
                              title="Save to Wishlist"
                              className="cursor-pointer rounded-full border border-white/25 bg-black/50 p-1 text-white transition hover:border-white sm:p-1.5"
                            >
                              <Heart
                                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                  liked ? "fill-red-500 text-red-500" : "text-white"
                                }`}
                              />
                            </button>
                            <ShareProductButton
                              productId={p.id}
                              productName={p.name}
                              price={Number(p.price) || 0}
                              categoryPath={`/${activeCategory}`}
                            />
                          </div>
                        </div>

                        <h2 className="mt-2.5 line-clamp-2 text-xs font-bold leading-snug text-[#0B2219] sm:mt-3 sm:text-sm">
                          {p.name}
                        </h2>
                        {p.tagline && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-[#4A5D54] sm:text-xs">
                            {p.tagline}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-sm font-bold text-[#0B5D3B] sm:text-base">
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </span>
                            {p.mrp > p.price && (
                              <span className="text-[10px] text-[#4A5D54]/50 line-through sm:text-xs">
                                ₹{Number(p.mrp).toLocaleString("en-IN")}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span className="text-[10px] font-bold text-[#0B5D3B]">
                                {discountPct}% off
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setReviewProduct({ id: p.id, name: p.name })}
                            className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-[#DCE5DF] bg-[#F8FAF9] px-1.5 py-0.5 text-[10px] font-semibold text-[#0B2219] hover:border-[#0B5D3B] sm:px-2 sm:py-1 sm:text-[11px]"
                          >
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 sm:h-3 sm:w-3" />
                            <span>Reviews</span>
                          </button>
                        </div>

                        {variants.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
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
                                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition sm:rounded-lg sm:px-2 sm:py-1 sm:text-[11px] ${
                                    out
                                      ? "cursor-not-allowed border-[#DCE5DF] bg-[#F8FAF9] text-[#4A5D54]/40 line-through"
                                      : selected
                                      ? "cursor-pointer border-[#0B5D3B] bg-[#0B5D3B] text-white"
                                      : "cursor-pointer border-[#DCE5DF] bg-[#F8FAF9] text-[#0B2219] hover:border-[#0B5D3B]"
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
                        className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0B5D3B] py-1.5 text-[11px] font-bold text-white transition hover:bg-[#08472D] disabled:cursor-not-allowed disabled:bg-[#DCE5DF] disabled:text-[#4A5D54]/60 sm:mt-3 sm:py-2 sm:text-xs"
                      >
                        <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {reviewProduct && (
        <ProductReviewsModal
          productId={reviewProduct.id}
          productName={reviewProduct.name}
          onClose={() => setReviewProduct(null)}
        />
      )}
    </div>
  );
};

export default CategoryStorefront;
