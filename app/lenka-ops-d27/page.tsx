"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { LogOut, Megaphone, PackageCheck, ShoppingBag, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdsManager } from "@/components/admin/AdsManager";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { CouponsAndCharges } from "@/components/admin/CouponsAndCharges";
import { CustomersManager } from "@/components/admin/CustomersManager";
import { OrderRecord, OrdersManager } from "@/components/admin/OrdersManager";
import { auth, db } from "@/lib/firebase";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<
    "orders" | "products" | "ads" | "coupons" | "customers"
  >("orders");
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        setUser(null);
      } else {
        setUser(u);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<OrderRecord, "id">),
        }))
      );
    });
    return () => unsub();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (email.trim().toLowerCase().endsWith("@users.lenkastore.in")) {
      setAuthError("Customer accounts cannot access Admin.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthError("Invalid admin credentials.");
    }
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

  const paidOrders = orders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "DISPATCHED" ||
      o.status === "IN_TRANSIT" ||
      o.status === "COMPLETED"
  );
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
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
              onClick={() => setTab("products")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "products"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Products
            </button>
            <button
              onClick={() => setTab("ads")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "ads"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              Ads
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
              onClick={() => setTab("customers")}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "customers"
                  ? "bg-[#FFD54A] text-black"
                  : "border border-white/15 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Customers
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

        <AdminStats
          showOrderStats={tab === "orders"}
          totalOrders={orders.length}
          paidCount={paidOrders.length}
          completedCount={completedOrders.length}
          collectedCash={collectedCash}
          pendingCash={pendingCash}
        />

        {tab === "orders" && <OrdersManager orders={orders} />}
        {tab === "products" && <CatalogManager />}
        {tab === "ads" && <AdsManager />}
        {tab === "coupons" && <CouponsAndCharges />}
        {tab === "customers" && <CustomersManager />}
      </div>
    </div>
  );
}
