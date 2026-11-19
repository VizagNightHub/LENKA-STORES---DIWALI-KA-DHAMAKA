import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-12 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]">
          ← Back to LENKA STORE
        </Link>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm leading-relaxed text-[#E1E0CC]/80">
          LENKA STORE (operated by Lenka Ventures) collects only the details needed to
          process and deliver your order: your name, phone number, delivery address,
          UPI UTR reference, and payment screenshot.
        </p>
        <p className="text-sm leading-relaxed text-[#E1E0CC]/80">
          We never sell or share your personal data with third-party marketers. Payment
          proofs are used strictly for manual verification by our operations team. For
          data removal requests, email <strong>vardhansai8116@gmail.com</strong> or
          message <strong>+91 89776 27028</strong>.
        </p>
      </div>
    </main>
  );
}
