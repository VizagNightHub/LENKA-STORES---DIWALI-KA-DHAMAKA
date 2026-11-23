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
import { MessageSquare, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdsManager } from "@/components/admin/AdsManager";
import { ProductReviewsModal } from "@/components/product/ProductReviewsModal";
import { SUBCATEGORIES } from "@/data/subcategories";
import { db } from "@/lib/firebase";

interface VariantOption {
  label: string;
  stock: number;
}

interface LiveProduct {
  id: string;
  category: string;
  subcategory?: string | null;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  itemCount?: string;
  items?: string[];
  images: string[];
  variants?: VariantOption[];
}

const QUICK_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const QUICK_COLOURS = ["Black", "White", "Red", "Blue", "Gold", "Green"];

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
  const [subcategory, setSubcategory] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [badge, setBadge] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [customVariantLabel, setCustomVariantLabel] = useState("");
  const [customVariantStock, setCustomVariantStock] = useState("10");
  const [saving, setSaving] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const q1 = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => {
      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LiveProduct, "id">),
        }))
      );
    });
    return () => unsub1();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCategory("diwali-ka-dhamaka");
    setSubcategory("");
    setName("");
    setTagline("");
    setPrice("");
    setMrp("");
    setBadge("");
    setItemCount("");
    setItemsText("");
    setImages([]);
    setVariants([]);
    setCustomVariantLabel("");
    setCustomVariantStock("10");
  };

  const startEdit = (p: LiveProduct) => {
    setEditingId(p.id);
    setCategory(p.category || "diwali-ka-dhamaka");
    setSubcategory(p.subcategory || "");
    setName(p.name || "");
    setTagline(p.tagline || "");
    setPrice(String(p.price || ""));
    setMrp(String(p.mrp || ""));
    setBadge(p.badge || "");
    setItemCount(p.itemCount || "");
    setItemsText(Array.isArray(p.items) ? p.items.join("\n") : "");
    setImages(Array.isArray(p.images) ? p.images : []);
    setVariants(Array.isArray(p.variants) ? p.variants : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleVariantOption = (label: string) => {
    setVariants((prev) => {
      const exists = prev.some(
        (v) => v.label.toLowerCase() === label.toLowerCase()
      );
      if (exists) {
        return prev.filter(
          (v) => v.label.toLowerCase() !== label.toLowerCase()
        );
      }
      return [...prev, { label, stock: 10 }];
    });
  };

  const updateVariantStock = (label: string, stockValue: string) => {
    const parsed = Math.max(0, Number(stockValue) || 0);
    setVariants((prev) =>
      prev.map((v) => (v.label === label ? { ...v, stock: parsed } : v))
    );
  };

  const addCustomVariant = () => {
    const clean = customVariantLabel.trim();
    if (!clean) return;
    const stockNum = Math.max(0, Number(customVariantStock) || 0);
    setVariants((prev) => {
      const exists = prev.some(
        (v) => v.label.toLowerCase() === clean.toLowerCase()
      );
      if (exists) {
        return prev.map((v) =>
          v.label.toLowerCase() === clean.toLowerCase()
            ? { ...v, stock: stockNum }
            : v
        );
      }
      return [...prev, { label: clean, stock: stockNum }];
    });
    setCustomVariantLabel("");
    setCustomVariantStock("10");
  };

  const handleDeleteProduct = async (id: string) => {
    await setDoc(
      doc(db, "stats", "catalog"),
      { initialized: true },
      { merge: true }
    );
    await deleteDoc(doc(db, "products", id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const compressed = await Promise.all(files.slice(0, 4).map(compressPhoto));
    setImages((prev) => [...prev, ...compressed].slice(0, 4));
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
      subcategory: subcategory || null,
      name: name.trim(),
      tagline: tagline.trim(),
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      badge: badge.trim() || null,
      itemCount: itemCount.trim() || null,
      items: parsedItems.length > 0 ? parsedItems : null,
      variants: variants.length > 0 ? variants : [],
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

  const subOptions = SUBCATEGORIES[category] || [];

  return (
    <div className="mt-6 space-y-12">
      <div className="grid gap-8 lg:grid-cols-12">
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
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          >
            <option value="diwali-ka-dhamaka" className="bg-zinc-900">
              Diwali Ka Dhamaka
            </option>
            <option value="fashion-wear" className="bg-zinc-900">
              Fashion Wear
            </option>
            <option value="electronics" className="bg-zinc-900">
              Electronics
            </option>
            <option value="new-launch" className="bg-zinc-900">
              New Launch
            </option>
          </select>

          {subOptions.length > 0 && (
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-xl border border-[#FFD54A]/30 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
            >
              <option value="" className="bg-zinc-900">
                Select Subcategory (e.g. {subOptions[0]?.label})
              </option>
              {subOptions.map((sub) => (
                <option key={sub.slug} value={sub.slug} className="bg-zinc-900">
                  {sub.label}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Product / Combo Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          />

          <input
            type="text"
            placeholder="Short Tagline / Description"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
            <input
              type="number"
              placeholder="MRP (₹)"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Badge (e.g. POPULAR)"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
            <input
              type="text"
              placeholder="Count (e.g. 36 Items)"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
            <p className="text-xs font-semibold text-[#FFD54A]">
              Sizes, Colours &amp; Stock Quantity
            </p>

            <div>
              <p className="mb-1.5 text-[11px] text-zinc-400">Quick Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SIZES.map((sz) => {
                  const active = variants.some((v) => v.label === sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleVariantOption(sz)}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        active
                          ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                          : "border-white/15 bg-zinc-900 text-zinc-300 hover:border-white/30"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-zinc-400">Quick Colours</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_COLOURS.map((col) => {
                  const active = variants.some((v) => v.label === col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleVariantOption(col)}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        active
                          ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                          : "border-white/15 bg-zinc-900 text-zinc-300 hover:border-white/30"
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Custom (e.g. Black - L or 128GB)"
                value={customVariantLabel}
                onChange={(e) => setCustomVariantLabel(e.target.value)}
                className="flex-1 rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFD54A]"
              />
              <input
                type="number"
                min={0}
                placeholder="Qty"
                value={customVariantStock}
                onChange={(e) => setCustomVariantStock(e.target.value)}
                className="w-16 rounded-lg border border-white/15 bg-zinc-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#FFD54A]"
              />
              <button
                type="button"
                onClick={addCustomVariant}
                className="cursor-pointer rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                + Add
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2 pt-1">
                {variants.map((v) => (
                  <div
                    key={v.label}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-1.5"
                  >
                    <span className="text-xs font-semibold text-white">
                      {v.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">Stock:</span>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) =>
                          updateVariantStock(v.label, e.target.value)
                        }
                        className="w-16 rounded border border-white/15 bg-black/60 px-2 py-1 text-xs text-white outline-none focus:border-[#FFD54A]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVariantOption(v.label)}
                        className="cursor-pointer text-red-400 hover:text-red-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea
            rows={3}
            placeholder="Combo Contents (one item per line — optional)"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD54A]"
          />

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/30 px-4 py-3 text-xs text-zinc-300 hover:border-[#FFD54A]">
            <Upload className="h-4 w-4 text-[#FFD54A]" />
            <span>Upload 1–4 Photos for 3D Viewer ({images.length}/4)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, idx) => (
                <div key={idx} className="relative h-14 w-14">
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -right-1.5 -top-1.5 cursor-pointer rounded-full bg-red-600 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffdf70] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving
              ? "Saving..."
              : editingId
              ? "Update Product"
              : "Publish Product Live"}
          </button>
        </form>

        <div className="space-y-3 lg:col-span-7">
          <h2 className="text-lg font-semibold text-white">
            All Store Products ({products.length})
          </h2>
          {products.map((p) => {
            const hasLowStock =
              Array.isArray(p.variants) && p.variants.some((v) => v.stock < 3);

            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={p.images?.[0] || "/images/new-launch.png"}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD54A]">
                        {p.category}
                        {p.subcategory ? ` • ${p.subcategory}` : ""}
                      </p>
                      {hasLowStock && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-bold text-white">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      ₹{Number(p.price).toLocaleString("en-IN")} •{" "}
                      {p.images?.length || 1} photo(s)
                      {Array.isArray(p.variants) && p.variants.length > 0
                        ? ` • ${p.variants
                            .map((v) => `${v.label}:${v.stock}`)
                            .join(", ")}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewProduct({ id: p.id, name: p.name })}
                    title="View & Manage Reviews"
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-sky-400 hover:bg-white/10"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-[#FFD54A] hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p.id)}
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

      <AdsManager />

      {reviewProduct && (
        <ProductReviewsModal
          productId={reviewProduct.id}
          productName={reviewProduct.name}
          isAdmin
          onClose={() => setReviewProduct(null)}
        />
      )}
    </div>
  );
};

export default CatalogManager;
