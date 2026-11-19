"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Calendar,
  CheckCircle2,
  Eye,
  LogOut,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { CouponsAndCharges } from "@/components/admin/CouponsAndCharges";
import { auth, db } from "@/lib/firebase";

interface OrderItem {
  name: string;
  variant?: string;
  quantity?: number;
  qty?: number;
  price: number;
}

interface OrderRecord {
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
  subtotal?: number;
  packingCharge?: number;
  deliveryCharge?: number;
  discountAmount?: number;
  discount?: number;
  couponCode?: string | null;
  couponOfferNote?: string | null;
  totalAmount?: number;
  utr?: string;
  screenshot?: string;
  status?: string;
  trackingId?: string;
  expectedDeliveryDate?: string;
  createdAt?: { seconds?: number };
}

interface ActiveSession {
  id: string;
  page?: string;
  device?: string;
  lastSeenMs?: number;
}

type OrderFilter = "PROCESSING" | "COMPLETED" | "CANCELLED" | "ALL";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState<"orders" | "catalog" | "coupons">("orders");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("PROCESSING");
  const [visitors, setVisitors] = useState(0);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showLiveList, setShowLiveList] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [savingTracking, setSavingTracking] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubStats = onSnapshot(collection(db, "stats"), (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        if (d.id === "visitors" || d.id.startsWith("visitors_shard_")) {
          const data = d.data();
          if (typeof data.count === "number") {
            total += data.count;
          }
        }
      });
      setVisitors(total);
    });

    const unsubSessions = onSnapshot(collection(db, "active_sessions"), (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ActiveSession, "id">),
      }));
      setActiveSessions(list);
    });

    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, "id">),
      }));
      setOrders(list);
      setTrackingInputs((prev) => {
        const next = { ...prev };
        list.forEach((o) => {
          if (next[o.id] === undefined && o.trackingId) {
            next[o.id] = o.trackingId;
          }
        });
        return next;
      });
      setDateInputs((prev) => {
        const next = { ...prev };
        list.forEach((o) => {
          if (next[o.id] === undefined && o.expectedDeliveryDate) {
            next[o.id] = o.expectedDeliveryDate;
          }
        });
        return next;
      });
    });

    return () => {
      unsubStats();
      unsubSessions();
      unsubOrders();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthError("Invalid admin credentials.");
    }
  };

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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FFD54A]">
            Private Operations
          </p>
          <h1 className="text-xl font-bold">LENKA D-27 Admin</h1>
          {authError && <p className="text-xs text-red-400">{authError}</p>}
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffdf70]"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  const liveNow = activeSessions
    .filter((s) => s.lastSeenMs && nowMs - s.lastSeenMs <= 120_000)
    .sort((a, b) => (b.lastSeenMs || 0) - (a.lastSeenMs || 0));

  const isCompleted = (s?: string) => s === "COMPLETED";
  const isCancelled = (s?: string) => s === "CANCELLED";
  const isProcessing = (s?: string) => !isCompleted(s) && !isCancelled(s);

  const processingOrders = orders.filter((o) => isProcessing(o.status));
  const completedOrders = orders.filter((o) => isCompleted(o.status));
  const cancelledOrders = orders.filter((o) => isCancelled(o.status));

  const visibleOrders =
    orderFilter === "PROCESSING"
      ? processingOrders
      : orderFilter === "COMPLETED"
      ? completedOrders
      : orderFilter === "CANCELLED"
      ? cancelledOrders
      : orders;

  const paidOrders = orders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "DISPATCHED" ||
      o.status === "IN_TRANSIT" ||
      o.status === "COMPLETED"
  );
  const pendingOrders = orders.filter(
    (o) => !o.status || o.status === "PENDING_VERIFICATION"
  );
  const collectedCash = paidOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );
  const pendingCash = pendingOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );

  const statusBadgeClass = (s?: string) => {
    if (s === "COMPLETED") return "bg-emerald-500/20 text-emerald-300";
    if (s === "CONFIRMED") return "bg-sky-500/20 text-sky-300";
    if (s === "DISPATCHED" || s === "IN_TRANSIT")
      return "bg-purple-500/20 text-purple-300";
    if (s === "CANCELLED") return "bg-red-500/20 text-red-300";
    return "bg-amber-500/20 text-amber-300";
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FFD54A]">
              Private Operations
            </p>
            <h1 className="text-2xl font-bold tracking-tight">LENKA D-27 Admin</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab("orders")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "orders"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setTab("catalog")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "catalog"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Products &amp; Ads
            </button>
            <button
              onClick={() => setTab("coupons")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "coupons"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Coupons &amp; Charges
            </button>
            <button
              onClick={() => signOut(auth)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Row (4 Cards including Live Users Now) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Website Visitors</span>
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 text-3xl font-bold">{visitors.toLocaleString("en-IN")}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowLiveList((v) => !v)}
            className="cursor-pointer rounded-2xl border border-emerald-500/30 bg-zinc-900/70 p-5 text-left transition hover:border-emerald-400"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live Users Now
              </span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{liveNow.length}</p>
            <p className="mt-1 text-[11px] text-zinc-400">
              {showLiveList ? "Click to hide live list" : "Click to view active users"}
            </p>
          </button>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Ordered Members</span>
              <ShoppingBag className="h-4 w-4 text-[#FFD54A]" />
            </div>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {paidOrders.length} Confirmed • {completedOrders.length} Completed
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Collected Cash</span>
              <span className="font-bold text-emerald-400">₹</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              ₹{collectedCash.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Pending Verification: ₹{pendingCash.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Live Users Box */}
        {showLiveList && (
          <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Active Live Users ({liveNow.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowLiveList(false)}
                className="cursor-pointer text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
            {liveNow.length === 0 ? (
              <p className="mt-3 text-xs text-zinc-400">
                No customers currently browsing right this second.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {liveNow.map((s, idx) => {
                  const secAgo = Math.max(
                    0,
                    Math.round((nowMs - (s.lastSeenMs || nowMs)) / 1000)
                  );
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          Client #{idx + 1} • {s.device || "Web"}
                        </p>
                        <p className="font-mono text-[11px] text-[#FFD54A]">
                          {s.page || "/"}
                        </p>
                      </div>
                      <span className="text-[11px] text-emerald-400">
                        {secAgo < 10 ? "Active now" : `${secAgo}s ago`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
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
                        {order.couponCode ? ` (Coupon: ${order.couponCode})` : ""}
                        {order.couponOfferNote ? ` • Gift: ${order.couponOfferNote}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {order.screenshot && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(order.screenshot || null)}
                          className="group flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-black/40 p-1.5 pr-3 hover:border-[#FFD54A]"
                          title="Click to view full payment screenshot"
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
                            {it.variant ? ` (${it.variant})` : ""} ×{" "}
                            {it.quantity ?? it.qty ?? 1}
                          </span>
                          <span>
                            ₹{(it.price * (it.quantity ?? it.qty ?? 1)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <Truck className="h-4 w-4 text-[#FFD54A]" />
                      <input
                        type="text"
                        placeholder="Courier Tracking ID (e.g. DTDC12345)"
                        value={trackingInputs[order.id] ?? order.trackingId ?? ""}
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="w-full max-w-xs rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs outline-none focus:border-[#FFD54A]"
                      />
                      <Calendar className="h-4 w-4 text-[#FFD54A]" />
                      <input
                        type="text"
                        placeholder="Arriving By (e.g. 24 Nov 2026)"
                        value={
                          dateInputs[order.id] ?? order.expectedDeliveryDate ?? ""
                        }
                        onChange={(e) =>
                          setDateInputs((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
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
                </div>
              ))
            )}
          </div>
        )}

        {tab === "catalog" && <CatalogManager />}
        {tab === "coupons" && <CouponsAndCharges />}
      </div>

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
}
