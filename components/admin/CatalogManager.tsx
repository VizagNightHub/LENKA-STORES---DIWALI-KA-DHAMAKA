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
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Megaphone, Pencil, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { STORE_PRODUCTS } from "@/data/catalog";
import { DIWALI_COMBOS } from "@/data/diwaliCombos";
import { db } from "@/lib/firebase";

interface LiveProduct {
  id: string;
  category: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  itemCount?: string;
  items?: string[];
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("diwali-ka-dhamaka");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [badge, setBadge] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const resetForm = () => {
    setEditingId(null);
    setCategory("diwali-ka-dhamaka");
    setName("");
    setTagline("");
    setPrice("");
    setMrp("");
    setBadge("");
    setItemCount("");
    setItemsText("");
    setImages([]);
  };

  const startEdit = (p: LiveProduct) => {
    setEditingId(p.id);
    setCategory(p.category || "diwali-ka-dhamaka");
    setName(p.name || "");
    setTagline(p.tagline || "");
    setPrice(String(p.price || ""));
    setMrp(String(p.mrp || ""));
    setBadge(p.badge || "");
    setItemCount(p.itemCount || "");
    setItemsText(Array.isArray(p.items) ? p.items.join("\n") : "");
    setImages(Array.isArray(p.images) ? p.images : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const syncDefaultsToFirebase = async () => {
    setSyncing(true);
    try {
      for (const combo of DIWALI_COMBOS) {
        await setDoc(
          doc(db, "products", `combo-${combo.id}`),
          {
            category: "diwali-ka-dhamaka",
            name: combo.name,
            tagline: combo.tagline,
            price: combo.price,
            mrp: combo.mrp,
            badge: combo.badge || null,
            itemCount: combo.itemCount,
            items: combo.items,
            images: combo.images,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      for (const prod of STORE_PRODUCTS) {
        await setDoc(
          doc(db, "products", prod.id),
          {
            category: prod.category,
            name: prod.name,
            tagline: prod.tagline,
            price: prod.price,
            mrp: prod.mrp,
            badge: prod.badge || null,
            images: prod.images,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      // Remember that the catalog has been initialized,
      // so deleted items stay deleted even after refresh.
      await setDoc(doc(db, "stats", "catalog"), { initialized: true }, { merge: true });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // Mark catalog as initialized so the storefront never falls back to defaults.
    await setDoc(doc(db, "stats", "catalog"), { initialized: true }, { merge: true });
    await deleteDoc(doc(db, "products", id));
  };

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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);
    const parsedItems = itemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      category,
      name: name.trim(),
      tagline: tagline.trim(),
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      badge: badge.trim() || null,
      itemCount: itemCount.trim() || null,
      items: parsedItems.length > 0 ? parsedItems : null,
      images: images.length > 0 ? images : ["/images/new-launch.png"],
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
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
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Add / Edit Product Form */}
        <form
          onSubmit={handleSaveProduct}
          className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 lg:col-span-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex cursor-pointer items-center gap-1 text-xs text-red-400 hover:underline"
              >
                <X className="h-3.5 w-3.5" /> Cancel Edit
              </button>
            )}
          </div>

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
            placeholder="Product / Combo Name"
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

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Badge (e.g. POPULAR)"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
            />
            <input
              type="text"
              placeholder="Count (e.g. 36 Items)"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
            />
          </div>

          <textarea
            rows={3}
            placeholder="Combo Contents (one item per line — optional)"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-xs outline-none focus:border-[#FFD54A]"
          />

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/40 px-4 py-3 text-xs hover:border-[#FFD54A]">
            <Upload className="h-4 w-4 text-[#FFD54A]" />
            <span>Upload 1–4 Photos for 3D Viewer ({images.length}/4)</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg border border-white/20 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Saving..." : editingId ? "Save Changes" : "Publish Product Live"}
          </button>
        </form>

        {/* Live Products List */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">
              All Store Products ({products.length})
            </h2>
            <button
              type="button"
              onClick={syncDefaultsToFirebase}
              disabled={syncing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#FFD54A]/40 px-3.5 py-1.5 text-xs font-semibold text-[#FFD54A] hover:bg-[#FFD54A]/10"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Loading..." : "Load Default Combos & Items"}
            </button>
          </div>

          {products.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-xs text-[#E1E0CC]/60">
              Click <strong>Load Default Combos &amp; Items</strong> above to bring your Small/Medium/Large combos and default products here to edit!
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
                    <span className="text-[10px] uppercase tracking-wider text-[#FFD54A]">
                      {p.category}
                    </span>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[#E1E0CC]/70">
                      ₹{p.price.toLocaleString("en-IN")} • {p.images?.length || 1} photo(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="cursor-pointer rounded-xl bg-white/10 p-2.5 text-[#FFD54A] hover:bg-white/20"
                    title="Edit Product"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p.id)}
                    className="cursor-pointer rounded-xl bg-red-600/20 p-2.5 text-red-400 hover:bg-red-600 hover:text-white"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
            placeholder="Ad Headline"
            value={adTitle}
            onChange={(e) => setAdTitle(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#FFD54A]"
          />
          <input
            type="text"
            placeholder="Ad Subtitle"
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
