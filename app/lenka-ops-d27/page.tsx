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
  CheckCircle2,
  Eye,
  LogOut,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { CouponsAndCharges } from "@/components/admin/CouponsAndCharges";
import { auth, db } from "@/lib/firebase";

interface OrderItem {
  name: string;
  variant?: string;
  quantity: number;
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
  street?: string;
  landmark?: string;
  houseNo?: string;
  items?: OrderItem[];
  subtotal?: number;
  packingCharge?: number;
  deliveryCharge?: number;
  discount?: number;
  couponCode?: string | null;
  totalAmount?: number;
  utr?: string;
  screenshot?: string;
  status?: string;
  trackingId?: string;
  createdAt?: { seconds?: number };
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState<"orders" | "catalog" | "coupons">("orders");
  const [visitors, setVisitors] = useState(0);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTracking, setSavingTracking] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
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
    });

    return () => {
      unsubStats();
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

  const handleSaveTracking = async (orderId: string) => {
    const trackingId = (trackingInputs[orderId] || "").trim();
    setSavingTracking(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { trackingId });
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
        // Ignore if UTR record doesn't exist
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

  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING_VERIFICATION");
  const collectedCash = confirmedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingCash = pendingOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

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

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Live Website Visitors</span>
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 text-3xl font-bold">{visitors.toLocaleString("en-IN")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Ordered Members</span>
              <ShoppingBag className="h-4 w-4 text-[#FFD54A]" />
            </div>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            <p className="mt-1 text-xs text-zinc-500">{confirmedOrders.length} Confirmed</p>
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

        {tab === "orders" && (
          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
                No orders yet.
              </div>
            ) : (
              orders.map((order) => (
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
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            order.status === "CONFIRMED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : order.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
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
                          order.houseNo,
                          order.street,
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
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                      {order.phone && (
                        <a
                          href={`https://wa.me/91${order.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                            `Hi ${order.customerName || ""}, your LENKA STORE order ${
                              order.orderId || order.id
                            } status is: ${order.status || "PENDING_VERIFICATION"}${
                              order.trackingId ? `. Courier Tracking ID: ${order.trackingId}` : ""
                            }`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-300">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between py-0.5">
                          <span>
                            {it.name}
                            {it.variant ? ` (${it.variant})` : ""} × {it.quantity}
                          </span>
                          <span>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <Truck className="h-4 w-4 text-[#FFD54A]" />
                      <input
                        type="text"
                        placeholder="Enter Courier Tracking ID (e.g. DTDC / Delhivery)"
                        value={trackingInputs[order.id] ?? order.trackingId ?? ""}
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="w-full max-w-sm rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs outline-none focus:border-[#FFD54A]"
                      />
                      <button
                        onClick={() => handleSaveTracking(order.id)}
                        disabled={savingTracking === order.id}
                        className="cursor-pointer rounded-lg bg-[#FFD54A] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#ffdf70] disabled:opacity-50"
                      >
                        {savingTracking === order.id ? "Saving..." : "Save"}
                      </button>
                    </div>

                    {order.screenshot && (
                      <a
                        href={order.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-sky-400 underline"
                      >
                        View Payment Screenshot
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "catalog" && <CatalogManager />}
        {tab === "coupons" && <CouponsAndCharges />}
      </div>
    </div>
  );
}
