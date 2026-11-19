"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Megaphone, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export type AdFormat = "BANNER" | "TICKER" | "COUNTDOWN" | "POPUP" | "VIDEO";

export interface LiveAd {
  id: string;
  format?: AdFormat;
  title: string;
  subtitle?: string;
  couponCode?: string | null;
  href?: string;
  image?: string | null;
  videoUrl?: string | null;
  endsAt?: string | null;
  active?: boolean;
}

const AD_FORMATS: { id: AdFormat; label: string }[] = [
  { id: "BANNER", label: "Banner Slider" },
  { id: "TICKER", label: "Top Ticker" },
  { id: "COUNTDOWN", label: "Flash Countdown" },
  { id: "POPUP", label: "Welcome Popup" },
  { id: "VIDEO", label: "Video / Reel" },
];

function compressAdPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AdsManager = () => {
  const [ads, setAds] = useState<LiveAd[]>([]);
  const [format, setFormat] = useState<AdFormat>("BANNER");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [href, setHref] = useState("/diwali-ka-dhamaka");
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAds(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LiveAd, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressAdPhoto(file);
    setImage(compressed);
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "ads"), {
        format,
        title: title.trim(),
        subtitle: subtitle.trim(),
        couponCode: couponCode.trim().toUpperCase() || null,
        href,
        image: image || null,
        videoUrl: format === "VIDEO" ? videoUrl.trim() || "/hero.mp4.mp4" : null,
        endsAt: format === "COUNTDOWN" ? endsAt || null : null,
        active: true,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setSubtitle("");
      setCouponCode("");
      setImage("");
      setVideoUrl("");
      setEndsAt("");
    } finally {
      setSaving(false);
    }
  };

  const toggleAdActive = async (ad: LiveAd) => {
    const currentlyActive = ad.active !== false;
    await updateDoc(doc(db, "ads", ad.id), { active: !currentlyActive });
  };

  const handleDeleteAd = async (id: string) => {
    await deleteDoc(doc(db, "ads", id));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleAddAd}
        className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-5"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Megaphone className="h-5 w-5 text-[#FFD54A]" /> Create Website Ad
        </h2>

        <div>
          <p className="mb-1.5 text-xs text-zinc-400">Select Ad Format</p>
          <div className="flex flex-wrap gap-1.5">
            {AD_FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  format === f.id
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : "border-white/15 bg-black/40 text-zinc-300 hover:border-white/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Ad Headline (e.g. MEGA DIWALI SALE)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
        />

        <input
          type="text"
          placeholder="Ad Subtitle / Offer Details"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
        />

        <input
          type="text"
          placeholder="Coupon Code to Copy (Optional, e.g. NEW2027)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 font-mono text-sm uppercase text-white outline-none focus:border-[#FFD54A]"
        />

        {format === "COUNTDOWN" && (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              Sale Ends At (Date &amp; Time)
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>
        )}

        {format === "VIDEO" && (
          <input
            type="text"
            placeholder="Video URL (e.g. /hero.mp4.mp4 or direct .mp4 link)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          />
        )}

        <select
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
        >
          <option value="/diwali-ka-dhamaka" className="bg-zinc-900">
            Link to: Diwali Ka Dhamaka
          </option>
          <option value="/fashion-wear" className="bg-zinc-900">
            Link to: Fashion Wear
          </option>
          <option value="/electronics" className="bg-zinc-900">
            Link to: Electronics
          </option>
          <option value="/new-launch" className="bg-zinc-900">
            Link to: New Launch
          </option>
        </select>

        {format !== "TICKER" && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/30 px-4 py-3 text-xs text-zinc-300 hover:border-[#FFD54A]">
            <Upload className="h-4 w-4 text-[#FFD54A]" />
            <span>{image ? "Ad Image Selected ✓" : "Upload Ad Image (Optional)"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full cursor-pointer rounded-xl bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffdf70] disabled:opacity-50"
        >
          {saving ? "Publishing..." : "Publish Ad"}
        </button>
      </form>

      <div className="space-y-3 lg:col-span-7">
        <h2 className="text-lg font-semibold text-white">
          All Website Ads ({ads.length})
        </h2>
        {ads.map((ad) => {
          const isActive = ad.active !== false;
          return (
            <div
              key={ad.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-[#FFD54A]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FFD54A]">
                  {ad.format || "BANNER"}
                </span>
                <p className="mt-1 truncate text-sm font-bold text-white">
                  {ad.title}
                </p>
                {ad.subtitle && (
                  <p className="truncate text-xs text-zinc-400">{ad.subtitle}</p>
                )}
                <p className="text-xs text-zinc-500">
                  {ad.href}
                  {ad.couponCode ? ` • Code: ${ad.couponCode}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAdActive(ad)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isActive ? "Active ✓" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAd(ad.id)}
                  className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdsManager;
