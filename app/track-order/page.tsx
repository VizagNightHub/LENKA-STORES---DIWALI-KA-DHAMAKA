"use client";

import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Clock, PackageCheck, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";

interface TrackedOrder {
  orderId: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: "PENDING_VERIFICATION" | "CONFIRMED" | "CANCELLED";
  trackingNumber?: string;
  items: { name: string; qty: number; variant?: string }[];
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    const cleanId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim();
    if (!cleanId || !/^\d{10}$/.test(cleanPhone)) {
      setError("Enter your Order ID (e.g. D27-123456) and 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "orders", cleanId));
      if (!snap.exists() || snap.data().phone !== cleanPhone) {
        setError("Order not found. Check your Order ID and mobile number.");
        return;
      }
      setOrder(snap.data() as TrackedOrder);
    } catch {
      setError("Could not check order right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-12 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to LENKA STORE
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-[#E1E0CC]/65">
          Enter your Order ID and mobile number to check live payment verification
          and dispatch status.
        </p>

        <form
          onSubmit={handleTrack}
          className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-6"
        >
          <input
            type="text"
            placeholder="Order ID (e.g. D27-549247)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-[#FFD54A]"
          />
          <input
            type="tel"
            maxLength={10}
            placeholder="10-Digit Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a]"
          >
            <Search className="h-4 w-4" />
            {loading ? "Checking..." : "Track Order"}
          </button>
        </form>

        {order && (
          <div className="mt-6 space-y-4 rounded-3xl border border-[#FFD54A]/35 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-[#FFD54A]">
                {order.orderId}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                {order.status === "CONFIRMED" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                ) : order.status === "CANCELLED" ? (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-[#FFD54A]" />
                )}
                {order.status.replace("_", " ")}
              </span>
            </div>

            <div className="text-xs text-[#E1E0CC]/80">
              <p className="font-semibold text-white">{order.customerName}</p>
              <p className="mt-1">Total Paid: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
              <div className="mt-2 space-y-1">
                {order.items?.map((it, i) => (
                  <div key={i}>
                    • {it.name} {it.variant ? `(${it.variant})` : ""} × {it.qty}
                  </div>
                ))}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="flex items-center gap-2 rounded-xl border border-[#4ADE80]/30 bg-[#4ADE80]/10 p-3 text-xs text-[#4ADE80]">
                <PackageCheck className="h-4 w-4 shrink-0" />
                <span>Courier Tracking ID: <strong>{order.trackingNumber}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
