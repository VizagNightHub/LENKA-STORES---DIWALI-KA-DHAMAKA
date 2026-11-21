"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

const IMAGE_MAP: Record<string, string> = {
  diwali: "/images/diwali.png",
  fashion: "/images/fashion.png",
  electronics: "/images/electronics.png",
  "new-launch": "/images/new-launch.png",
};

export const CategoryGrid = () => {
  return (
    <section
      id="categories"
      className="relative w-full bg-[#071410] px-4 py-20 text-[#FFFDF2] sm:px-8 md:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A45C]">
              Explore Collections
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Pick Your Category
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#FFFDF2]/70 sm:text-base">
            Select a department below to browse curated drops, festive combos,
            and instant pre-booking offers.
          </p>
        </motion.div>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
          style={{ perspective: "1200px" }}
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -8,
                rotateX: 3,
                rotateY: idx % 2 === 0 ? -2 : 2,
              }}
              className="group relative"
            >
              <Link
                href={cat.href}
                className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-[#C9A45C]/20 bg-[#0D211B] p-7 transition-colors duration-300 hover:border-[#C9A45C]/60 sm:min-h-[320px] sm:p-9"
              >
                {/* Unified Brushed Brass top hairline */}
                <span className="absolute inset-x-0 top-0 h-[2px] bg-[#C9A45C] opacity-55 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex items-start justify-between gap-5">
                  <div className="flex-1">
                    <span className="inline-block rounded-full border border-[#C9A45C]/40 bg-[#071410]/70 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#C9A45C]">
                      {cat.tag}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#FFFDF2] sm:text-3xl">
                      {cat.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-[#FFFDF2]/70">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-[#C9A45C]/25 bg-[#071410] shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:rotate-2 group-hover:scale-110 sm:h-40 sm:w-40">
                    <img
                      src={IMAGE_MAP[cat.id]}
                      alt={cat.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#C9A45C]/15 pt-4 text-sm font-medium">
                  <span className="text-[#FFFDF2]/80 group-hover:text-[#FFFDF2]">
                    Open {cat.title}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A45C]/15 text-[#C9A45C] transition-all duration-300 group-hover:bg-[#C9A45C] group-hover:text-[#071410]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        d="M4.5 11.5 11.5 4.5m0 0H6m5.5 0V10"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
