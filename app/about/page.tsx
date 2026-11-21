import Link from "next/link";
import { BrandSocialIcon } from "@/components/ui/pushpin-tear-footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] px-4 py-12 text-[#071410] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0D211B]/70 hover:text-[#071410]"
        >
          ← Back to LENKA STORE
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A45C]">
            About Lenka Ventures
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#071410]">
            Direct From Lenka Stores to AP &amp; Telangana
          </h1>
        </div>

        <div className="space-y-4 rounded-3xl border border-[#0D211B]/10 bg-white p-6 text-sm leading-relaxed text-[#0D211B]/80 shadow-sm sm:p-8 sm:text-base">
          <p>
            <strong className="text-[#071410]">LENKA STORE</strong> is operated by{" "}
            <strong className="text-[#071410]">Lenka Ventures</strong>, founded by
            Lenka Vardhan Sai across Hyderabad and Visakhapatnam.
          </p>
          <p>
            For <strong className="text-[#071410]">Diwali Ka Dhamaka</strong>, we
            source genuine firecracker combo packs directly from Lenka Stores,
            and dispatch pre-booked orders across Andhra Pradesh and
            Telangana without middleman markups.
          </p>
          <p>
            Alongside seasonal festive combos, LENKA STORE curates heavyweight
            streetwear, ANC audio gear, and limited-edition D-27 releases—all
            backed by prepaid UPI checkout and direct team verification.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#0D211B]/10 bg-white p-5 shadow-sm">
            <p className="text-xs text-[#0D211B]/60">Sourcing Hub</p>
            <p className="mt-1 font-bold text-[#071410]">Lenka Stores, AP</p>
          </div>
          <div className="rounded-2xl border border-[#0D211B]/10 bg-white p-5 shadow-sm">
            <p className="text-xs text-[#0D211B]/60">Delivery Regions</p>
            <p className="mt-1 font-bold text-[#071410]">AP &amp; Telangana</p>
          </div>
          <div className="rounded-2xl border border-[#0D211B]/10 bg-white p-5 shadow-sm">
            <p className="text-xs text-[#0D211B]/60">Order Model</p>
            <p className="mt-1 font-bold text-[#071410]">Prepaid UPI + UTR</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[#0D211B]/10 pt-6 text-xs font-semibold">
          <span className="uppercase tracking-widest text-[#0D211B]/60">Follow us:</span>
          <a
            href="https://www.instagram.com/the_lenka_8116"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#0D211B]/15 bg-white px-4 py-2 text-[#071410] transition hover:border-[#C9A45C]"
          >
            <BrandSocialIcon name="ig" className="h-4 w-4" />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#0D211B]/15 bg-white px-4 py-2 text-[#071410] transition hover:border-[#C9A45C]"
          >
            <BrandSocialIcon name="youtube" className="h-4 w-4" />
            <span>YouTube</span>
          </a>
        </div>
      </div>
    </main>
  );
}
