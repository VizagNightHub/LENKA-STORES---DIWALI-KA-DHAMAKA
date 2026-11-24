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
      className="relative w-full bg-[#F8FAF9] px-4 py-12 text-[#0B2219] sm:px-8 md:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0B5D3B]">
              Explore Collections
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2219] sm:text-4xl">
              Shop by Category
            </h2>
          </div>
          <p className="max-w-md text-xs text-[#4A5D54] sm:text-sm">
            Curated drops, festive combos, and instant pre-booking offers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              <Link
                href={cat.href}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white shadow-[0_4px_18px_rgba(11,59,43,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0B5D3B]/50 hover:shadow-[0_12px_28px_rgba(11,59,43,0.12)]"
              >
                {/* Full-Bleed Category Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDF5F0]">
                  <img
                    src={IMAGE_MAP[cat.id]}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0B5D3B] shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:text-[10px]">
                    {cat.tag}
                  </span>
                </div>

                {/* Clean White Footer */}
                <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-[#0B2219] sm:text-lg">
                      {cat.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#4A5D54] sm:text-xs">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#E6ECE8] pt-2.5 text-xs font-semibold">
                    <span className="text-[#0B5D3B]">Explore</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B] transition-all duration-300 group-hover:bg-[#0B5D3B] group-hover:text-white">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3.5 w-3.5"
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
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
