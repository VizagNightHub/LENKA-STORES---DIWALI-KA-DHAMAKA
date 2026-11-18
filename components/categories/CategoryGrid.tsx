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
      className="relative w-full bg-[#09090b] px-4 py-20 text-[#E1E0CC] sm:px-8 md:px-12"
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FFD54A]">
              Explore Collections
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Pick Your Category
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#E1E0CC]/65 sm:text-base">
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
                className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111114] p-7 transition-colors duration-300 hover:border-white/25 sm:min-h-[320px] sm:p-9"
              >
                {/* Crisp top brand accent hairline */}
                <span
                  className="absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: cat.accent }}
                />

                <div className="relative z-10 flex items-start justify-between gap-5">
                  <div className="flex-1">
                    <span
                      className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.2em]"
                      style={{
                        borderColor: `${cat.accent}55`,
                        color: cat.accent,
                      }}
                    >
                      {cat.tag}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#E1E0CC] sm:text-3xl">
                      {cat.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-[#E1E0CC]/65">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_18px_40px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:rotate-2 group-hover:scale-110 sm:h-40 sm:w-40">
                    <img
                      src={IMAGE_MAP[cat.id]}
                      alt={cat.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-medium">
                  <span className="text-[#E1E0CC]/80 group-hover:text-white">
                    Open {cat.title}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-[#E1E0CC] group-hover:text-black">
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
