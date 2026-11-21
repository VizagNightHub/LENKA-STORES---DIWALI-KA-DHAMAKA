import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] px-4 py-12 text-[#071410] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0D211B]/70 hover:text-[#071410]"
        >
          ← Back to LENKA STORE
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A45C]">
            Policies
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#071410] sm:text-4xl">
            Terms, Shipping &amp; Refund Policy
          </h1>
        </div>

        <div className="rounded-3xl border border-[#0D211B]/10 bg-white p-6 shadow-sm sm:p-8">
          <ul className="list-disc space-y-4 pl-5 text-sm leading-relaxed text-[#0D211B]/80">
            <li>
              <strong className="text-[#071410]">Pan-India Shipping:</strong> Fashion
              Wear, Electronics, and New Launch items ship across India.
            </li>
            <li>
              <strong className="text-[#071410]">Fireworks Restriction:</strong> Diwali
              Ka Dhamaka firecracker combos are supplied strictly within Andhra
              Pradesh &amp; Telangana to buyers aged 18+ in compliance with safety
              regulations.
            </li>
            <li>
              <strong className="text-[#071410]">Prepaid Verification:</strong> All
              orders are verified against your 12-digit UTR and payment screenshot
              before dispatch. Duplicate UTRs are automatically rejected.
            </li>
            <li>
              <strong className="text-[#071410]">Returns &amp; Refunds:</strong> Damaged
              or wrong electronics/fashion items must be reported on WhatsApp (+91
              89776 27028) within 48 hours of delivery with an unboxing video.
              Cancelled/unverified orders are refunded to the source UPI ID within 3–5
              business days.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
