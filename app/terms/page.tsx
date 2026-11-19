import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-12 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]">
          ← Back to LENKA STORE
        </Link>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Terms, Shipping &amp; Refund Policy
        </h1>
        <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-[#E1E0CC]/80">
          <li>
            <strong>Pan-India Shipping:</strong> Fashion Wear, Electronics, and New
            Launch items ship across India.
          </li>
          <li>
            <strong>Fireworks Restriction:</strong> Diwali Ka Dhamaka firecracker
            combos are supplied strictly within Andhra Pradesh &amp; Telangana to buyers
            aged 18+ in compliance with safety regulations.
          </li>
          <li>
            <strong>Prepaid Verification:</strong> All orders are verified against your
            12-digit UTR and payment screenshot before dispatch. Duplicate UTRs are
            automatically rejected.
          </li>
          <li>
            <strong>Returns &amp; Refunds:</strong> Damaged or wrong electronics/fashion
            items must be reported on WhatsApp (+91 89776 27028) within 48 hours of
            delivery with an unboxing video. Cancelled/unverified orders are refunded
            to the source UPI ID within 3–5 business days.
          </li>
        </ul>
      </div>
    </main>
  );
}
