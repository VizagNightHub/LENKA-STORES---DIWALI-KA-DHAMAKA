"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Plus, Save, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_RATES, DeliveryRates } from "@/lib/deliveryCalculator";
import { db } from "@/lib/firebase";

interface CouponRecord {
  id: string;
  code: string;
  discountAmount: number;
  active: boolean;
}

export const CouponsAndCharges = () => {
  const [rates, setRates] = useState<DeliveryRates>(DEFAULT_RATES);
  const [savingRates, setSavingRates] = useState(false);
  const [ratesSavedMsg, setRatesSavedMsg] = useState(false);

  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [savingCoupon, setSavingCoupon] = useState(false);

  useEffect(() => {
    const unsubRates = onSnapshot(doc(db, "settings", "charges"), (snap) => {
      if (snap.exists()) {
        setRates({ ...DEFAULT_RATES, ...(snap.data() as Partial<DeliveryRates>) });
      }
    });

    const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
    const unsubCoupons = onSnapshot(q, (snap) => {
      setCoupons(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CouponRecord, "id">),
        }))
      );
    });

    return () => {
      unsubRates();
      unsubCoupons();
    };
  }, []);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      await setDoc(doc(db, "settings", "charges"), rates, { merge: true });
      setRatesSavedMsg(true);
      setTimeout(() => setRatesSavedMsg(false), 2500);
    } finally {
      setSavingRates(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");
    const amt = Number(discountAmount);
    if (!cleanCode || !amt || amt <= 0) return;

    setSavingCoupon(true);
    try {
      await setDoc(doc(db, "coupons", cleanCode), {
        code: cleanCode,
        discountAmount: amt,
        active: true,
        createdAt: serverTimestamp(),
      });
      setCode("");
      setDiscountAmount("");
    } finally {
      setSavingCoupon(false);
    }
  };

  const toggleCoupon = async (c: CouponRecord) => {
    await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-12">
      {/* Packing & KPHB Delivery Charges */}
      <form
        onSubmit={handleSaveRates}
        className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-5"
      >
        <h2 className="text-lg font-semibold text-white">
          Packing &amp; Delivery Charges (From KPHB)
        </h2>

        <div>
          <label className="mb-1 block text-xs text-[#E1E0CC]/70">
            Packing Charges (₹)
          </label>
          <input
            type="number"
            value={rates.packingCharge}
            onChange={(e) =>
              setRates({ ...rates, packingCharge: Number(e.target.value) || 0 })
            }
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm outline-none focus:border-[#FFD54A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="mb-1 block text-[#E1E0CC]/70">Hyderabad (500xxx)</label>
            <input
              type="number"
              value={rates.hyderabadLocal}
              onChange={(e) =>
                setRates({ ...rates, hyderabadLocal: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[#E1E0CC]/70">TS Outskirts</label>
            <input
              type="number"
              value={rates.telanganaNear}
              onChange={(e) =>
                setRates({ ...rates, telanganaNear: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[#E1E0CC]/70">Rest of Telangana</label>
            <input
              type="number"
              value={rates.telanganaRest}
              onChange={(e) =>
                setRates({ ...rates, telanganaRest: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[#E1E0CC]/70">AP Central/South</label>
            <input
              type="number"
              value={rates.apCentral}
              onChange={(e) =>
                setRates({ ...rates, apCentral: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-[#E1E0CC]/70">
              Visakhapatnam &amp; North Coastal AP (530xxx–535xxx)
            </label>
            <input
              type="number"
              value={rates.apNorthVizag}
              onChange={(e) =>
                setRates({ ...rates, apNorthVizag: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingRates}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a]"
        >
          <Save className="h-4 w-4" />
          {savingRates ? "Saving..." : ratesSavedMsg ? "Saved ✓" : "Save Charges"}
        </button>
      </form>

      {/* Coupon Code Manager */}
      <div className="space-y-4 lg:col-span-7">
        <form
          onSubmit={handleCreateCoupon}
          className="space-y-4 rounded-2xl border border-[#FFD54A]/25 bg-zinc-900/80 p-6"
        >
          <div className="flex items-center gap-2 text-[#FFD54A]">
            <Tag className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Create &amp; Activate Coupon Code</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Coupon Code (e.g. DIWALI200)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-[#FFD54A]"
            />
            <input
              type="number"
              placeholder="Discount Amount (₹)"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>

          <button
            type="submit"
            disabled={savingCoupon}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E1E0CC] py-3 text-sm font-bold text-black hover:bg-[#FFD54A]"
          >
            <Plus className="h-4 w-4" />
            {savingCoupon ? "Creating..." : "Create & Activate Coupon"}
          </button>
        </form>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-white">
            All Coupons ({coupons.length})
          </h3>
          {coupons.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-xs text-[#E1E0CC]/60">
              No coupon codes yet. Create one above!
            </p>
          ) : (
            coupons.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
              >
                <div>
                  <span className="font-mono text-base font-bold text-[#FFD54A]">
                    {c.code}
                  </span>
                  <p className="text-xs text-[#E1E0CC]/75">
                    Discount: ₹{c.discountAmount.toLocaleString("en-IN")} off
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCoupon(c)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold ${
                      c.active
                        ? "bg-green-600 text-white"
                        : "border border-white/20 bg-black/40 text-[#E1E0CC]/60"
                    }`}
                  >
                    {c.active ? "Active ✓" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDoc(doc(db, "coupons", c.id))}
                    className="cursor-pointer rounded-xl bg-red-600/20 p-2 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
