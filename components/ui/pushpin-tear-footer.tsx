"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";

export type IconName = "ig" | "youtube" | "copy" | "check" | "arrow" | "chat" | "pin";

export function BrandSocialIcon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "ig":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="4" />
          <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20l1.1-5.2A8.5 8.5 0 1 1 21 11.5z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M12 10.5V21" />
        </svg>
      );
  }
}

function FooterLink({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

function buildTearPath(seed: number, segments = 36): string {
  const pts: string[] = ["M 0 28"];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 1440;
    const wave = Math.sin(i * 1.7 + seed) * 6 + Math.cos(i * 3.1 + seed * 2) * 4;
    const y = Math.max(4, Math.min(26, 15 + wave));
    pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push("L 1440 32 L 0 32 Z");
  return pts.join(" ");
}

export interface PushpinTearFooterProps {
  brand?: string;
  name?: string;
  credit?: string;
  copyright?: string;
  sheet?: string;
  sheetInk?: string;
  paper?: string;
  paperInk?: string;
  email?: string;
  seed?: number;
  mark?: string;
  timeZone?: string;
  timeLabel?: string;
}

export function PushpinTearFooter({
  brand = "lenka.",
  name = "Lenka Stores · Diwali Ka Dhamaka",
  credit = "Powered by Lenka Ventures",
  copyright = "© 2026 Lenka Stores. All rights reserved.",
  sheet = "#FFB566",
  sheetInk = "#2B1400",
  paper = "#F6EFE4",
  paperInk = "#2B1400",
  email = "vardhansai8116@gmail.com",
  seed = 23,
  mark = "DIWALI 2026",
  timeZone = "Asia/Kolkata",
  timeLabel = "IST",
}: PushpinTearFooterProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const [copied, setCopied] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [subState, setSubState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [clock, setClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-IN", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());
        setClock(formatted);
      } catch {
        setClock("");
      }
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  const tearPath = useMemo(() => buildTearPath(seed), [seed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = subEmail.trim();
    if (!clean || !clean.includes("@")) return;
    setSubState("saving");
    try {
      await addDoc(collection(db, "subscribers"), {
        email: clean,
        feedback: feedback.trim() || null,
        createdAt: serverTimestamp(),
      });
      setSubEmail("");
      setFeedback("");
      setSubState("done");
    } catch {
      setSubState("error");
    }
  };

  const shopLinks = [
    { label: "Diwali Ka Dhamaka", href: "/diwali-ka-dhamaka" },
    { label: "Fashion Wear", href: "/fashion-wear" },
    { label: "Electronics", href: "/electronics" },
    { label: "New Launch", href: "/new-launch" },
  ];

  const followLinks = [
    { label: "Instagram", href: "https://www.instagram.com/the_lenka_8116" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" },
  ];

  const showFeedbackBox = subEmail.trim().length > 0;

  return (
    <footer
      ref={ref}
      className="relative w-full overflow-x-clip"
      style={{ backgroundColor: sheet, color: sheetInk }}
    >
      <div className="relative flex min-h-[620px] w-full flex-col justify-between md:h-[100svh]">
        <div className="relative flex w-full items-center justify-between px-5 pt-6 sm:px-10 md:px-14">
          <div className="flex items-center gap-2.5">
            <FooterLink
              href="https://www.instagram.com/the_lenka_8116"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-current/25 transition-transform hover:scale-110"
            >
              <BrandSocialIcon name="ig" className="h-4 w-4" />
            </FooterLink>
            <FooterLink
              href="https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-current/25 transition-transform hover:scale-110"
            >
              <BrandSocialIcon name="youtube" className="h-4 w-4" />
            </FooterLink>
          </div>

          <motion.div
            initial={{ y: -28, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <svg
              viewBox="0 0 40 48"
              fill="none"
              className="h-10 w-9"
              aria-hidden="true"
            >
              <motion.circle
                cx="20"
                cy="9"
                r="5"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="34"
                initial={{ strokeDashoffset: 34 }}
                animate={inView ? { strokeDashoffset: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.25 }}
              />
              <motion.path
                d="M14 17v22h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                initial={{ strokeDashoffset: 40 }}
                animate={inView ? { strokeDashoffset: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.35 }}
              />
            </svg>
          </motion.div>

          <div className="hidden items-center gap-2 rounded-full border border-current/20 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>pre-booking open · AP &amp; Telangana</span>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-8 px-5 py-8 sm:px-10 md:grid-cols-12 md:items-center md:px-14">
          <div className="space-y-6 md:col-span-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                {mark}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 inline-flex cursor-pointer items-center gap-2.5 text-left text-lg font-bold tracking-tight underline decoration-current/30 underline-offset-4 hover:decoration-current sm:text-xl"
              >
                <span>{email}</span>
                <BrandSocialIcon
                  name={copied ? "check" : "copy"}
                  className="h-4 w-4 shrink-0"
                />
              </button>
              {copied && (
                <p className="mt-1 text-xs font-semibold">Copied to clipboard</p>
              )}
            </div>

            <form onSubmit={handleSubscribe} className="max-w-sm space-y-2.5">
              <label className="block text-xs font-semibold tracking-wide opacity-80">
                share your email &amp; website feedback
              </label>
              <div className="flex items-center gap-2 rounded-full border border-current/30 bg-black/20 p-1">
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => {
                    setSubEmail(e.target.value);
                    if (subState !== "idle") setSubState("idle");
                  }}
                  placeholder="your@email"
                  className="w-full bg-transparent px-4 py-2 text-xs font-medium placeholder:text-current/55 focus:outline-none"
                />
                {!showFeedbackBox && (
                  <button
                    type="submit"
                    disabled={subState === "saving"}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105"
                    style={{ backgroundColor: paper, color: paperInk }}
                    aria-label="Send"
                  >
                    <BrandSocialIcon
                      name={subState === "done" ? "check" : "arrow"}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                )}
              </div>

              {showFeedbackBox && (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write your feedback or website experience (optional)..."
                    className="w-full rounded-2xl border border-current/25 bg-black/20 px-4 py-2.5 text-xs font-medium placeholder:text-current/55 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={subState === "saving"}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: paper, color: paperInk }}
                  >
                    <span>{subState === "saving" ? "Sending..." : "Send Feedback"}</span>
                    <BrandSocialIcon name="arrow" className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {subState === "done" && (
                <p className="text-[11px] font-semibold">
                  Thank you! Your email &amp; feedback have been sent.
                </p>
              )}
              {subState === "error" && (
                <p className="text-[11px] font-semibold">
                  Could not send right now. Please try again.
                </p>
              )}
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:pl-8">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-65">
                shop
              </p>
              <ul className="space-y-2 text-sm font-semibold">
                {shopLinks.map((item, idx) => (
                  <li
                    key={item.label}
                    className={idx >= 2 ? "hidden sm:block" : "block"}
                  >
                    <FooterLink href={item.href} className="hover:underline">
                      {item.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
              <FooterLink
                href="/diwali-ka-dhamaka"
                className="inline-flex items-center gap-1 pt-2 text-base font-extrabold tracking-tight hover:underline"
              >
                shop. <BrandSocialIcon name="arrow" className="h-3.5 w-3.5" />
              </FooterLink>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-65">
                follow
              </p>
              <ul className="space-y-2 text-sm font-semibold">
                {followLinks.map((item, idx) => (
                  <li
                    key={item.label}
                    className={idx >= 2 ? "hidden sm:block" : "block"}
                  >
                    <FooterLink href={item.href} className="hover:underline">
                      {item.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
                <FooterLink
                  href="https://www.instagram.com/the_lenka_8116"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <BrandSocialIcon name="ig" className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                </FooterLink>
                <FooterLink
                  href="https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <BrandSocialIcon name="youtube" className="h-3.5 w-3.5" />
                  <span>YouTube</span>
                </FooterLink>
              </div>

              <FooterLink
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1 pt-1 text-base font-extrabold tracking-tight hover:underline"
              >
                talk. <BrandSocialIcon name="arrow" className="h-3.5 w-3.5" />
              </FooterLink>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full"
        >
          <div
            className="pointer-events-none absolute -top-3 left-4 h-4 w-10 -rotate-3 opacity-35"
            style={{ backgroundColor: sheetInk }}
          />
          <div
            className="pointer-events-none absolute -top-3 right-4 h-4 w-10 rotate-3 opacity-35"
            style={{ backgroundColor: sheetInk }}
          />

          <svg
            viewBox="0 0 1440 32"
            preserveAspectRatio="none"
            className="block h-6 w-full sm:h-8"
            aria-hidden="true"
          >
            <path d={tearPath} fill={paper} />
          </svg>

          <div
            className="px-5 pb-6 pt-3 sm:px-10 md:px-14"
            style={{ backgroundColor: paper, color: paperInk }}
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col justify-between gap-4 border-b border-current/15 pb-5 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-bold tracking-wide sm:text-sm">
                    {name}
                  </p>
                  <p className="mt-1 text-5xl font-black leading-none tracking-[-0.05em] sm:text-7xl md:text-8xl">
                    {brand}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  {clock && (
                    <span className="rounded-full border border-current/20 px-3 py-1 font-mono">
                      {clock} {timeLabel}
                    </span>
                  )}
                  <FooterLink
                    href="https://www.instagram.com/the_lenka_8116"
                    className="rounded-full border border-current/20 px-3 py-1 hover:bg-black/5"
                  >
                    @the_lenka_8116
                  </FooterLink>
                  <FooterLink
                    href="https://wa.me/918977627028"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-bold"
                    style={{ backgroundColor: paperInk, color: paper }}
                  >
                    <BrandSocialIcon name="chat" className="h-3.5 w-3.5" />
                    whatsapp
                  </FooterLink>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-start justify-between gap-2 text-[11px] font-medium opacity-80 sm:flex-row sm:items-center">
                <span>{copyright}</span>
                <span className="font-bold">{credit}</span>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:underline">
                    privacy
                  </Link>
                  <Link href="/terms" className="hover:underline">
                    terms
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
