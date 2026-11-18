"use client";

import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { DIWALI_COMBOS } from "@/data/diwaliCombos";
import { db } from "@/lib/firebase";

interface ComboItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  itemCount?: string;
  images: string[];
  items?: string[];
  accent: string;
}

export default function DiwaliKaDhamakaPage() {
  const router = useRouter();
  const [liveProducts, setLiveProducts] = useState<ComboItem[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 1) Live products in this category
    const q = query(
      collection(db, "products"),
      where("category", "==", "diwali-ka-dhamaka")
    );
    const unsubProd = onSnapshot(q, (snap) => {
      const list: ComboItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "Untitled",
          tagline: data.tagline || "",
          price: Number(data.price) || 0,
          mrp: Number(data.mrp) || Number(data.price) || 0,
          badge: data.badge || undefined,
          itemCount: data.itemCount || "DIWALI SPECIAL",
          images: Array.isArray(data.images) ? data.images : ["/images/diwali.png"],
          items: Array.isArray(data.items) ? data.items : [],
          accent: "#FFD54A",
        };
      });
      setLiveProducts(list);
      setProductsLoaded(true);
    });

    // 2) "Catalog initialized" flag (set by the admin panel)
    const unsubInit = onSnapshot(doc(db, "stats", "catalog"), (snap) => {
      setInitialized(snap.exists() && !!snap.data()?.initialized);
      setInitLoaded(true);
    });

    return () => {
      unsubProd();
      unsubInit();
    };
  }, []);

  // Wait until both Firebase reads are done, so defaults never flash on screen.
  const ready = productsLoaded && initLoaded;

  // Once the catalog is initialized, always show live data (even if empty).
  // Defaults are used only for a brand-new store that was never initialized.
  const displayProducts: ComboItem[] = !ready
    ? []
    : initialized || liveProducts.length > 0
      ? liveProducts
      : DIWALI_COMBOS;

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const toggleItems = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedItems = displayProducts.filter((c) => (quantities[c.id] || 0) > 0);
  const totalCount = selectedItems.reduce(
    (sum, c) => sum + (quantities[c.id] || 0),
    0
  );
  const totalAmount = selectedItems.reduce(
    (sum, c) => sum + c.price * (quantities[c.id] || 0),
    0
  );

  const handleProceedToCheckout = () => {
    const cartPayload = selectedItems.map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
      qty: quantities[c.id] || 0,
    }));
    localStorage.setItem("lenka_d27_cart", JSON.stringify(cartPayload));
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-[#09090b] pb-32 text-[#E1E0CC]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E1E0CC]/80 transition-colors hover:text-[#FFD54A]"
          >
            <ArrowLeft className="h-4 w-4" />
            LENKA STORE
          </Link>
          <span className="rounded-full border border-[#FFD54A]/40 bg-[#FFD54A]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#FFD54A]">
            DIWALI KA DHAMAKA
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 md:pt-14">
        <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FFD54A]">
              Sivakasi Direct • AP & Telangana
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Festive Cracker Combos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#E1E0CC]/70 sm:text-base">
              Hand-picked Sivakasi firework boxes packed for maximum value.
              Prepaid-only booking via UPI with UTR verification for priority
              dispatch across Andhra Pradesh & Telangana.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#E1E0CC]/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFD54A]" />
                100% Genuine Sivakasi Stock
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5">
                <Truck className="h-3.5 w-3.5 text-[#FFD54A]" />
                AP & Telangana Priority Supply
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-square max-w-[300px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
              <img
                src="/images/diwali.png"
                alt="Lenka Store Diwali Ka Dhamaka Combo Boxes"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-8">
        {ready && displayProducts.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-[#E1E0CC]/60">
            No combos available right now. Please check back soon!
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {displayProducts.map((combo, idx) => {
            const qty = quantities[combo.id] || 0;
            const isOpen = !!expanded[combo.id];
            const hasItems = Array.isArray(combo.items) && combo.items.length > 0;

            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all sm:p-8 ${
                  qty > 0
                    ? "border-[#FFD54A] bg-zinc-900 shadow-[0_0_40px_rgba(255,213,74,0.12)]"
                    : "border-white/10 bg-zinc-900/75 hover:border-white/25"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.2em]"
                      style={{
                        borderColor: `${combo.accent}55`,
                        color: combo.accent,
                      }}
                    >
                      {combo.itemCount || "DIWALI SPECIAL"}
                    </span>
                    {combo.badge && (
                      <span className="rounded-full bg-[#FFD54A] px-3 py-1 text-[10px] font-bold tracking-wider text-black">
                        {combo.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <ProductViewer3D
                      images={combo.images}
                      alt={combo.name}
                      accent={combo.accent}
                    />
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                    {combo.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#E1E0CC]/65">
                    {combo.tagline}
                  </p>

                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">
                      ₹{combo.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-[#E1E0CC]/45 line-through">
                      ₹{combo.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {hasItems && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleItems(combo.id)}
                        className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-xs font-medium text-[#E1E0CC]/85 hover:border-white/25"
                      >
                        <span>{isOpen ? "Hide" : "View"} Box Contents</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {isOpen && (
                        <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-[#E1E0CC]/75">
                          {combo.items!.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <Check
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                style={{ color: combo.accent }}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-8 pt-4">
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => updateQty(combo.id, 1)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E1E0CC] py-3 text-sm font-semibold text-black transition-colors hover:bg-[#FFD54A]"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full border border-[#FFD54A] bg-black/60 p-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(combo.id, -1)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-[#FFD54A]">
                        {qty} Box{qty > 1 ? "es" : ""} Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(combo.id, 1)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#FFD54A] text-black hover:bg-[#ffe27a]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-[#E1E0CC]/50">
          Pre-booking is strictly for buyers aged 18+ in compliance with
          applicable fireworks safety and transport guidelines across Andhra
          Pradesh & Telangana. Prepaid UPI orders only.
        </p>
      </section>

      {totalCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[94%] max-w-3xl -translate-x-1/2 rounded-2xl border border-[#FFD54A]/40 bg-zinc-950/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-lg">
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
              onClick={handleProceedToCheckout}
              className="w-full cursor-pointer rounded-full bg-[#FFD54A] px-7 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Proceed to UPI Pre-Book →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
