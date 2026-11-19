"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  IndianRupee,
  Lock,
  LogOut,
  MessageCircle,
  Package,
  Receipt,
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

interface OrderRecord {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  altPhone?: string;
  pincode?: string;
  state: string;
  district?: string;
  city: string;
  streetRoad?: string;
  landmark?: string;
  address: string;
  items: { name: string; price: number; qty: number; variant?: string }[];
  subtotal?: number;
  packingCharge?: number;
  deliveryCharge?: number;
  couponCode?: string | null;
  discountAmount?: number;
  totalAmount: number;
  utr: string;
  screenshot?: string;
  trackingNumber?: string;
  status: "PENDING_VERIFICATION" | "CONFIRMED" | "CANCELLED";
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [section, setSection] = useState<"orders" | "products" | "charges">("orders");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "PENDING_VERIFICATION" | "CONFIRMED" | "CANCELLED">("ALL");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(q, (snap) => {
      const list: OrderRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, "id">),
      }));
      setOrders(list);
    });

    const unsubVisitors = onSnapshot(doc(db, "stats", "visitors"), (snap) => {
      if (snap.exists()) {
        setVisitorCount(Number(snap.data().count) || 0);
      }
    });

    return () => {
      unsubOrders();
      unsubVisitors();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setLoginError("Invalid email or password.");
    }
  };

  const updateStatus = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  const saveTracking = async (id: string) => {
    const val = (trackingInputs[id] || "").trim();
    if (!val) return;
    await updateDoc(doc(db, "orders", id), { trackingNumber: val });
  };

  const deleteOrder = async (id: string, utr: string) => {
    await deleteDoc(doc(db, "orders", id));
    if (utr) {
      await deleteDoc(doc(db, "used_utrs", utr)).catch(() => {});
    }
  };

  const confirmedCash = orders
    .filter((o) => o.status === "CONFIRMED")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingCash = orders
    .filter((o) => o.status === "PENDING_VERIFICATION")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-[#E1E0CC]">
        Loading...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#E1E0CC]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-zinc-900 p-8"
        >
          <div className="flex items-center gap-2 text-[#FFD54A]">
            <Lock className="h-5 w-5" />
            <h1 className="text-lg font-semibold">LENKA D-27 Team Login</h1>
          </div>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          {loginError && <p className="text-xs text-red-400">{loginError}</p>}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a]"
          >
            Sign In
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-[#E1E0CC] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FFD54A]">
              Private Operations
            </p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              LENKA D-27 Admin
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSection("orders")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${
                section === "orders"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 text-[#E1E0CC]"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setSection("products")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${
                section === "products"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 text-[#E1E0CC]"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Products &amp; Ads
            </button>
            <button
              type="button"
              onClick={() => setSection("charges")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${
                section === "charges"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 text-[#E1E0CC]"
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Coupons &amp; Charges
            </button>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs hover:border-white/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* 3 Live KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between text-xs text-[#E1E0CC]/65">
              <span>Live Website Visitors</span>
              <Eye className="h-4 w-4 text-[#38BDF8]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {visitorCount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between text-xs text-[#E1E0CC]/65">
              <span>Total Ordered Members</span>
              <ShoppingBag className="h-4 w-4 text-[#FFD54A]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {orders.length}
            </p>
            <p className="mt-1 text-[11px] text-[#E1E0CC]/55">
              {orders.filter((o) => o.status === "CONFIRMED").length} Confirmed
            </p>
          </div>

          <div className="rounded-2xl border border-[#4ADE80]/30 bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between text-xs text-[#E1E0CC]/65">
              <span>Total Collected Cash</span>
              <IndianRupee className="h-4 w-4 text-[#4ADE80]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-[#4ADE80]">
              ₹{confirmedCash.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-[#E1E0CC]/55">
              Pending Verification: ₹{pendingCash.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {section === "products" ? (
          <CatalogManager />
        ) : section === "charges" ? (
          <CouponsAndCharges />
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {(["ALL", "PENDING_VERIFICATION", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold ${
                    filter === tab
                      ? "bg-[#FFD54A] text-black"
                      : "border border-white/15 bg-zinc-900 text-[#E1E0CC]/75"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {filteredOrders.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-[#E1E0CC]/60">
                  No orders in this filter yet.
                </p>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 lg:grid-cols-12"
                  >
                    <div className="space-y-1.5 text-xs lg:col-span-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#FFD54A]">
                          {order.orderId}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            order.status === "CONFIRMED"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {order.customerName} • {order.phone}
                        {order.altPhone ? ` / Alt: ${order.altPhone}` : ""}
                      </p>
                      <p className="text-[#E1E0CC]/75">
                        {order.streetRoad ? `${order.streetRoad}, ` : ""}
                        {order.landmark ? `Near ${order.landmark}, ` : ""}
                        {order.address}, {order.city}
                        {order.district ? `, ${order.district}` : ""}, {order.state}
                        {order.pincode ? ` - ${order.pincode}` : ""}
                      </p>
                      <div className="pt-2 text-[#E1E0CC]/85">
                        {order.items?.map((it, i) => (
                          <div key={i}>
                            • {it.name} {it.variant ? `(${it.variant})` : ""} × {it.qty} (₹{(it.price * it.qty).toLocaleString("en-IN")})
                          </div>
                        ))}
                        {order.couponCode && (
                          <div className="mt-1 text-[#4ADE80]">
                            Coupon {order.couponCode}: -₹{(order.discountAmount || 0).toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>

                      {/* Courier Tracking ID */}
                      <div className="flex gap-2 pt-3">
                        <input
                          type="text"
                          placeholder={order.trackingNumber || "Courier Tracking ID"}
                          value={trackingInputs[order.id] ?? order.trackingNumber ?? ""}
                          onChange={(e) =>
                            setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-[11px] outline-none focus:border-[#FFD54A]"
                        />
                        <button
                          type="button"
                          onClick={() => saveTracking(order.id)}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-semibold hover:bg-[#FFD54A] hover:text-black"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 lg:col-span-4">
                      {order.screenshot && (
                        <button
                          type="button"
                          onClick={() => setPreviewImg(order.screenshot!)}
                          className="group relative h-24 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/20"
                        >
                          <img
                            src={order.screenshot}
                            alt="Payment proof"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
                            <ExternalLink className="h-4 w-4 text-white" />
                          </span>
                        </button>
                      )}
                      <div className="text-xs">
                        <p className="text-[#E1E0CC]/60">Grand Total</p>
                        <p className="text-lg font-bold text-white">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-[#E1E0CC]/60">12-Digit UTR</p>
                        <p className="font-mono text-sm font-bold text-[#FFD54A]">
                          {order.utr}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 lg:col-span-3">
                      <button
                        type="button"
                        onClick={() => updateStatus(order.id, "CONFIRMED")}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-500"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Order
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-600/80 py-2 text-xs font-bold text-white hover:bg-red-500"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </button>
                      <a
                        href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(
                          `Hi ${order.customerName}, your Lenka Store order ${order.orderId} (UTR ${order.utr}) status is: ${order.status}.${order.trackingNumber ? ` Tracking ID: ${order.trackingNumber}` : ""}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2 text-xs font-semibold hover:border-[#FFD54A]"
                      >
                        <MessageCircle className="h-4 w-4 text-[#4ADE80]" />
                        WhatsApp Buyer
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteOrder(order.id, order.utr)}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-500/30 py-2 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <img
            src={previewImg}
            alt="Full payment screenshot"
            className="max-h-[90vh] max-w-full rounded-2xl border border-white/20"
          />
        </div>
      )}
    </main>
  );
}
