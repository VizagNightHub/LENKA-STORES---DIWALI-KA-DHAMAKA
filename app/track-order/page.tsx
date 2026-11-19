"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";

interface TrackedOrder {
  id: string;
  orderId?: string;
  customerName?: string;
  phone?: string;
  city?: string;
  state?: string;
  totalAmount?: number;
  status?: string;
  trackingId?: string;
  expectedDeliveryDate?: string;
  items?: { name: string; variant?: string; quantity?: number; qty?: number }[];
}

const STEPS = [
  { id: "CONFIRMED", label: "Order Confirmed" },
  { id: "DISPATCHED", label: "Dispatched from Warehouse" },
  { id: "IN_TRANSIT", label: "Out for Delivery" },
  { id: "COMPLETED", label: "Delivery Completed" },
];

function getStepIndex(status?: string) {
  if (status === "COMPLETED") return 3;
  if (status === "IN_TRANSIT") return 2;
  if (status === "DISPATCHED") return 1;
  if (status === "CONFIRMED") return 0;
  return -1;
}

export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [results, setResults] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearched(false);

    const cleanId = orderIdInput.trim().toUpperCase();
    const cleanPhone = phoneInput.replace(/\D/g, "").slice(-10);

    if (!cleanId && cleanPhone.length !== 10) {
      setError("Enter either your Order ID (e.g. D27-123456) OR your 10-digit Mobile Number.");
      return;
    }

    setLoading(true);
    try {
      const found: TrackedOrder[] = [];

      if (cleanId) {
        const snap = await getDoc(doc(db, "orders", cleanId));
        if (snap.exists()) {
          const data = snap.data() as Omit<TrackedOrder, "id">;
          if (!cleanPhone || data.phone === cleanPhone) {
            found.push({ id: snap.id, ...data });
          }
        }
      } else if (cleanPhone.length === 10) {
        const q = query(
          collection(db, "orders"),
          where("phone", "==", cleanPhone),
          limit(10)
        );
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          found.push({ id: d.id, ...(d.data() as Omit<TrackedOrder, "id">) });
        });
      }

      setResults(found);
      setSearched(true);
    } catch {
      setError("Could not look up order right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#E1E0CC]/75 hover:text-[#FFD54A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lenka Store
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-[#E1E0CC]/70">
          Enter your <strong>Order ID</strong> or your <strong>10-digit Mobile Number</strong> (any one is enough).
        </p>

        <form
          onSubmit={handleTrack}
          className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-6"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Order ID (e.g. D27-373826)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm uppercase text-white outline-none focus:border-[#FFD54A]"
            />
            <input
              type="tel"
              maxLength={10}
              placeholder="Or 10-Digit Mobile Number"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a] disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? "Checking Order..." : "Track Order"}
          </button>
        </form>

        {searched && results.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-center text-sm text-zinc-400">
            No matching order found. Double-check your Order ID or Mobile Number.
          </div>
        )}

        <div className="mt-6 space-y-5">
          {results.map((order) => {
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === "CANCELLED";

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-mono text-base font-bold text-[#FFD54A]">
                      {order.orderId || order.id}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {order.customerName} • {order.city}, {order.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs font-semibold text-red-300">
                    <XCircle className="h-4 w-4" />
                    This order was cancelled. Contact support on WhatsApp if you need help.
                  </div>
                ) : stepIdx === -1 ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs font-semibold text-amber-300">
                    <Package className="h-4 w-4" />
                    Payment received — waiting for team verification.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {STEPS.map((st, idx) => {
                      const done = idx <= stepIdx;
                      return (
                        <div key={st.id} className="flex items-center gap-3">
                          <CheckCircle2
                            className={`h-5 w-5 shrink-0 ${
                              done ? "text-emerald-400" : "text-zinc-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              done ? "text-white" : "text-zinc-500"
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(order.expectedDeliveryDate || order.trackingId) && (
                  <div className="mt-5 space-y-2 rounded-2xl border border-[#FFD54A]/25 bg-black/40 p-4 text-xs">
                    {order.expectedDeliveryDate && (
                      <p className="flex items-center gap-2 text-[#FFD54A]">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Expected Delivery: <strong>{order.expectedDeliveryDate}</strong>
                        </span>
                      </p>
                    )}
                    {order.trackingId && (
                      <p className="flex items-center gap-2 text-zinc-200">
                        <Truck className="h-4 w-4 text-sky-400" />
                        <span>
                          Courier Tracking ID:{" "}
                          <strong className="font-mono">{order.trackingId}</strong>
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-xs text-zinc-400">
                    {order.items.map((it, i) => (
                      <p key={i}>
                        • {it.name}
                        {it.variant ? ` (${it.variant})` : ""} × {it.quantity ?? it.qty ?? 1}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
