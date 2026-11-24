"use client";

import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { db } from "@/lib/firebase";

const CANCEL_REASONS = [
  "Ordered by mistake / Wrong item selected",
  "Want to change size, colour, or quantity",
  "Need to update delivery address or phone number",
  "Delivery time is taking too long",
  "Found a better price or offer elsewhere",
  "Changed my mind / No longer needed",
  "Payment / UPI UTR verification issue",
  "Other reason (Write your own below)",
];

export interface CancellableOrder {
  id: string;
  orderId?: string;
  totalAmount?: number;
  items?: {
    id?: string;
    name: string;
    variant?: string;
    qty?: number;
    quantity?: number;
  }[];
}

interface CancelOrderModalProps {
  order: CancellableOrder;
  onClose: () => void;
  onCancelled: (docId: string, reason: string, comment: string) => void;
}

export const CancelOrderModal = ({
  order,
  onClose,
  onCancelled,
}: CancelOrderModalProps) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOther = selectedReason === CANCEL_REASONS[CANCEL_REASONS.length - 1];

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOther && !comment.trim()) {
      setError("Please write your reason in the comment box below.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "CANCELLED",
        cancelReason: selectedReason,
        cancelComment: comment.trim(),
        cancelledBy: "CUSTOMER",
        cancelledAt: serverTimestamp(),
      });

      // Restore variant stock in warehouse if item IDs are present
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!item.id || !item.variant) continue;
          const qtyToRestore = Number(item.qty || item.quantity || 1);
          try {
            const pRef = doc(db, "products", item.id);
            const pSnap = await getDoc(pRef);
            if (pSnap.exists()) {
              const variants = pSnap.data().variants;
              if (Array.isArray(variants)) {
                const updated = variants.map((v: { label: string; stock: number }) =>
                  v.label === item.variant
                    ? { ...v, stock: Number(v.stock || 0) + qtyToRestore }
                    : v
                );
                await updateDoc(pRef, { variants: updated });
              }
            }
          } catch {
            // Non-blocking stock restore fallback
          }
        }
      }

      onCancelled(order.id, selectedReason, comment.trim());
    } catch {
      setError(
        "Could not cancel order right now. Please make sure you are logged in and try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2219]/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#DCE5DF] bg-white p-5 text-[#0B2219] shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E6ECE8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0B2219] sm:text-lg">
              Cancel Order {order.orderId || ""}
            </h3>
            <p className="mt-0.5 text-xs text-[#4A5D54]">
              Tell us why you&apos;re cancelling so we can process your prepaid UPI
              refund faster.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#EDF5F0] p-1.5 text-[#0B5D3B] hover:bg-[#0B5D3B] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmCancel} className="mt-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B5D3B]">
              Select a Reason
            </p>
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium transition ${
                  selectedReason === reason
                    ? "border-[#0B5D3B] bg-[#EDF5F0] text-[#0B2219]"
                    : "border-[#DCE5DF] bg-[#F8FAF9] text-[#4A5D54] hover:border-[#0B5D3B]/40"
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-[#0B5D3B]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#0B2219]">
              Additional Comment / Refund Note {isOther ? "(Required)" : "(Optional)"}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write any extra details or your preferred UPI ID for refund..."
              className="w-full rounded-xl border border-[#DCE5DF] bg-[#F8FAF9] p-3 text-xs text-[#0B2219] placeholder:text-[#4A5D54]/60 outline-none focus:border-[#0B5D3B] focus:bg-white"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-full border border-[#DCE5DF] bg-white py-2.5 text-xs font-bold text-[#4A5D54] hover:bg-[#F8FAF9]"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 cursor-pointer rounded-full bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
