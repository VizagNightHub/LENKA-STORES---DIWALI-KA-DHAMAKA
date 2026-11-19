"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface LiveAd {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  image?: string | null;
}

const ADS_CACHE_KEY = "lenka_home_ads";
const CACHE_TTL_MS = 2 * 60 * 1000;

export const PromoBanner = () => {
  const [ads, setAds] = useState<LiveAd[]>([]);

  useEffect(() => {
    let active = true;

    const loadAds = async () => {
      try {
        const cachedRaw = sessionStorage.getItem(ADS_CACHE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as { ts: number; data: LiveAd[] };
          if (Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.data)) {
            if (active) setAds(parsed.data);
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }

      try {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LiveAd, "id">),
        }));

        if (active) setAds(list);

        try {
          sessionStorage.setItem(
            ADS_CACHE_KEY,
            JSON.stringify({ ts: Date.now(), data: list })
          );
        } catch {
          // Ignore quota errors
        }
      } catch {
        // Silently ignore ad fetch errors so homepage never breaks
      }
    };

    loadAds();
    return () => {
      active = false;
    };
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={ad.href || "/diwali-ka-dhamaka"}
            className="group flex items-center gap-4 rounded-2xl border border-[#FFD54A]/30 bg-[#111114] p-4 transition hover:border-[#FFD54A]"
          >
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.title}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFD54A]/15 text-[#FFD54A]">
                <Megaphone className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#FFD54A] group-hover:underline">
                {ad.title}
              </p>
              {ad.subtitle && (
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-300">
                  {ad.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;
