"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";
import { ShareMenuButton } from "@/components/ui/ShareMenuButton";
import { auth, db } from "@/lib/firebase";
import { WordsPullUp } from "./WordsPullUp";

interface HeroBannerAd {
  id: string;
  format?: string;
  title?: string;
  subtitle?: string;
  href?: string | null;
  image?: string | null;
  active?: boolean;
}

export const PrismaHero = () => {
  const [banners, setBanners] = useState<HeroBannerAd[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        const snap = await getDoc(doc(db, "customers", u.uid));
        if (snap.exists()) {
          setProfilePhoto(snap.data().photo || "");
          setProfileName(snap.data().name || "Profile");
        }
      } else {
        setProfilePhoto("");
        setProfileName("");
      }
    });

    let active = true;
    const loadHeroBanners = async () => {
      try {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<HeroBannerAd, "id">) }))
          .filter(
            (a) =>
              a.active !== false &&
              (a.format === "HERO_BANNER" || a.format === "BANNER" || !a.format)
          );
        if (active) setBanners(list);
      } catch {
        // Ignore fetch errors
      }
    };
    loadHeroBanners();
    return () => {
      active = false;
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const scrollToCategories = () => {
    const el = document.getElementById("categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentBanner = banners[slideIdx % Math.max(1, banners.length)];

  return (
    <section className="w-full bg-[#F8FAF9] p-2 sm:p-3">
      {/* P1: Video Hero */}
      <div className="relative h-[34vh] min-h-[240px] w-full overflow-hidden rounded-2xl border border-[#DCE5DF] shadow-md md:h-[62vh] md:rounded-[2rem]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B2219]/40 via-transparent to-[#0B2219]/80" />

        {/* Top-Left Circular Profile Button */}
        <Link
          href="/account"
          title={profileName ? `${profileName} (My Account)` : "Login / My Account"}
          className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/95 text-[#0B5D3B] shadow-md transition hover:scale-105 sm:left-5 sm:top-4 sm:h-11 sm:w-11"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={profileName || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </Link>

        {/* Top-Right Search + Share / Menu */}
        <div className="absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-5 sm:top-4">
          <GlobalSearchBar />
          <ShareMenuButton />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 sm:px-6 md:px-10 md:pb-8">
          <div className="grid grid-cols-12 items-end gap-2 sm:gap-4">
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.88] tracking-[-0.06em] text-[11vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw]"
                style={{ color: "#FFFFFF" }}
              >
                <WordsPullUp text="LENKA STORE" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-row items-center justify-between gap-3 pb-1 lg:col-span-4 lg:flex-col lg:items-start lg:pb-3">
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-xs font-medium tracking-wide text-white/90 sm:text-sm md:text-base"
              >
                Lenka Stores Diwali Ka Dhamaka
              </motion.p>

              <motion.button
                type="button"
                onClick={scrollToCategories}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#0B5D3B] py-1 pl-4 pr-1 text-xs font-bold tracking-wide text-white shadow-lg transition-all hover:bg-[#08472D] sm:py-1.5 sm:pl-5 sm:pr-1.5 sm:text-sm"
              >
                GO AND GRAB IT
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0B5D3B] sm:h-9 sm:w-9">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 2.5v10m0 0-4-4m4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* P2: Front-End Main Banners */}
      {currentBanner && (
        <div className="relative mt-2.5 overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white shadow-[0_6px_24px_rgba(11,59,43,0.06)] md:mt-3 md:rounded-3xl">
          <div className="grid items-center md:grid-cols-12">
            {currentBanner.image && (
              <div className="relative h-44 w-full sm:h-56 md:col-span-5 md:h-64">
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title || "Featured Banner"}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div
              className={`flex flex-col justify-between gap-3 p-4 sm:p-6 ${
                currentBanner.image ? "md:col-span-7" : "md:col-span-12"
              }`}
            >
              <div>
                {currentBanner.title && (
                  <h2 className="text-lg font-bold text-[#0B2219] sm:text-2xl">
                    {currentBanner.title}
                  </h2>
                )}
                {currentBanner.subtitle && (
                  <p className="mt-1 text-xs leading-relaxed text-[#4A5D54] sm:text-sm">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {currentBanner.href ? (
                  <Link
                    href={currentBanner.href}
                    className="inline-flex rounded-full bg-[#0B5D3B] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#08472D]"
                  >
                    Explore Offer →
                  </Link>
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0B5D3B]">
                    LENKA STORE FEATURED
                  </span>
                )}

                {banners.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {banners.map((b, i) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSlideIdx(i)}
                          className={`h-1.5 cursor-pointer rounded-full transition-all ${
                            i === slideIdx % banners.length
                              ? "w-5 bg-[#0B5D3B]"
                              : "w-1.5 bg-[#DCE5DF]"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((i) => (i - 1 + banners.length) % banners.length)
                      }
                      className="cursor-pointer rounded-full border border-[#DCE5DF] p-1 text-[#4A5D54] hover:border-[#0B5D3B] hover:text-[#0B5D3B]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((i) => (i + 1) % banners.length)
                      }
                      className="cursor-pointer rounded-full border border-[#DCE5DF] p-1 text-[#4A5D54] hover:border-[#0B5D3B] hover:text-[#0B5D3B]"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
