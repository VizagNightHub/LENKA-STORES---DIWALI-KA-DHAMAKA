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
      className="relative w-full bg-[#F8FAF9] px-4 py-16 text-[#0B2219] sm:px-8 md:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0B5D3B]">
              Explore Collections
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B2219] sm:text-5xl">
              Pick Your Category
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#4A5D54] sm:text-base">
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
                y: -6,
                rotateX: 2,
                rotateY: idx % 2 === 0 ? -1.5 : 1.5,
              }}
              className="group relative"
            >
              <Link
                href={cat.href}
                className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-[#DCE5DF] bg-white p-7 shadow-[0_6px_24px_rgba(11,59,43,0.06)] transition-all duration-300 hover:border-[#0B5D3B]/45 hover:shadow-[0_12px_32px_rgba(11,59,43,0.12)] sm:min-h-[300px] sm:p-9"
              >
                {/* Royal Green top hairline */}
                <span className="absolute inset-x-0 top-0 h-[3px] bg-[#0B5D3B] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex items-start justify-between gap-5">
                  <div className="flex-1">
                    <span className="inline-block rounded-full border border-[#0B5D3B]/20 bg-[#EDF5F0] px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#0B5D3B]">
                      {cat.tag}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0B2219] sm:text-3xl">
                      {cat.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-[#4A5D54]">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-[#DCE5DF] bg-[#F3F6F4] shadow-sm transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-1 group-hover:scale-105 sm:h-40 sm:w-40">
                    <img
                      src={IMAGE_MAP[cat.id]}
                      alt={cat.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#E6ECE8] pt-4 text-sm font-medium">
                  <span className="text-[#0B2219]/80 transition-colors group-hover:text-[#0B5D3B]">
                    Open {cat.title}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B] transition-all duration-300 group-hover:bg-[#0B5D3B] group-hover:text-white">
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
