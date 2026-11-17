"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ArrowUpRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface AdItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
}

export const PromoBanner = () => {
  const [ads, setAds] = useState<AdItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAds(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdItem, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 md:px-12">
      <div className="grid gap-5 md:grid-cols-2">
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={ad.href || "/diwali-ka-dhamaka"}
            className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-[#FFD54A]/30 bg-zinc-900/90 p-6 transition-all hover:border-[#FFD54A]"
          >
            <div className="z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD54A]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD54A]">
                <Megaphone className="h-3 w-3" />
                Special Offer
              </span>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                {ad.title}
              </h3>
              <p className="text-xs text-[#E1E0CC]/70 sm:text-sm">
                {ad.subtitle}
              </p>
              <span className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[#FFD54A]">
                Grab Offer <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {ad.image && (
              <img
                src={ad.image}
                alt={ad.title}
                className="h-24 w-24 shrink-0 rounded-2xl border border-white/15 object-cover transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
              />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};
