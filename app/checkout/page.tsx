"use client";

import { ArrowLeft, CheckCircle2, Copy, Smartphone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORE_CONFIG } from "@/data/storeConfig";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<string>(STORE_CONFIG.supportedStates[0]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lenka_d27_cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
  }, []);

  const total = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const upiLink = `upi://pay?pa=${encodeURIComponent(STORE_CONFIG.upiId)}&pn=${encodeURIComponent(
    STORE_CONFIG.businessName
  )}&am=${total}&cu=INR&tn=${encodeURIComponent("Lenka Store Diwali Pre-Book")}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(STORE_CONFIG.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !/^\d{10}$/.test(phone.trim())) {
      setError("Enter your full name and a valid 10-digit mobile number.");
      return;
    }
    if (!city.trim() || !address.trim()) {
      setError("Enter your city and full delivery address.");
      return;
    }
    if (!/^\d{12}$/.test(utr.trim())) {
      setError("Enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }

    const newOrderId = `D27-${Date.now().toString().slice(-6)}`;
    const itemsText = cart
      .map((c) => `${c.name} x${c.qty} (₹${(c.price * c.qty).toLocaleString("en-IN")})`)
      .join(", ");

    const msg = encodeURIComponent(
      `*NEW PRE-BOOK ORDER (${newOrderId})*\n` +
        `Name: ${name}\nPhone: ${phone}\nLocation: ${city}, ${state}\n` +
        `Address: ${address}\nItems: ${itemsText}\nTotal Paid: ₹${total.toLocaleString("en-IN")}\n` +
        `UTR: ${utr}`
    );

    localStorage.removeItem("lenka_d27_cart");
    setOrderId(newOrderId);
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
  };

  if (orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#E1E0CC]">
        <div className="max-w-md rounded-3xl border border-[#FFD54A]/40 bg-zinc-900 p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#4ADE80]" />
          <h1 className="mt-4 text-2xl font-bold text-white">Pre-Booking Received!</h1>
          <p className="mt-2 text-sm text-[#E1E0CC]/75">
            Order ID: <span className="font-semibold text-[#FFD54A]">{orderId}</span>
          </p>
          <p className="mt-3 text-xs text-[#E1E0CC]/65">
            Your 12-digit UTR ({utr}) is queued for verification. Confirmation will be sent on WhatsApp.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#E1E0CC] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#FFD54A]"
          >
            Back to Lenka Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/diwali-ka-dhamaka"
          className="inline-flex items-center gap-2 text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Combos
        </Link>

        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Prepaid UPI Checkout</h1>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <p className="text-sm text-[#E1E0CC]/70">Your cart is empty.</p>
            <Link
              href="/diwali-ka-dhamaka"
              className="mt-4 inline-block rounded-full bg-[#FFD54A] px-6 py-2.5 text-sm font-semibold text-black"
            >
              Choose a Diwali Combo
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-7">
              <h2 className="text-lg font-semibold text-white">1. Delivery Details</h2>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
              />
              <input
                type="tel"
                maxLength={10}
                placeholder="10-Digit WhatsApp / Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
                >
                  {STORE_CONFIG.supportedStates.map((st) => (
                    <option key={st} value={st} className="bg-zinc-900">
                      {st}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="City / District"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Full Door / Street Address & Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
              />
            </div>

            <div className="space-y-5 rounded-3xl border border-[#FFD54A]/35 bg-zinc-900/90 p-6 lg:col-span-5">
              <h2 className="text-lg font-semibold text-white">2. Pay & Verify UTR</h2>

              <div className="space-y-2 border-b border-white/10 pb-4 text-xs">
                {cart.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span>{c.name} × {c.qty}</span>
                    <span>₹{(c.price * c.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-base font-bold text-[#FFD54A]">
                  <span>Total Payable</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-xs">
                <p className="text-[#E1E0CC]/65">Pay to UPI ID:</p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-white">
                    {STORE_CONFIG.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={copyUpi}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 hover:bg-white/20"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <a
                  href={upiLink}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 font-semibold text-[#FFD54A] hover:bg-white/20"
                >
                  <Smartphone className="h-4 w-4" />
                  Open UPI App to Pay ₹{total.toLocaleString("en-IN")}
                </a>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#E1E0CC]/75">
                  Enter 12-Digit UTR / UPI Reference Number
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 432198765432"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm tracking-widest outline-none focus:border-[#FFD54A]"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3.5 text-sm font-bold text-black hover:bg-[#ffe27a]"
              >
                <ShieldCheck className="h-4 w-4" />
                Confirm Order & Verify UTR
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
