"use client";

import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  Check,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductReviewsModal } from "@/components/product/ProductReviewsModal";
import { ProductViewer3D } from "@/components/product/ProductViewer3D";
import { recordRecentlyViewed } from "@/components/product/RecentlyViewedStrip";
import { ShareProductButton } from "@/components/product/ShareProductButton";
import { auth, db } from "@/lib/firebase";

interface VariantOption {
  label: string;
  stock: number;
}

interface ProductDetail {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  mrp?: number;
  badge?: string;
  images?: string[];
  items?: string[];
  variants?: VariantOption[];
}

interface ReviewItem {
  id: string;
  userName?: string;
  rating: number;
  comment?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params?.id || "");
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [customerUid, setCustomerUid] = useState<string | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lenka_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {
      // Ignore
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.email?.endsWith("@users.lenkastore.in")) {
        setCustomerUid(u.uid);
        const snap = await getDoc(doc(db, "customers", u.uid));
        if (snap.exists() && Array.isArray(snap.data().wishlist)) {
          setWishlist(snap.data().wishlist);
        }
      } else {
        setCustomerUid(null);
      }
    });
    return () => unsub();
  }, []);

  const loadReviews = async (pid: string) => {
    try {
      const rq = query(
        collection(db, "products", pid, "reviews"),
        orderBy("createdAt", "desc")
      );
      const rsnap = await getDocs(rq);
      setReviews(
        rsnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ReviewItem, "id">),
        }))
      );
    } catch {
      // Ignore if no reviews yet
    }
  };

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
          if (active) setLoading(false);
          return;
        }
        const data = {
          id: snap.id,
          ...(snap.data() as Omit<ProductDetail, "id">),
        };
        if (active) {
          setProduct(data);
          if (Array.isArray(data.variants)) {
            const firstAvailable = data.variants.find((v) => v.stock > 0);
            if (firstAvailable) setSelectedVariant(firstAvailable.label);
          }
          recordRecentlyViewed({
            id: data.id,
            name: data.name,
            price: Number(data.price) || 0,
            category: data.category,
            image: data.images?.[0],
          });
          setLoading(false);
        }
        loadReviews(productId);
      } catch {
        if (active) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  const toggleWishlist = async () => {
    if (!product) return;
    const exists = wishlist.includes(product.id);
    const updated = exists
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id];
    setWishlist(updated);
    try {
      localStorage.setItem("lenka_wishlist", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (customerUid) {
      try {
        await updateDoc(doc(db, "customers", customerUid), {
          wishlist: exists ? arrayRemove(product.id) : arrayUnion(product.id),
        });
      } catch {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] text-sm text-[#4A5D54]">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAF9] px-4 text-center text-[#0B2219]">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-sm text-[#4A5D54]">
          This item may have been removed or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-5 rounded-full bg-[#0B5D3B] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#08472D]"
        >
          Back to Store
        </Link>
      </main>
    );
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const availableVariants = variants.filter((v) => v.stock > 0);
  const isOutOfStock = variants.length > 0 && availableVariants.length === 0;
  const price = Number(product.price || 0);
  const mrp = Number(product.mrp || 0);
  const discountPct =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const liked = wishlist.includes(product.id);
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const handleAdd = (goToCheckout = false) => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      variant: selectedVariant || availableVariants[0]?.label,
      category: product.category,
    });
    if (goToCheckout) {
      router.push("/checkout");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] pb-24 text-[#0B2219] md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Top Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${product.category}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A5D54] hover:text-[#0B5D3B] sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {product.category.replace(/-/g, " ")}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleWishlist}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DCE5DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2219] shadow-sm hover:border-[#0B5D3B]"
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  liked ? "fill-red-500 text-red-500" : "text-[#0B5D3B]"
                }`}
              />
              {liked ? "Saved" : "Wishlist"}
            </button>
            <ShareProductButton
              productId={product.id}
              productName={product.name}
              price={price}
              categoryPath={`/product/${product.id}`}
            />
          </div>
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid gap-8 rounded-3xl border border-[#DCE5DF] bg-white p-4 shadow-sm sm:p-8 lg:grid-cols-12">
          {/* Left: Interactive Gallery */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9]">
              <ProductViewer3D
                images={
                  product.images?.length
                    ? product.images
                    : ["/images/new-launch.png"]
                }
                alt={product.name}
              />
              {product.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-[#0B5D3B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right: Details, Variants, Buy Actions */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EDF5F0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0B5D3B]">
                  {product.category.replace(/-/g, " ")}
                </span>
                {avgRating && (
                  <button
                    type="button"
                    onClick={() => setShowReviewsModal(true)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#DCE5DF] bg-[#F8FAF9] px-2.5 py-1 text-xs font-bold text-[#0B2219]"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {avgRating} ({reviews.length})
                  </button>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0B2219] sm:text-3xl">
                {product.name}
              </h1>

              {(product.tagline || product.description) && (
                <p className="mt-2 text-sm leading-relaxed text-[#4A5D54]">
                  {product.description || product.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-baseline gap-3 border-y border-[#E6ECE8] py-4">
                <span className="text-3xl font-bold text-[#0B5D3B]">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {mrp > price && (
                  <span className="text-sm text-[#4A5D54]/55 line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="rounded-full bg-[#EDF5F0] px-2.5 py-0.5 text-xs font-bold text-[#0B5D3B]">
                    Save {discountPct}%
                  </span>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4A5D54]">
                    Select Option
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const out = v.stock <= 0;
                      const selected = selectedVariant === v.label;
                      return (
                        <button
                          key={v.label}
                          type="button"
                          disabled={out}
                          onClick={() => setSelectedVariant(v.label)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                            out
                              ? "cursor-not-allowed border-[#DCE5DF] bg-[#F8FAF9] text-[#4A5D54]/40 line-through"
                              : selected
                              ? "cursor-pointer border-[#0B5D3B] bg-[#0B5D3B] text-white"
                              : "cursor-pointer border-[#DCE5DF] bg-[#F8FAF9] text-[#0B2219] hover:border-[#0B5D3B]"
                          }`}
                        >
                          {v.label} ({v.stock} left)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Box Contents / Highlights */}
              {Array.isArray(product.items) && product.items.length > 0 && (
                <div className="mt-5 rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#0B5D3B]">
                    What&apos;s Included
                  </p>
                  <ul className="grid gap-1.5 text-xs text-[#4A5D54] sm:grid-cols-2">
                    {product.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B5D3B]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons & Trust Strip */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleAdd(false)}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#0B5D3B] bg-white py-3 text-sm font-bold text-[#0B5D3B] transition hover:bg-[#EDF5F0] disabled:cursor-not-allowed disabled:border-[#DCE5DF] disabled:text-[#4A5D54]/50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleAdd(true)}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white transition hover:bg-[#08472D] disabled:cursor-not-allowed disabled:bg-[#DCE5DF] disabled:text-[#4A5D54]/60"
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-3 text-[11px] font-semibold text-[#4A5D54]">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 shrink-0 text-[#0B5D3B]" />
                  {product.category === "diwali-ka-dhamaka"
                    ? "AP & Telangana Priority Delivery"
                    : "Fast Pan-India Delivery"}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B5D3B]" />
                  Verified UPI Prepaid Checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-8 rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6ECE8] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0B2219]">
                Customer Reviews ({reviews.length})
              </h2>
              <p className="text-xs text-[#4A5D54]">
                Verified feedback from LENKA STORE shoppers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewsModal(true)}
              className="cursor-pointer rounded-full bg-[#0B5D3B] px-4 py-2 text-xs font-bold text-white hover:bg-[#08472D]"
            >
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="mt-4 text-xs text-[#4A5D54]">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-[#DCE5DF] bg-[#F8FAF9] p-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B2219]">
                      {r.userName || "Customer"}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-bold text-[#0B5D3B]">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {r.rating}/5
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1.5 leading-relaxed text-[#4A5D54]">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showReviewsModal && (
        <ProductReviewsModal
          productId={product.id}
          productName={product.name}
          onClose={() => {
            setShowReviewsModal(false);
            loadReviews(product.id);
          }}
        />
      )}
    </main>
  );
}
