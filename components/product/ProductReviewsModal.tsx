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
} from "firebase/firestore";
import { Star, Trash2, Upload, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export interface ProductReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photos?: string[];
  videoUrl?: string | null;
}

interface ProductReviewsModalProps {
  productId: string;
  productName: string;
  isAdmin?: boolean;
  onClose: () => void;
}

function compressReviewPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 540;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ProductReviewsModal = ({
  productId,
  productName,
  isAdmin = false,
  onClose,
}: ProductReviewsModalProps) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "products", productId, "reviews"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setReviews(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProductReview, "id">),
        }))
      );
    });
    return () => unsub();
  }, [productId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const compressed = await Promise.all(files.map(compressReviewPhoto));
    setPhotos((prev) => [...prev, ...compressed]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "products", productId, "reviews"), {
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
        photos,
        videoUrl: videoUrl.trim() || null,
        createdAt: serverTimestamp(),
      });
      setAuthorName("");
      setRating(5);
      setComment("");
      setPhotos([]);
      setVideoUrl("");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    await deleteDoc(doc(db, "products", productId, "reviews", reviewId));
  };

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#C9A45C]/40 bg-[#FAF8F3] p-6 text-[#071410] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#0D211B]/10 pb-4">
          <div>
            <h2 className="text-xl font-bold">{productName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#0D211B]/75">
              <Star className="h-4 w-4 fill-[#C9A45C] text-[#C9A45C]" />
              {avg ? `${avg} / 5 (${reviews.length} reviews)` : "No reviews yet — be the first!"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#0D211B]/10 p-1.5 hover:bg-red-100 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-3 rounded-2xl border border-[#0D211B]/10 bg-white p-4"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[#0D211B]/70">
            Write a Review
          </p>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="cursor-pointer p-0.5"
              >
                <Star
                  className={`h-6 w-6 transition ${
                    star <= rating
                      ? "fill-[#C9A45C] text-[#C9A45C]"
                      : "text-[#0D211B]/20"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-[#071410]">{rating} / 5</span>
          </div>

          <input
            type="text"
            placeholder="Your Name *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
          />

          <textarea
            rows={2}
            placeholder="Share your experience with this product... *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm outline-none focus:border-[#C9A45C]"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0D211B]/25 bg-[#FAF8F3] px-3 py-2 text-xs font-medium hover:border-[#C9A45C]">
              <Upload className="h-3.5 w-3.5 text-[#C9A45C]" />
              <span>Add Photos ({photos.length})</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            <div className="relative">
              <Video className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C9A45C]" />
              <input
                type="text"
                placeholder="Video Link (Optional)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-xl border border-[#0D211B]/20 bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Review upload"
                  className="h-12 w-12 rounded-lg border border-[#0D211B]/15 object-cover"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full cursor-pointer rounded-full bg-[#C9A45C] py-2.5 text-xs font-bold text-[#071410] hover:bg-[#d8b673] disabled:opacity-50"
          >
            {saving ? "Posting Review..." : "Post Review"}
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[#0D211B]/10 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{r.authorName}</p>
                  <div className="mt-0.5 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star
                        key={st}
                        className={`h-3.5 w-3.5 ${
                          st <= r.rating
                            ? "fill-[#C9A45C] text-[#C9A45C]"
                            : "text-[#0D211B]/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#0D211B]/80">
                {r.comment}
              </p>

              {Array.isArray(r.photos) && r.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.photos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Customer photo"
                      className="h-16 w-16 rounded-xl border border-[#0D211B]/10 object-cover"
                    />
                  ))}
                </div>
              )}

              {r.videoUrl && (
                <a
                  href={r.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#071410] underline"
                >
                  <Video className="h-3.5 w-3.5 text-[#C9A45C]" /> Watch Customer Video
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsModal;
