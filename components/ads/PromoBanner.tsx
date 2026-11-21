"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Megaphone,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

type AdFormat = "BANNER" | "TICKER" | "COUNTDOWN" | "POPUP" | "VIDEO";

interface LiveAd {
  id: string;
  format?: AdFormat;
  title: string;
  subtitle?: string;
  couponCode?: string | null;
  href?: string;
  image?: string | null;
  videoUrl?: string | null;
  endsAt?: string | null;
  active?: boolean;
}

const ADS_CACHE_KEY = "lenka_home_ads";
const CACHE_TTL_MS = 2 * 60 * 1000;

function formatTimeLeft(endsAt: string, now: number) {
  const diff = new Date(endsAt).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${d > 0 ? `${d}d ` : ""}${String(h).padStart(2, "0")}h : ${String(
    m
  ).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
}

export const PromoBanner = () => {
  const [ads, setAds] = useState<LiveAd[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showPopup, setShowPopup] = useState(false);

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
          // Ignore quota
        }
      } catch {
        // Ignore fetch errors
      }
    };

    loadAds();
    return () => {
      active = false;
    };
  }, []);

  const activeAds = ads.filter((a) => a.active !== false);
  const tickers = activeAds.filter((a) => a.format === "TICKER");
  const banners = activeAds.filter((a) => !a.format || a.format === "BANNER");
  const countdowns = activeAds.filter((a) => a.format === "COUNTDOWN");
  const videos = activeAds.filter((a) => a.format === "VIDEO");
  const popupAd = activeAds.find((a) => a.format === "POPUP");

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(
      () => setSlideIdx((i) => (i + 1) % banners.length),
      4000
    );
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    if (countdowns.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [countdowns.length]);

  useEffect(() => {
    if (!popupAd) return;
    try {
      if (sessionStorage.getItem("lenka_popup_seen")) return;
      const t = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem("lenka_popup_seen", "1");
      }, 2500);
      return () => clearTimeout(t);
    } catch {
      // Ignore
    }
  }, [popupAd]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (activeAds.length === 0) return null;

  const currentBanner = banners[slideIdx % Math.max(1, banners.length)];

  return (
    <>
      {/* 1. Top Scrolling Ticker */}
      {tickers.length > 0 && (
        <div className="w-full overflow-hidden border-y border-[#C9A45C]/40 bg-[#C9A45C] py-2 text-[#071410]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 text-xs font-semibold tracking-wide">
            {tickers.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span>{t.title}</span>
                {t.subtitle && <span className="opacity-85">• {t.subtitle}</span>}
                {t.couponCode && (
                  <button
                    type="button"
                    onClick={() => copyCode(t.id, t.couponCode!)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#071410] px-2.5 py-0.5 font-mono text-[11px] text-[#C9A45C]"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedId === t.id ? "Copied!" : t.couponCode}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* 2. Auto-Sliding Banner Carousel */}
        {currentBanner && (
          <div className="relative overflow-hidden rounded-2xl border border-[#C9A45C]/30 bg-[#0D211B] p-5 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                {currentBanner.image ? (
                  <img
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    className="h-20 w-20 shrink-0 rounded-xl border border-[#C9A45C]/25 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#C9A45C]/25 bg-[#071410] text-[#C9A45C]">
                    <Megaphone className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-[#C9A45C] sm:text-lg">
                    {currentBanner.title}
                  </p>
                  {currentBanner.subtitle && (
                    <p className="mt-0.5 text-xs text-[#FFFDF2]/80 sm:text-sm">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentBanner.couponCode && (
                  <button
                    type="button"
                    onClick={() =>
                      copyCode(currentBanner.id, currentBanner.couponCode!)
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#C9A45C]/40 bg-[#071410] px-3.5 py-2 font-mono text-xs font-bold text-[#C9A45C] transition hover:border-[#C9A45C]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedId === currentBanner.id
                      ? "Copied!"
                      : currentBanner.couponCode}
                  </button>
                )}
                <Link
                  href={currentBanner.href || "/diwali-ka-dhamaka"}
                  className="rounded-full bg-[#C9A45C] px-5 py-2 text-xs font-bold text-[#071410] transition hover:bg-[#d8b673]"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {banners.length > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {banners.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${
                        i === slideIdx % banners.length
                          ? "w-6 bg-[#C9A45C]"
                          : "w-2 bg-[#FFFDF2]/25"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSlideIdx(
                        (i) => (i - 1 + banners.length) % banners.length
                      )
                    }
                    className="cursor-pointer rounded-full border border-[#C9A45C]/25 p-1 text-[#FFFDF2]/70 hover:text-[#C9A45C]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSlideIdx((i) => (i + 1) % banners.length)
                    }
                    className="cursor-pointer rounded-full border border-[#C9A45C]/25 p-1 text-[#FFFDF2]/70 hover:text-[#C9A45C]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Flash Deal Countdown Ads */}
        {countdowns.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {countdowns.map((c) => {
              const left = c.endsAt ? formatTimeLeft(c.endsAt, now) : null;
              if (!left) return null;
              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-[#C9A45C]/35 bg-[#0D211B] p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A45C]/30 bg-[#071410] px-3 py-1 font-mono text-xs font-bold text-[#C9A45C]">
                      <Clock className="h-3.5 w-3.5" />
                      {left}
                    </span>
                    {c.couponCode && (
                      <button
                        type="button"
                        onClick={() => copyCode(c.id, c.couponCode!)}
                        className="cursor-pointer rounded-full border border-[#C9A45C]/30 bg-[#071410] px-2.5 py-1 font-mono text-[11px] font-bold text-[#C9A45C]"
                      >
                        {copiedId === c.id ? "Copied!" : c.couponCode}
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#FFFDF2]">{c.title}</p>
                    {c.subtitle && (
                      <p className="mt-1 text-xs text-[#FFFDF2]/75">{c.subtitle}</p>
                    )}
                  </div>
                  <Link
                    href={c.href || "/diwali-ka-dhamaka"}
                    className="inline-block w-fit rounded-full bg-[#C9A45C] px-5 py-1.5 text-xs font-bold text-[#071410] transition hover:bg-[#d8b673]"
                  >
                    Grab Deal
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Video / Reel Ads */}
        {videos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="overflow-hidden rounded-2xl border border-[#C9A45C]/25 bg-[#0D211B]"
              >
                <video
                  src={v.videoUrl || "/hero.mp4.mp4"}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-48 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#C9A45C]">
                      {v.title}
                    </p>
                    {v.subtitle && (
                      <p className="truncate text-xs text-[#FFFDF2]/75">
                        {v.subtitle}
                      </p>
                    )}
                  </div>
                  <Link
                    href={v.href || "/diwali-ka-dhamaka"}
                    className="shrink-0 rounded-full bg-[#C9A45C] px-4 py-1.5 text-xs font-bold text-[#071410] transition hover:bg-[#d8b673]"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Welcome Offer Popup (Once per Session) */}
      {showPopup && popupAd && (
        <div
          onClick={() => setShowPopup(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071410]/85 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-[#C9A45C]/40 bg-[#0D211B] p-6 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute right-4 top-4 cursor-pointer rounded-full bg-[#071410] p-1.5 text-[#FFFDF2]/75 hover:text-[#C9A45C]"
            >
              <X className="h-4 w-4" />
            </button>
            {popupAd.image && (
              <img
                src={popupAd.image}
                alt={popupAd.title}
                className="mx-auto mb-4 h-40 w-full rounded-2xl border border-[#C9A45C]/25 object-cover"
              />
            )}
            <p className="text-xl font-bold text-[#C9A45C]">{popupAd.title}</p>
            {popupAd.subtitle && (
              <p className="mt-2 text-sm text-[#FFFDF2]/80">{popupAd.subtitle}</p>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {popupAd.couponCode && (
                <button
                  type="button"
                  onClick={() => copyCode(popupAd.id, popupAd.couponCode!)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#C9A45C] bg-[#071410] px-4 py-2 font-mono text-xs font-bold text-[#C9A45C]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === popupAd.id
                    ? "Copied!"
                    : `Copy ${popupAd.couponCode}`}
                </button>
              )}
              <Link
                href={popupAd.href || "/diwali-ka-dhamaka"}
                onClick={() => setShowPopup(false)}
                className="rounded-full bg-[#C9A45C] px-6 py-2 text-xs font-bold text-[#071410] transition hover:bg-[#d8b673]"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoBanner;
