"use client";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
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
import { useEffect, useState } from "react";
import {
  CancellableOrder,
  CancelOrderModal,
} from "@/components/orders/CancelOrderModal";
import { auth, db } from "@/lib/firebase";

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
  cancelReason?: string;
  cancelComment?: string;
  items?: {
    id?: string;
    name: string;
    variant?: string;
    quantity?: number;
    qty?: number;
  }[];
}

const STEPS = [
  { id: "CONFIRMED", label: "Order Confirmed" },
  { id: "DISPATCHED", label: "Dispatched from Warehouse" },
  { id: "IN_TRANSIT", label: "Out for Delivery" },
  { id: "COMPLETED", label: "Delivery Completed" },
];

function getStepIndex(status?: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return 3;
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") return 2;
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
  const [loggedInPhone, setLoggedInPhone] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancellableOrder | null>(null);

  useEffect(() => {
    let unsubOrders: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }

      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        let phone = u.email.replace("@users.lenkastore.in", "");
        try {
          const cSnap = await getDoc(doc(db, "customers", u.uid));
          if (cSnap.exists() && cSnap.data().phone) {
            phone = cSnap.data().phone;
          }
        } catch {
          // Use email phone fallback
        }
        setLoggedInPhone(phone);

        if (phone) {
          setLoading(true);
          const oq = query(
            collection(db, "orders"),
            where("phone", "==", phone),
            limit(15)
          );
          unsubOrders = onSnapshot(
            oq,
            (snap) => {
              const list = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<TrackedOrder, "id">),
              }));
              setResults(list);
              setSearched(true);
              setLoading(false);
            },
            () => setLoading(false)
          );
        }
      } else {
        setLoggedInPhone(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearched(false);

    const cleanId = orderIdInput.trim().toUpperCase();
    const cleanPhone = phoneInput.replace(/\D/g, "").slice(-10);

    if (!cleanId && cleanPhone.length !== 10) {
      setError(
        "Enter either your Order ID (e.g. D27-123456) OR your 10-digit Mobile Number."
      );
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
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 pb-24 text-[#0B2219] sm:px-8 md:pb-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D54] hover:text-[#0B5D3B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lenka Store
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#0B2219] sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-[#4A5D54]">
          {loggedInPhone
            ? `Showing live orders for your logged-in number (+91 ${loggedInPhone}). You can also search another order below.`
            : "Enter your Order ID or your 10-digit Mobile Number (any one is enough)."}
        </p>

        <form
          onSubmit={handleTrack}
          className="mt-6 space-y-4 rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Order ID (e.g. D27-373826)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 font-mono text-sm uppercase text-[#0B2219] outline-none focus:border-[#0B5D3B]"
            />
            <input
              type="tel"
              maxLength={10}
              placeholder="Or 10-Digit Mobile Number"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] px-4 py-3 font-mono text-sm text-[#0B2219] outline-none focus:border-[#0B5D3B]"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white transition hover:bg-[#08472D] disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? "Checking Order..." : "Track Order"}
          </button>
        </form>

        {searched && results.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[#DCE5DF] bg-white p-6 text-center text-sm text-[#4A5D54] shadow-sm">
            No matching order found. Double-check your Order ID or Mobile Number.
          </div>
        )}

        <div className="mt-6 space-y-5">
          {results.map((order) => {
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === "CANCELLED";
            const canCancel =
              !isCancelled &&
              order.status !== "COMPLETED" &&
              order.status !== "DELIVERED";

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6ECE8] pb-4">
                  <div>
                    <p className="font-mono text-base font-bold text-[#0B2219]">
                      {order.orderId || order.id}
                    </p>
                    <p className="text-xs text-[#4A5D54]">
                      {order.customerName} • {order.city}, {order.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#EDF5F0] px-3 py-1 text-xs font-bold text-[#0B5D3B]">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="mt-4 space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <p className="flex items-center gap-2 font-bold">
                      <XCircle className="h-4 w-4 shrink-0" />
                      Order Cancelled
                    </p>
                    {order.cancelReason && (
                      <p className="pl-6">Reason: {order.cancelReason}</p>
                    )}
                    {order.cancelComment && (
                      <p className="pl-6">Note: {order.cancelComment}</p>
                    )}
                  </div>
                ) : stepIdx === -1 ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#0B5D3B]/20 bg-[#EDF5F0] p-3 text-xs font-semibold text-[#0B5D3B]">
                    <Package className="h-4 w-4 shrink-0" />
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
                              done ? "text-[#0B5D3B]" : "text-[#DCE5DF]"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              done ? "text-[#0B2219]" : "text-[#4A5D54]/50"
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
                  <div className="mt-5 space-y-2 rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4 text-xs">
                    {order.expectedDeliveryDate && (
                      <p className="flex items-center gap-2 text-[#0B2219]">
                        <Calendar className="h-4 w-4 text-[#0B5D3B]" />
                        <span>
                          Expected Delivery:{" "}
                          <strong>{order.expectedDeliveryDate}</strong>
                        </span>
                      </p>
                    )}
                    {order.trackingId && (
                      <p className="flex items-center gap-2 text-[#0B2219]">
                        <Truck className="h-4 w-4 text-[#0B5D3B]" />
                        <span>
                          Courier Tracking ID:{" "}
                          <strong className="font-mono">{order.trackingId}</strong>
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="mt-4 space-y-1 border-t border-[#E6ECE8] pt-3 text-xs text-[#4A5D54]">
                    {order.items.map((it, i) => (
                      <p key={i}>
                        • {it.name}
                        {it.variant ? ` (${it.variant})` : ""} ×{" "}
                        {it.quantity ?? it.qty ?? 1}
                      </p>
                    ))}
                  </div>
                )}

                {canCancel && (
                  <div className="mt-4 flex justify-end border-t border-[#E6ECE8] pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCancelTarget({
                          id: order.id,
                          orderId: order.orderId,
                          totalAmount: order.totalAmount,
                          items: order.items,
                        })
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={(docId, reason, comment) => {
            setResults((prev) =>
              prev.map((o) =>
                o.id === docId
                  ? {
                      ...o,
                      status: "CANCELLED",
                      cancelReason: reason,
                      cancelComment: comment,
                    }
                  : o
              )
            );
            setCancelTarget(null);
          }}
        />
      )}
    </main>
  );
}
