"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { recordRecentlyViewed } from "@/components/product/RecentlyViewedStrip";
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
          accent: "#0B5D3B",
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
    <main className="min-h-screen bg-[#F8FAF9] pb-24 text-[#0B2219] md:pb-12">
      <header className="sticky top-0 z-30 border-b border-[#DCE5DF] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D54] transition-colors hover:text-[#0B5D3B] sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            LENKA STORE
          </Link>
          <span className="rounded-full bg-[#0B5D3B] px-3 py-1 text-[10px] font-bold tracking-widest text-white sm:text-[11px]">
            DIWALI KA DHAMAKA
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 pt-5 sm:px-8 sm:pt-8">
        <div className="grid items-center gap-5 rounded-2xl border border-[#DCE5DF] bg-[#0B3B2B] p-5 text-white shadow-sm sm:rounded-3xl sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A7F3D0] sm:text-xs">
              Sivakasi Direct • AP &amp; Telangana Only
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
              Festive Cracker Combos
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/80 sm:text-sm">
              Hand-picked Sivakasi firework boxes packed for maximum value.
              Prepaid-only booking via UPI with UTR verification across Andhra
              Pradesh &amp; Telangana.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/90 sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#A7F3D0]" />
                100% Genuine Sivakasi Stock
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                <Truck className="h-3.5 w-3.5 text-[#A7F3D0]" />
                AP &amp; Telangana Priority Supply
              </span>
            </div>
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="relative mx-auto aspect-[4/3] max-w-[240px] overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <img
                src="/images/diwali.png"
                alt="Lenka Store Diwali Ka Dhamaka Combo Boxes"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-3 sm:mt-8 sm:px-8">
        <div className="mb-5 flex justify-end">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0B5D3B] sm:h-4 sm:w-4" />
            <input
              type="text"
              placeholder="Search Diwali combos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-[#DCE5DF] bg-white py-2 pl-9 pr-4 text-xs text-[#0B2219] shadow-sm outline-none focus:border-[#0B5D3B] sm:py-2.5 sm:pl-10 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {displayProducts.map((combo, idx) => {
            const isOpen = !!expanded[combo.id];
            const hasItems = Array.isArray(combo.items) && combo.items.length > 0;
            const discountPct =
              combo.mrp > combo.price
                ? Math.round(((combo.mrp - combo.price) / combo.mrp) * 100)
                : 0;

            return (
              <motion.div
                key={combo.id}
                id={`product-${combo.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative flex flex-col justify-between rounded-xl border border-[#DCE5DF] bg-white p-2.5 shadow-sm transition-all hover:border-[#0B5D3B]/50 hover:shadow-md sm:rounded-2xl sm:p-3.5"
              >
                <div>
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                    <ProductViewer3D
                      images={combo.images}
                      alt={combo.name}
                      accent={combo.accent}
                    />
                    {combo.badge && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-[#0B5D3B] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:left-2.5 sm:top-2.5 sm:text-[10px]">
                        {combo.badge}
                      </span>
                    )}
                    <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                      <ShareProductButton
                        productId={combo.id}
                        productName={combo.name}
                        price={combo.price}
                        categoryPath="/diwali-ka-dhamaka"
                      />
                    </div>
                  </div>

                  <h2 className="mt-2.5 line-clamp-2 text-xs font-bold leading-snug text-[#0B2219] sm:mt-3 sm:text-sm">
                    {combo.name}
                  </h2>
                  {combo.tagline && (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-[#4A5D54] sm:text-xs">
                      {combo.tagline}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
                    <span className="text-sm font-bold text-[#0B5D3B] sm:text-base">
                      ₹{combo.price.toLocaleString("en-IN")}
                    </span>
                    {combo.mrp > combo.price && (
                      <span className="text-[10px] text-[#4A5D54]/50 line-through sm:text-xs">
                        ₹{combo.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-[10px] font-bold text-[#0B5D3B]">
                        {discountPct}% off
                      </span>
                    )}
                  </div>

                  {hasItems && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleItems(combo.id)}
                        className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#DCE5DF] bg-[#F8FAF9] px-2.5 py-1.5 text-[10px] font-semibold text-[#0B2219] hover:border-[#0B5D3B] sm:text-xs"
                      >
                        <span>{isOpen ? "Hide" : "Box"} Contents</span>
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isOpen && (
                        <ul className="mt-2 space-y-1 border-t border-[#E6ECE8] pt-2 text-[10px] text-[#4A5D54] sm:text-xs">
                          {combo.items!.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#0B5D3B]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    recordRecentlyViewed({
                      id: combo.id,
                      name: combo.name,
                      price: combo.price,
                      category: "diwali-ka-dhamaka",
                      image: combo.images?.[0],
                    });
                    addItem({
                      id: combo.id,
                      name: combo.name,
                      price: combo.price,
                      category: "diwali-ka-dhamaka",
                    });
                    openDrawer();
                  }}
                  className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0B5D3B] py-1.5 text-[11px] font-bold text-white transition hover:bg-[#08472D] sm:mt-3 sm:py-2 sm:text-xs"
                >
                  <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Add to Cart
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] text-[#4A5D54] sm:text-xs">
          Pre-booking is strictly for buyers aged 18+ in compliance with
          applicable fireworks safety and transport guidelines across Andhra
          Pradesh &amp; Telangana. Prepaid UPI orders only.
        </p>
      </section>
    </main>
  );
}
