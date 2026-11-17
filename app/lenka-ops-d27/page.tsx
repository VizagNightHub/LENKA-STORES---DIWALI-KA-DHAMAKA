"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { CheckCircle2, ExternalLink, Lock, LogOut, MessageCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

interface OrderRecord {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  items: { name: string; price: number; qty: number }[];
  totalAmount: number;
  utr: string;
  screenshot?: string;
  status: "PENDING_VERIFICATION" | "CONFIRMED" | "CANCELLED";
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING_VERIFICATION" | "CONFIRMED" | "CANCELLED">("ALL");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

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
    const unsub = onSnapshot(q, (snap) => {
      const list: OrderRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRecord, "id">),
      }));
      setOrders(list);
    });
    return () => unsub();
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
              Order & UTR Verification
            </h1>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs hover:border-white/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {/* Status Filter Tabs */}
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

        {/* Orders List */}
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
                {/* Customer & Address */}
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
                  </p>
                  <p className="text-[#E1E0CC]/75">
                    {order.address}, {order.city}, {order.state}
                  </p>
                  <div className="pt-2 text-[#E1E0CC]/85">
                    {order.items?.map((it, i) => (
                      <div key={i}>
                        • {it.name} × {it.qty} (₹{(it.price * it.qty).toLocaleString("en-IN")})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment UTR + Screenshot */}
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
                    <p className="text-[#E1E0CC]/60">Amount Paid</p>
                    <p className="text-lg font-bold text-white">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-[#E1E0CC]/60">12-Digit UTR</p>
                    <p className="font-mono text-sm font-bold text-[#FFD54A]">
                      {order.utr}
                    </p>
                  </div>
                </div>

                {/* Team Verify Actions */}
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
                      `Hi ${order.customerName}, your Lenka Store order ${order.orderId} (UTR ${order.utr}) status is: ${order.status}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2 text-xs font-semibold hover:border-[#FFD54A]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#4ADE80]" />
                    WhatsApp Buyer
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fullscreen Screenshot Modal */}
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
