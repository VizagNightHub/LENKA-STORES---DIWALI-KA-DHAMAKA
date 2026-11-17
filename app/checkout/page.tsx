"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Copy, ShieldCheck, Smartphone, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORE_CONFIG } from "@/data/storeConfig";
import { db } from "@/lib/firebase";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 720;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<string>(STORE_CONFIG.supportedStates[0]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
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
  )}&am=${total}&cu=INR&tn=${encodeURIComponent("Lenka Store Pre-Book")}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(STORE_CONFIG.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setScreenshot(compressed);
      setError("");
    } catch {
      setError("Could not read screenshot. Please try another image.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUtr = utr.trim();
    if (!name.trim() || !/^\d{10}$/.test(phone.trim())) {
      setError("Enter your full name and a valid 10-digit mobile number.");
      return;
    }
    if (!city.trim() || !address.trim()) {
      setError("Enter your city and full delivery address.");
      return;
    }
    if (!/^\d{12}$/.test(cleanUtr)) {
      setError("Enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }
    if (!screenshot) {
      setError("Please upload your UPI payment screenshot.");
      return;
    }

    setLoading(true);
    try {
      // Block duplicate/repeated UTR numbers
      const utrRef = doc(db, "used_utrs", cleanUtr);
      const utrSnap = await getDoc(utrRef);
      if (utrSnap.exists()) {
        setError("This UTR number has already been used. Duplicate UTRs are blocked.");
        setLoading(false);
        return;
      }

      const newOrderId = `D27-${Date.now().toString().slice(-6)}`;

      await setDoc(utrRef, {
        orderId: newOrderId,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "orders", newOrderId), {
        orderId: newOrderId,
        customerName: name.trim(),
        phone: phone.trim(),
        state,
        city: city.trim(),
        address: address.trim(),
        items: cart,
        totalAmount: total,
        utr: cleanUtr,
        screenshot,
        status: "PENDING_VERIFICATION",
        createdAt: serverTimestamp(),
      });

      localStorage.removeItem("lenka_d27_cart");
      setOrderId(newOrderId);
    } catch {
      setError("Could not save order. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
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
            Your UTR ({utr}) and payment screenshot are saved. Our team will verify your payment and confirm your order shortly.
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
          Back to Store
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
              <h2 className="text-lg font-semibold text-white">2. Pay & Upload Proof</h2>

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
                <p className="text-[#E1E0CC]/65">Step 1: Pay via UPI to:</p>
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
                <p className="mt-2.5 text-[11px] text-[#FFD54A]">
                  Important: After paying, take a screenshot of the payment receipt and upload it below.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#E1E0CC]/75">
                  Step 2: 12-Digit UTR / UPI Reference Number
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

              <div>
                <label className="mb-1.5 block text-xs text-[#E1E0CC]/75">
                  Step 3: Upload Payment Screenshot
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/40 px-4 py-3 text-xs hover:border-[#FFD54A]">
                  <Upload className="h-4 w-4 text-[#FFD54A]" />
                  <span>{screenshot ? "Screenshot Uploaded ✓ (Change)" : "Choose Payment Screenshot"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3.5 text-sm font-bold text-black hover:bg-[#ffe27a] disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                {loading ? "Saving Order..." : "Submit Order & Proof"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
