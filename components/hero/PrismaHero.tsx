"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShareMenuButton } from "@/components/ui/ShareMenuButton";
import { WordsPullUp } from "./WordsPullUp";

const navItems = [
  { label: "Diwali Dhamaka", href: "/diwali-ka-dhamaka" },
  { label: "Fashion Wear", href: "/fashion-wear" },
  { label: "Electronics", href: "/electronics" },
  { label: "New Launch", href: "/new-launch" },
];

export const PrismaHero = () => {
  const scrollToCategories = () => {
    const el = document.getElementById("categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="h-screen w-full p-2 sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black/90 px-4 py-2.5 backdrop-blur-md sm:gap-6 md:gap-10 md:rounded-b-3xl md:px-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-[10px] font-medium text-[#E1E0CC]/80 transition-colors hover:text-[#FFD54A] sm:text-xs md:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute right-4 top-3 z-30 sm:right-6 md:right-8">
          <ShareMenuButton />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-5 sm:px-6 md:px-10 md:pb-8">
          <div className="grid grid-cols-12 items-end gap-4">
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.85] tracking-[-0.07em] text-[17vw] sm:text-[15vw] md:text-[13vw] lg:text-[11vw] xl:text-[10.5vw]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text="LENKA STORE" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-4 pb-2 lg:col-span-4 lg:pb-6">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-sm font-medium tracking-wide text-[#E1E0CC]/85 sm:text-base md:text-lg"
                style={{ lineHeight: 1.25 }}
              >
                Lenka Stores Diwali Ka Dhamaka
              </motion.p>

              <motion.button
                type="button"
                onClick={scrollToCategories}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex cursor-pointer items-center gap-3 self-start rounded-full bg-[#E1E0CC] py-1.5 pl-6 pr-1.5 text-sm font-semibold tracking-wide text-black shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all hover:bg-[#FFD54A] sm:text-base"
              >
                GO AND GRAB IT
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:translate-y-0.5 group-hover:scale-105">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-4 w-4 text-[#E1E0CC]"
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
    </section>
  );
};
