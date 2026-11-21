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
          accent: "#C9A45C",
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
    <main className="min-h-screen bg-[#FAF8F3] pb-32 text-[#071410]">
      <header className="sticky top-0 z-30 border-b border-[#0D211B]/10 bg-[#FAF8F3]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D211B]/80 transition-colors hover:text-[#071410]"
          >
            <ArrowLeft className="h-4 w-4" />
            LENKA STORE
          </Link>
          <span className="rounded-full bg-[#071410] px-3 py-1 text-[11px] font-bold tracking-widest text-[#C9A45C]">
            DIWALI KA DHAMAKA
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 md:pt-14">
        <div className="grid items-center gap-8 rounded-3xl border border-[#C9A45C]/35 bg-[#0D211B] p-6 text-[#FFFDF2] shadow-sm sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A45C]">
              Sivakasi Direct • AP &amp; Telangana Only
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Festive Cracker Combos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#FFFDF2]/75 sm:text-base">
              Hand-picked Sivakasi firework boxes packed for maximum value.
              Prepaid-only booking via UPI with UTR verification across Andhra
              Pradesh &amp; Telangana.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#FFFDF2]/85">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A45C]/30 bg-[#071410] px-3.5 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C9A45C]" />
                100% Genuine Sivakasi Stock
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A45C]/30 bg-[#071410] px-3.5 py-1.5">
                <Truck className="h-3.5 w-3.5 text-[#C9A45C]" />
                AP &amp; Telangana Priority Supply
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-square max-w-[300px] overflow-hidden rounded-2xl border border-[#C9A45C]/30 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
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
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D211B]/50" />
            <input
              type="text"
              placeholder="Search Diwali combos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-[#0D211B]/15 bg-white py-2.5 pl-10 pr-4 text-xs text-[#071410] outline-none focus:border-[#C9A45C]"
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
                className="relative flex flex-col justify-between rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm transition-all hover:border-[#C9A45C] sm:p-8"
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
                      <span className="rounded-full bg-[#C9A45C] px-3 py-1 text-[10px] font-bold tracking-wider text-[#071410]">
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

                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#071410]">
                    {combo.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#0D211B]/65">
                    {combo.tagline}
                  </p>

                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-[#071410]">
                      ₹{combo.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-[#0D211B]/40 line-through">
                      ₹{combo.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {hasItems && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleItems(combo.id)}
                        className="mt-5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#0D211B]/15 bg-[#FAF8F3] px-4 py-2.5 text-xs font-semibold text-[#071410] hover:border-[#C9A45C]"
                      >
                        <span>{isOpen ? "Hide" : "View"} Box Contents</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {isOpen && (
                        <ul className="mt-4 space-y-2 border-t border-[#0D211B]/10 pt-4 text-xs text-[#0D211B]/75">
                          {combo.items!.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A45C]" />
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
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9A45C] py-3 text-sm font-bold text-[#071410] transition-colors hover:bg-[#d8b673]"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-[#0D211B]/55">
          Pre-booking is strictly for buyers aged 18+ in compliance with
          applicable fireworks safety and transport guidelines across Andhra
          Pradesh &amp; Telangana. Prepaid UPI orders only.
        </p>
      </section>
    </main>
  );
}
