"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { ShareProductButton } from "@/components/product/ShareProductButton";
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
  const { addItem, openDrawer } = useCart();
  const [liveProducts, setLiveProducts] = useState<ComboItem[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
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
    });
    return () => unsubProd();
  }, []);

  const toggleItems = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayProducts = liveProducts.filter((c) =>
    `${c.name} ${c.tagline}`.toLowerCase().includes(search.trim().toLowerCase())
  );

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
              Sivakasi Direct • AP &amp; Telangana Only
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Festive Cracker Combos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#E1E0CC]/70 sm:text-base">
              Hand-picked Sivakasi firework boxes packed for maximum value.
              Prepaid-only booking via UPI with UTR verification across Andhra
              Pradesh &amp; Telangana.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#E1E0CC]/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFD54A]" />
                100% Genuine Sivakasi Stock
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5">
                <Truck className="h-3.5 w-3.5 text-[#FFD54A]" />
                AP &amp; Telangana Priority Supply
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

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
        <div className="mb-8 flex justify-end">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E1E0CC]/50" />
            <input
              type="text"
              placeholder="Search Diwali combos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/15 bg-zinc-900 py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {displayProducts.map((combo, idx) => {
            const isOpen = !!expanded[combo.id];
            const hasItems = Array.isArray(combo.items) && combo.items.length > 0;

            return (
              <motion.div
                key={combo.id}
                id={`product-${combo.id}`}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/75 p-6 transition-all hover:border-white/25 sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <ShareProductButton
                      productId={combo.id}
                      productName={combo.name}
                      price={combo.price}
                      categoryPath="/diwali-ka-dhamaka"
                    />
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
                  <button
                    type="button"
                    onClick={() => {
                      addItem({
                        id: combo.id,
                        name: combo.name,
                        price: combo.price,
                        category: "diwali-ka-dhamaka",
                      });
                      openDrawer();
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E1E0CC] py-3 text-sm font-semibold text-black transition-colors hover:bg-[#FFD54A]"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-[#E1E0CC]/50">
          Pre-booking is strictly for buyers aged 18+ in compliance with
          applicable fireworks safety and transport guidelines across Andhra
          Pradesh &amp; Telangana. Prepaid UPI orders only.
        </p>
      </section>
    </main>
  );
}
