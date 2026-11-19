"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ArrowLeft, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { ShareProductButton } from "@/components/product/ShareProductButton";
import { db } from "@/lib/firebase";

interface VariantStock {
  label: string;
  stock: number;
}

interface LiveStoreProduct {
  id: string;
  category: "fashion-wear" | "electronics" | "new-launch";
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  images: string[];
  variants?: VariantStock[];
}

interface CategoryStorefrontProps {
  category: "fashion-wear" | "electronics" | "new-launch";
  title: string;
  subtitle: string;
  accent: string;
}

export const CategoryStorefront = ({
  category,
  title,
  subtitle,
  accent,
}: CategoryStorefrontProps) => {
  const { addItem, openDrawer } = useCart();
  const [liveProducts, setLiveProducts] = useState<LiveStoreProduct[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVar, setSelectedVar] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, "products"), where("category", "==", category));
    const unsubProd = onSnapshot(q, (snap) => {
      const added: LiveStoreProduct[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          category,
          name: data.name || "Untitled",
          tagline: data.tagline || "",
          price: Number(data.price) || 0,
          mrp: Number(data.mrp) || Number(data.price) || 0,
          badge: data.badge || undefined,
          images: Array.isArray(data.images) ? data.images : [],
          variants: Array.isArray(data.variants) ? data.variants : undefined,
        };
      });
      setLiveProducts(added);
    });
    return () => unsubProd();
  }, [category]);

  const filtered = liveProducts.filter((p) =>
    `${p.name} ${p.tagline}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#09090b] pb-32 text-[#E1E0CC]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E1E0CC]/80 hover:text-[#FFD54A]"
          >
            <ArrowLeft className="h-4 w-4" />
            LENKA STORE
          </Link>
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{ borderColor: `${accent}66`, color: accent }}
          >
            {title}
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#E1E0CC]/65 sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E1E0CC]/50" />
            <input
              type="text"
              placeholder={`Search ${title}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/15 bg-zinc-900 py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-[#E1E0CC]/60">
              No products found.
            </p>
          ) : (
            filtered.map((product) => {
              const variants = product.variants || [];
              const firstInStock = variants.find((v) => v.stock > 0)?.label || "";
              const currentLabel = selectedVar[product.id] ?? firstInStock;
              const currentObj = variants.find((v) => v.label === currentLabel);
              const outOfStock = variants.length > 0 && (!currentObj || currentObj.stock <= 0);

              return (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className="flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/75 p-6 transition-all hover:border-white/25"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <ShareProductButton
                        productId={product.id}
                        productName={product.name}
                        price={product.price}
                        categoryPath={`/${category}`}
                      />
                      {product.badge && (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-black"
                          style={{ backgroundColor: accent }}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <ProductViewer3D
                      images={product.images}
                      alt={product.name}
                      accent={accent}
                    />

                    <h2 className="mt-5 text-xl font-semibold text-white">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#E1E0CC]/65">
                      {product.tagline}
                    </p>

                    <div className="mt-4 flex items-baseline gap-2.5">
                      <span className="text-2xl font-bold text-white">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-[#E1E0CC]/45 line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {variants.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {variants.map((v) => {
                          const active = currentLabel === v.label;
                          const empty = v.stock <= 0;
                          return (
                            <button
                              key={v.label}
                              type="button"
                              disabled={empty}
                              onClick={() =>
                                setSelectedVar((prev) => ({
                                  ...prev,
                                  [product.id]: v.label,
                                }))
                              }
                              className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                                empty
                                  ? "cursor-not-allowed border border-white/10 text-white/30 line-through"
                                  : active
                                  ? "bg-[#FFD54A] text-black"
                                  : "border border-white/15 text-[#E1E0CC]/80 hover:border-white/40"
                              }`}
                            >
                              {v.label} ({v.stock})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          category,
                          variant: currentLabel || undefined,
                        });
                        openDrawer();
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E1E0CC] py-3 text-sm font-semibold text-black hover:bg-[#FFD54A] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};
