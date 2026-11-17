"use client";

import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { STORE_PRODUCTS, StoreProduct } from "@/data/catalog";

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
  const router = useRouter();
  const products = STORE_PRODUCTS.filter((p) => p.category === category);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const selected = products.filter((p) => (quantities[p.id] || 0) > 0);
  const totalCount = selected.reduce((s, p) => s + (quantities[p.id] || 0), 0);
  const totalAmount = selected.reduce(
    (s, p) => s + p.price * (quantities[p.id] || 0),
    0
  );

  const handleCheckout = () => {
    const payload = selected.map((p: StoreProduct) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: quantities[p.id] || 0,
    }));
    localStorage.setItem("lenka_d27_cart", JSON.stringify(payload));
    router.push("/checkout");
  };

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
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#E1E0CC]/65 sm:text-base">
          {subtitle}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const qty = quantities[product.id] || 0;
            return (
              <div
                key={product.id}
                className={`flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                  qty > 0
                    ? "border-[#FFD54A] bg-zinc-900"
                    : "border-white/10 bg-zinc-900/75 hover:border-white/25"
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-[#E1E0CC]/50">
                      LENKA STORE
                    </span>
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
                </div>

                <div className="mt-6">
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => updateQty(product.id, 1)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E1E0CC] py-3 text-sm font-semibold text-black hover:bg-[#FFD54A]"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full border border-[#FFD54A] bg-black/60 p-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, -1)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-[#FFD54A]">
                        {qty} Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, 1)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#FFD54A] text-black"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {totalCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[94%] max-w-3xl -translate-x-1/2 rounded-2xl border border-[#FFD54A]/40 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-lg">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD54A]/15 text-[#FFD54A]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#E1E0CC]/65">
                  {totalCount} Item{totalCount > 1 ? "s" : ""} Selected
                </p>
                <p className="text-lg font-bold text-white">
                  Total: ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full cursor-pointer rounded-full bg-[#FFD54A] px-7 py-3 text-sm font-bold text-black sm:w-auto"
            >
              Proceed to UPI Checkout →
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
