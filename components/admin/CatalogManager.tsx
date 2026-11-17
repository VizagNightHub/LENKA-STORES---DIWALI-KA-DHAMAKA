"use client";

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Megaphone, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface LiveProduct {
  id: string;
  category: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  images: string[];
}

interface LiveAd {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
}

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 720;
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

export const CatalogManager = () => {
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [category, setCategory] = useState("diwali-ka-dhamaka");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [badge, setBadge] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [ads, setAds] = useState<LiveAd[]>([]);
  const [adTitle, setAdTitle] = useState("");
  const [adSubtitle, setAdSubtitle] = useState("");
  const [adHref, setAdHref] = useState("/diwali-ka-dhamaka");
  const [adImage, setAdImage] = useState("");
  const [savingAd, setSavingAd] = useState(false);

  useEffect(() => {
    const q1 = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => {
      setProducts(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveProduct, "id">) }))
      );
    });

    const q2 = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(q2, (snap) => {
      setAds(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveAd, "id">) })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const compressed = await Promise.all(files.slice(0, 4).map(compressPhoto));
    setImages((prev) => [...prev, ...compressed].slice(0, 4));
  };

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressPhoto(file);
    setAdImage(compressed);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), {
        category,
        name: name.trim(),
        tagline: tagline.trim(),
        price: Number(price),
        mrp: Number(mrp) || Number(price),
        badge: badge.trim() || null,
        images: images.length > 0 ? images : ["/images/new-launch.png"],
        createdAt: serverTimestamp(),
      });
      setName("");
      setTagline("");
      setPrice("");
      setMrp("");
      setBadge("");
      setImages([]);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim()) return;
    setSavingAd(true);
    try {
      await addDoc(collection(db, "ads"), {
        title: adTitle.trim(),
        subtitle: adSubtitle.trim(),
        href: adHref,
        image: adImage || null,
        createdAt: serverTimestamp(),
      });
      setAdTitle("");
      setAdSubtitle("");
      setAdImage("");
    } finally {
      setSavingAd(false);
    }
  };

  return (
    <div className="mt-6 space-y-12">
      {/* Products Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleAddProduct}
          className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-5"
        >
          <h2 className="text-lg font-semibold text-white">Add New Product</h2>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          >
            <option value="diwali-ka-dhamaka" className="bg-zinc-900">Diwali Ka Dhamaka</option>
            <option value="fashion-wear" className="bg-zinc-900">Fashion Wear</option>
            <option value="electronics" className="bg-zinc-900">Electronics</option>
            <option value="new-launch" className="bg-zinc-900">New Launch</option>
          </select>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <input
            type="text"
            placeholder="Short Tagline / Description"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
            />
            <input
              type="number"
              placeholder="MRP (₹)"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>
          <input
            type="text"
            placeholder="Badge (optional, e.g. NEW / HOT)"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/40 px-4 py-3 text-xs hover:border-[#FFD54A]">
            <Upload className="h-4 w-4 text-[#FFD54A]" />
            <span>Upload 1–4 Photos for 3D Viewer ({images.length}/4)</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Publishing..." : "Publish Product Live"}
          </button>
        </form>

        <div className="space-y-3 lg:col-span-7">
          <h2 className="text-lg font-semibold text-white">Live Admin Products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-xs text-[#E1E0CC]/60">
              No extra products added from Admin yet.
            </p>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images?.[0] || "/images/new-launch.png"}
                    alt={p.name}
                    className="h-14 w-14 rounded-xl border border-white/15 object-cover"
                  />
                  <div className="text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#FFD54A]">{p.category}</span>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[#E1E0CC]/70">₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDoc(doc(db, "products", p.id))}
                  className="cursor-pointer rounded-xl bg-red-600/20 p-2.5 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Promo Ads Section */}
      <div className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-12">
        <form
          onSubmit={handleAddAd}
          className="space-y-4 rounded-2xl border border-[#FFD54A]/25 bg-zinc-900/80 p-6 lg:col-span-5"
        >
          <div className="flex items-center gap-2 text-[#FFD54A]">
            <Megaphone className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Add Homepage Promo Ad</h2>
          </div>
          <input
            type="text"
            placeholder="Ad Headline (e.g. Early Bird Diwali Combo Offer)"
            value={adTitle}
            onChange={(e) => setAdTitle(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <input
            type="text"
            placeholder="Ad Subtitle (e.g. Pre-book before Oct 15 for free gift)"
            value={adSubtitle}
            onChange={(e) => setAdSubtitle(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <select
            value={adHref}
            onChange={(e) => setAdHref(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          >
            <option value="/diwali-ka-dhamaka" className="bg-zinc-900">Link to: Diwali Ka Dhamaka</option>
            <option value="/fashion-wear" className="bg-zinc-900">Link to: Fashion Wear</option>
            <option value="/electronics" className="bg-zinc-900">Link to: Electronics</option>
            <option value="/new-launch" className="bg-zinc-900">Link to: New Launch</option>
          </select>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/40 px-4 py-3 text-xs hover:border-[#FFD54A]">
            <Upload className="h-4 w-4 text-[#FFD54A]" />
            <span>{adImage ? "Ad Banner Uploaded ✓" : "Upload Ad Image (Optional)"}</span>
            <input type="file" accept="image/*" onChange={handleAdImageUpload} className="hidden" />
          </label>
          <button
            type="submit"
            disabled={savingAd}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {savingAd ? "Publishing..." : "Publish Promo Ad"}
          </button>
        </form>

        <div className="space-y-3 lg:col-span-7">
          <h2 className="text-lg font-semibold text-white">Active Promo Ads ({ads.length})</h2>
          {ads.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-xs text-[#E1E0CC]/60">
              No active promo ads right now.
            </p>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
              >
                <div className="text-xs">
                  <p className="text-sm font-semibold text-white">{ad.title}</p>
                  <p className="text-[#E1E0CC]/70">{ad.subtitle}</p>
                  <span className="text-[10px] text-[#FFD54A]">{ad.href}</span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDoc(doc(db, "ads", ad.id))}
                  className="cursor-pointer rounded-xl bg-red-600/20 p-2.5 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
