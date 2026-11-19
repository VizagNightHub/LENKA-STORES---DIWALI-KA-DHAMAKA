import Link from "next/link";
import { BrandSocialIcon } from "@/components/ui/pushpin-tear-footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-12 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]"
        >
          ← Back to LENKA STORE
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FFD54A]">
            About Lenka Ventures
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Direct From Lenka Stores to AP &amp; Telangana
          </h1>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-[#E1E0CC]/80 sm:text-base">
          <p>
            <strong className="text-white">LENKA STORE</strong> is operated by{" "}
            <strong className="text-white">Lenka Ventures</strong>, founded by
            Lenka Vardhan Sai across Hyderabad and Visakhapatnam.
          </p>
          <p>
            For <strong className="text-white">Diwali Ka Dhamaka</strong>, we
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

        <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
            <p className="text-xs text-[#E1E0CC]/55">Sourcing Hub</p>
            <p className="mt-1 font-semibold text-white">Lenka Stores, AP</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
            <p className="text-xs text-[#E1E0CC]/55">Delivery Regions</p>
            <p className="mt-1 font-semibold text-white">AP &amp; Telangana</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
            <p className="text-xs text-[#E1E0CC]/55">Order Model</p>
            <p className="mt-1 font-semibold text-white">Prepaid UPI + UTR</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-xs font-semibold">
          <span className="uppercase tracking-widest text-[#E1E0CC]/55">Follow us:</span>
          <a
            href="https://www.instagram.com/the_lenka_8116"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#111114] px-4 py-2 text-[#E1E0CC] hover:border-[#FFD54A] hover:text-[#FFD54A]"
          >
            <BrandSocialIcon name="ig" className="h-4 w-4" />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#111114] px-4 py-2 text-[#E1E0CC] hover:border-[#FFD54A] hover:text-[#FFD54A]"
          >
            <BrandSocialIcon name="youtube" className="h-4 w-4" />
            <span>YouTube</span>
          </a>
        </div>
      </div>
    </main>
  );
}
