"use client";

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  Calendar,
  CheckCircle2,
  MessageCircle,
  Trash2,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export interface OrderItem {
  name: string;
  variant?: string;
  quantity?: number;
  qty?: number;
  price: number;
}

export interface OrderRecord {
  id: string;
  orderId?: string;
  customerName?: string;
  phone?: string;
  altPhone?: string;
  pincode?: string;
  state?: string;
  district?: string;
  city?: string;
  streetRoad?: string;
  street?: string;
  landmark?: string;
  houseNo?: string;
  address?: string;
  items?: OrderItem[];
  totalAmount?: number;
  utr?: string;
  screenshot?: string;
  status?: string;
  trackingId?: string;
  expectedDeliveryDate?: string;
}

type OrderFilter = "PROCESSING" | "COMPLETED" | "CANCELLED" | "ALL";

export const OrdersManager = ({ orders }: { orders: OrderRecord[] }) => {
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("PROCESSING");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [savingTracking, setSavingTracking] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setTrackingInputs((prev) => {
      const next = { ...prev };
      orders.forEach((o) => {
        if (next[o.id] === undefined && o.trackingId) next[o.id] = o.trackingId;
      });
      return next;
    });
    setDateInputs((prev) => {
      const next = { ...prev };
      orders.forEach((o) => {
        if (next[o.id] === undefined && o.expectedDeliveryDate) {
          next[o.id] = o.expectedDeliveryDate;
        }
      });
      return next;
    });
  }, [orders]);

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });
  };

  const handleSaveDeliveryDetails = async (orderId: string) => {
    const trackingId = (trackingInputs[orderId] || "").trim();
    const expectedDeliveryDate = (dateInputs[orderId] || "").trim();
    setSavingTracking(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        trackingId,
        expectedDeliveryDate,
      });
    } finally {
      setSavingTracking(null);
    }
  };

  const handleDeleteOrder = async (order: OrderRecord) => {
    if (!confirm(`Delete order ${order.orderId || order.id}?`)) return;
    if (order.utr) {
      try {
        await deleteDoc(doc(db, "used_utrs", order.utr));
      } catch {
        // Ignore
      }
    }
    await deleteDoc(doc(db, "orders", order.id));
  };

  const processingOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  const visibleOrders =
    orderFilter === "PROCESSING"
      ? processingOrders
      : orderFilter === "COMPLETED"
      ? completedOrders
      : orderFilter === "CANCELLED"
      ? cancelledOrders
      : orders;

  const statusBadgeClass = (s?: string) => {
    if (s === "COMPLETED") return "bg-emerald-500/20 text-emerald-300";
    if (s === "CONFIRMED") return "bg-sky-500/20 text-sky-300";
    if (s === "DISPATCHED" || s === "IN_TRANSIT")
      return "bg-purple-500/20 text-purple-300";
    if (s === "CANCELLED") return "bg-red-500/20 text-red-300";
    return "bg-amber-500/20 text-amber-300";
  };

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "PROCESSING", label: `Processing (${processingOrders.length})` },
          { id: "COMPLETED", label: `Completed (${completedOrders.length})` },
          { id: "CANCELLED", label: `Cancelled (${cancelledOrders.length})` },
          { id: "ALL", label: `All Orders (${orders.length})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setOrderFilter(f.id as OrderFilter)}
            className={`cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
              orderFilter === f.id
                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#FFD54A]"
                : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          No orders in this list right now.
        </div>
      ) : (
        visibleOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#FFD54A]">
                    {order.orderId || order.id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status || "PENDING_VERIFICATION"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {order.customerName} • {order.phone}
                  {order.altPhone ? ` (Alt: ${order.altPhone})` : ""}
                </p>
                <p className="text-xs text-zinc-400">
                  {[
                    order.address || order.houseNo,
                    order.streetRoad || order.street,
                    order.landmark,
                    order.city,
                    order.district,
                    order.state,
                    order.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-xs text-zinc-300">
                  UTR: <span className="font-mono text-[#FFD54A]">{order.utr || "N/A"}</span> •
                  Total:{" "}
                  <span className="font-bold text-emerald-400">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {order.screenshot && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(order.screenshot || null)}
                    className="group flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-black/40 p-1.5 pr-3 hover:border-[#FFD54A]"
                  >
                    <img
                      src={order.screenshot}
                      alt="Payment receipt"
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    <span className="text-xs font-semibold text-sky-400 group-hover:text-[#FFD54A]">
                      View Receipt
                    </span>
                  </button>
                )}

                {order.phone && (
                  <a
                    href={`https://wa.me/91${order.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                      `Hi ${order.customerName || ""}, your LENKA STORE order ${
                        order.orderId || order.id
                      } status is: ${order.status || "PENDING_VERIFICATION"}${
                        order.expectedDeliveryDate
                          ? `. Expected Delivery: ${order.expectedDeliveryDate}`
                          : ""
                      }${
                        order.trackingId ? `. Courier Tracking ID: ${order.trackingId}` : ""
                      }`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                <button
                  onClick={() => handleDeleteOrder(order)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-600/80 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              <span className="text-[11px] font-semibold text-zinc-400">
                Update Stage:
              </span>
              {[
                { id: "CONFIRMED", label: "Order Confirmed" },
                { id: "DISPATCHED", label: "Dispatched from Warehouse" },
                { id: "IN_TRANSIT", label: "Out for Delivery" },
                { id: "COMPLETED", label: "Delivery Completed" },
                { id: "CANCELLED", label: "Cancel" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusChange(order.id, st.id)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    order.status === st.id
                      ? st.id === "CANCELLED"
                        ? "border-red-500 bg-red-500/20 text-red-300"
                        : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/30"
                  }`}
                >
                  {st.id === "COMPLETED" && (
                    <CheckCircle2 className="mr-1 inline h-3 w-3" />
                  )}
                  {st.id === "CANCELLED" && (
                    <XCircle className="mr-1 inline h-3 w-3" />
                  )}
                  {st.label}
                </button>
              ))}
            </div>

            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-300">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>
                      {it.name}
                      {it.variant ? ` (${it.variant})` : ""} × {it.quantity ?? it.qty ?? 1}
                    </span>
                    <span>
                      ₹{(it.price * (it.quantity ?? it.qty ?? 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Truck className="h-4 w-4 text-[#FFD54A]" />
              <input
                type="text"
                placeholder="Courier Tracking ID (e.g. DTDC12345)"
                value={trackingInputs[order.id] ?? order.trackingId ?? ""}
                onChange={(e) =>
                  setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                }
                className="w-full max-w-xs rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs outline-none focus:border-[#FFD54A]"
              />
              <Calendar className="h-4 w-4 text-[#FFD54A]" />
              <input
                type="text"
                placeholder="Arriving By (e.g. 24 Nov 2026)"
                value={dateInputs[order.id] ?? order.expectedDeliveryDate ?? ""}
                onChange={(e) =>
                  setDateInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                }
                className="w-full max-w-[200px] rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs outline-none focus:border-[#FFD54A]"
              />
              <button
                onClick={() => handleSaveDeliveryDetails(order.id)}
                disabled={savingTracking === order.id}
                className="cursor-pointer rounded-lg bg-[#FFD54A] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#ffdf70] disabled:opacity-50"
              >
                {savingTracking === order.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))
      )}

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-zinc-950 p-3"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/80 p-1.5 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={previewImage}
              alt="Payment Screenshot"
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
