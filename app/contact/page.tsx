import Link from "next/link";

export default function ContactPage() {
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
            Customer & Order Support
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Contact LENKA STORE
          </h1>
          <p className="mt-3 text-sm text-[#E1E0CC]/70">
            Questions about combo packs, bulk pre-bookings, or UTR verification?
            Reach our team directly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <p className="text-xs uppercase tracking-wider text-[#FFD54A]">
              Phone & WhatsApp
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              +91 89776 27028
            </p>
            <a
              href="https://wa.me/918977627028"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-[#4ADE80] hover:underline"
            >
              Message on WhatsApp →
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <p className="text-xs uppercase tracking-wider text-[#FFD54A]">
              Email
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              vardhansai8116@gmail.com
            </p>
            <p className="mt-3 text-xs text-[#E1E0CC]/60">
              Hyderabad & Visakhapatnam Operations
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
