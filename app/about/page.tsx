import Link from "next/link";

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
            Direct From Lenka Stores to AP & Telangana
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
            source genuine firecracker combo packs directly from Manufacturing Units, Tamil
            Nadu, and dispatch pre-booked orders across Andhra Pradesh and
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
            <p className="mt-1 font-semibold text-white">Sivakasi, TN</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
            <p className="text-xs text-[#E1E0CC]/55">Delivery Regions</p>
            <p className="mt-1 font-semibold text-white">AP & Telangana</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
            <p className="text-xs text-[#E1E0CC]/55">Order Model</p>
            <p className="mt-1 font-semibold text-white">Prepaid UPI + UTR</p>
          </div>
        </div>
      </div>
    </main>
  );
}
