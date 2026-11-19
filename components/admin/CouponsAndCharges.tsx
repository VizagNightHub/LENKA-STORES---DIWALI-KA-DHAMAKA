"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Pencil, Plus, Save, Tag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export type CouponType = "FLAT" | "PERCENT" | "FREE_DELIVERY" | "FREE_PACKING";

interface CouponRecord {
  id: string;
  code: string;
  type?: CouponType;
  discount: number;
  offerNote?: string;
  active: boolean;
}

const DEFAULT_CHARGES = {
  packingCharge: 50,
  hyderabadLocal: 79,
  telanganaNear: 149,
  telanganaRest: 199,
  apCentral: 249,
  apNorthVizag: 299,
  southIndia: 249,
  restOfIndia: 349,
};

export const CouponsAndCharges = () => {
  const [charges, setCharges] = useState(DEFAULT_CHARGES);
  const [savingCharges, setSavingCharges] = useState(false);
  const [chargesMsg, setChargesMsg] = useState("");

  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("FLAT");
  const [discountVal, setDiscountVal] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [savingCoupon, setSavingCoupon] = useState(false);

  useEffect(() => {
    const loadCharges = async () => {
      const snap = await getDoc(doc(db, "settings", "charges"));
      if (snap.exists()) {
        setCharges({ ...DEFAULT_CHARGES, ...snap.data() });
      }
    };
    loadCharges();

    const unsub = onSnapshot(collection(db, "coupons"), (snap) => {
      setCoupons(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CouponRecord, "id">),
        }))
      );
    });

    return () => unsub();
  }, []);

  const handleSaveCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCharges(true);
    setChargesMsg("");
    try {
      await setDoc(
        doc(db, "settings", "charges"),
        {
          packingCharge: Number(charges.packingCharge) || 0,
          hyderabadLocal: Number(charges.hyderabadLocal) || 0,
          telanganaNear: Number(charges.telanganaNear) || 0,
          telanganaRest: Number(charges.telanganaRest) || 0,
          apCentral: Number(charges.apCentral) || 0,
          apNorthVizag: Number(charges.apNorthVizag) || 0,
          southIndia: Number(charges.southIndia) || 0,
          restOfIndia: Number(charges.restOfIndia) || 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setChargesMsg("Charges saved!");
    } finally {
      setSavingCharges(false);
    }
  };

  const resetCouponForm = () => {
    setEditingCode(null);
    setCode("");
    setCouponType("FLAT");
    setDiscountVal("");
    setOfferNote("");
  };

  const startEditCoupon = (c: CouponRecord) => {
    setEditingCode(c.id);
    setCode(c.code || c.id);
    setCouponType(c.type || "FLAT");
    setDiscountVal(String(c.discount ?? ""));
    setOfferNote(c.offerNote || "");
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanCode) return;

    const needsValue = couponType === "FLAT" || couponType === "PERCENT";
    const numVal = needsValue ? Math.max(0, Number(discountVal) || 0) : 0;
    if (needsValue && numVal <= 0 && !offerNote.trim()) return;

    setSavingCoupon(true);
    try {
      await setDoc(
        doc(db, "coupons", cleanCode),
        {
          code: cleanCode,
          type: couponType,
          discount: couponType === "PERCENT" ? Math.min(100, numVal) : numVal,
          offerNote: offerNote.trim() || null,
          active: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      resetCouponForm();
    } finally {
      setSavingCoupon(false);
    }
  };

  const toggleCouponActive = async (c: CouponRecord) => {
    await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, "coupons", id));
  };

  const formatCouponBadge = (c: CouponRecord) => {
    const t = c.type || "FLAT";
    let base = `₹${c.discount} off`;
    if (t === "FREE_DELIVERY") base = "Free Delivery (₹0 shipping)";
    else if (t === "FREE_PACKING") base = "Free Packaging (₹0 packing)";
    else if (t === "PERCENT") base = `${c.discount}% off product total`;
    return c.offerNote ? `${base} • ${c.offerNote}` : base;
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-12">
      {/* Packing & Delivery Charges */}
      <form
        onSubmit={handleSaveCharges}
        className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-5"
      >
        <h2 className="text-lg font-semibold text-white">
          Packing &amp; Delivery Charges (From KPHB)
        </h2>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">
            Packing Charges (₹)
          </label>
          <input
            type="number"
            min={0}
            value={charges.packingCharge}
            onChange={(e) =>
              setCharges({ ...charges, packingCharge: Number(e.target.value) })
            }
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              Hyderabad (500xxx)
            </label>
            <input
              type="number"
              min={0}
              value={charges.hyderabadLocal}
              onChange={(e) =>
                setCharges({
                  ...charges,
                  hyderabadLocal: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              TS Outskirts
            </label>
            <input
              type="number"
              min={0}
              value={charges.telanganaNear}
              onChange={(e) =>
                setCharges({
                  ...charges,
                  telanganaNear: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              Rest of Telangana
            </label>
            <input
              type="number"
              min={0}
              value={charges.telanganaRest}
              onChange={(e) =>
                setCharges({
                  ...charges,
                  telanganaRest: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              AP Central/South
            </label>
            <input
              type="number"
              min={0}
              value={charges.apCentral}
              onChange={(e) =>
                setCharges({ ...charges, apCentral: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              Vizag &amp; North AP
            </label>
            <input
              type="number"
              min={0}
              value={charges.apNorthVizag}
              onChange={(e) =>
                setCharges({ ...charges, apNorthVizag: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              South India (KA/TN/KL)
            </label>
            <input
              type="number"
              min={0}
              value={charges.southIndia}
              onChange={(e) =>
                setCharges({ ...charges, southIndia: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">
            Rest of India (Pan-India)
          </label>
          <input
            type="number"
            min={0}
            value={charges.restOfIndia}
            onChange={(e) =>
              setCharges({ ...charges, restOfIndia: Number(e.target.value) })
            }
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
          />
        </div>

        {chargesMsg && (
          <p className="text-xs font-semibold text-emerald-400">{chargesMsg}</p>
        )}

        <button
          type="submit"
          disabled={savingCharges}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffdf70] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {savingCharges ? "Saving..." : "Save Charges"}
        </button>
      </form>

      {/* Coupon Manager */}
      <div className="space-y-6 lg:col-span-7">
        <form
          onSubmit={handleSaveCoupon}
          className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Tag className="h-5 w-5 text-[#FFD54A]" />
              {editingCode
                ? `Edit Coupon: ${editingCode}`
                : "Create & Activate Coupon Code"}
            </h2>
            {editingCode && (
              <button
                type="button"
                onClick={resetCouponForm}
                className="inline-flex cursor-pointer items-center gap-1 text-xs text-red-400 hover:underline"
              >
                <X className="h-3.5 w-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: "FLAT", label: "Flat ₹ Off" },
              { id: "PERCENT", label: "% Percentage Off" },
              { id: "FREE_DELIVERY", label: "Free Delivery" },
              { id: "FREE_PACKING", label: "Free Packaging" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCouponType(opt.id as CouponType)}
                className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  couponType === opt.id
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : "border-white/15 bg-black/40 text-zinc-300 hover:border-white/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="COUPON CODE (E.G. FREEDELIVERY)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={Boolean(editingCode)}
              required
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm uppercase text-white outline-none focus:border-[#FFD54A] disabled:opacity-60"
            />

            {couponType === "FLAT" || couponType === "PERCENT" ? (
              <input
                type="number"
                min={0}
                max={couponType === "PERCENT" ? 100 : undefined}
                placeholder={
                  couponType === "PERCENT"
                    ? "Discount % (e.g. 15)"
                    : "Discount Amount (₹)"
                }
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
              />
            ) : (
              <div className="flex items-center rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-xs font-semibold text-emerald-300">
                {couponType === "FREE_DELIVERY"
                  ? "Automatically sets Delivery Charge to ₹0"
                  : "Automatically sets Packaging Charge to ₹0"}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Custom Offer / Free Gift Note (Optional, e.g. Free Sparkler Box)"
            value={offerNote}
            onChange={(e) => setOfferNote(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          />

          <button
            type="submit"
            disabled={savingCoupon}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E1E0CC] py-3 text-sm font-bold text-black hover:bg-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {savingCoupon
              ? "Saving..."
              : editingCode
              ? "Update Coupon"
              : "Create & Activate Coupon"}
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">
            All Coupons ({coupons.length})
          </h3>
          {coupons.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <div>
                <p className="font-mono text-sm font-bold text-[#FFD54A]">
                  {c.code || c.id}
                </p>
                <p className="text-xs text-zinc-400">{formatCouponBadge(c)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCouponActive(c)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
                    c.active
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {c.active ? "Active ✓" : "Paused"}
                </button>
                <button
                  type="button"
                  onClick={() => startEditCoupon(c)}
                  className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-[#FFD54A] hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouponsAndCharges;
