"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Mail, MessageSquareText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface FeedbackRow {
  id: string;
  email?: string;
  feedback?: string | null;
}

export const FeedbackManager = () => {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [filter, setFilter] = useState<"ALL" | "FEEDBACK">("ALL");

  useEffect(() => {
    const q = query(collection(db, "subscribers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeedbackRow, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "subscribers", id));
  };

  const withFeedback = rows.filter((r) => Boolean(r.feedback));
  const visible = filter === "FEEDBACK" ? withFeedback : rows;

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          Customer Feedback &amp; Emails ({rows.length})
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              filter === "ALL"
                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#FFD54A]"
                : "border-white/10 bg-zinc-900 text-zinc-400"
            }`}
          >
            All ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("FEEDBACK")}
            className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              filter === "FEEDBACK"
                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#FFD54A]"
                : "border-white/10 bg-zinc-900 text-zinc-400"
            }`}
          >
            With Feedback ({withFeedback.length})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          No customer emails or feedback yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <div className="min-w-0 space-y-1.5">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold text-[#FFD54A]">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {r.email}
                </p>
                {r.feedback ? (
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-zinc-200">
                    <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{r.feedback}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500">Subscribed for offers</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="shrink-0 cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
