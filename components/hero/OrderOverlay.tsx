"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const ORDER_STEPS = [
  { title: "Browsing crackers…", sub: "Rockets • Anar • Sparklers" },
  { title: "Added to cart", sub: "Diwali Dhamaka Small ×1" },
  { title: "Paying via UPI…", sub: "Total ₹2,500" },
  { title: "Order placed ✓", sub: "UTR Verified • Fast Dispatch" },
];

export const OrderOverlay = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % ORDER_STEPS.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  const s = ORDER_STEPS[step];
  const done = step === ORDER_STEPS.length - 1;

  return (
    <>
      <div
        className="absolute overflow-hidden rounded-[0.15cqw]"
        style={{
          left: "51.6%",
          top: "49.6%",
          width: "3.3cqw",
          height: "3.3cqw",
          transform: "translate(-50%, -50%) rotate(16deg) skewX(-6deg)",
          background: done
            ? "linear-gradient(135deg,#052e16,#14532d)"
            : "linear-gradient(135deg,#1a1033,#3b1d6e)",
          boxShadow: "0 0 1.6cqw rgba(255,190,80,0.55)",
          transition: "background 0.4s",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full flex-col items-center justify-center text-center leading-tight"
            style={{ color: "#FFE9A8", fontSize: "0.42cqw", padding: "0.2cqw" }}
          >
            <span style={{ fontWeight: 700 }}>{s.title}</span>
            <span style={{ opacity: 0.8, fontSize: "0.32cqw" }}>{s.sub}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-[10px] text-white shadow-xl backdrop-blur-md sm:text-xs"
            style={{ left: "55%", top: "36%" }}
          >
            <div className="font-semibold" style={{ color: "#FFD54A" }}>
              🎉 Order placed!
            </div>
            <div className="opacity-85">Diwali Dhamaka Combo • ₹2,500</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
