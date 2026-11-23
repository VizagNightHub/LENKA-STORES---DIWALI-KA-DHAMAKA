"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { Eye, ShoppingBag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface ActiveSession {
  id: string;
  page?: string;
  device?: string;
  lastSeenMs?: number;
}

interface AdminStatsProps {
  showOrderStats: boolean;
  totalOrders: number;
  paidCount: number;
  completedCount: number;
  collectedCash: number;
  pendingCash: number;
}

export const AdminStats = ({
  showOrderStats,
  totalOrders,
  paidCount,
  completedCount,
  collectedCash,
  pendingCash,
}: AdminStatsProps) => {
  const [visitors, setVisitors] = useState(0);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showLiveList, setShowLiveList] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubStats = onSnapshot(collection(db, "stats"), (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        if (d.id === "visitors" || d.id.startsWith("visitors_shard_")) {
          const data = d.data();
          if (typeof data.count === "number") total += data.count;
        }
      });
      setVisitors(total);
    });

    const unsubSessions = onSnapshot(collection(db, "active_sessions"), (snap) => {
      setActiveSessions(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ActiveSession, "id">),
        }))
      );
    });

    return () => {
      unsubStats();
      unsubSessions();
    };
  }, []);

  const liveNow = activeSessions
    .filter((s) => s.lastSeenMs && nowMs - s.lastSeenMs <= 120_000)
    .sort((a, b) => (b.lastSeenMs || 0) - (a.lastSeenMs || 0));

  const paddedLive = String(liveNow.length).padStart(3, "0").split("");

  return (
    <>
      <div
        className={`mt-6 grid gap-4 ${
          showOrderStats ? "sm:grid-cols-2 lg:grid-cols-4" : "max-w-sm"
        }`}
      >
        {/* Always Top-Left: Analog/Digital Live Users Counter */}
        <button
          type="button"
          onClick={() => setShowLiveList((v) => !v)}
          className="cursor-pointer rounded-2xl border border-emerald-500/35 bg-zinc-900/80 p-5 text-left transition hover:border-emerald-400"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
              Live Users Now
            </span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>

          {/* Analog Flip-Style Digit Display */}
          <div className="mt-3 flex items-center gap-1.5">
            {paddedLive.map((digit, i) => (
              <span
                key={i}
                className="flex h-10 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-black font-mono text-2xl font-bold text-emerald-400 shadow-inner"
              >
                {digit}
              </span>
            ))}
            <span className="ml-2 text-[11px] font-medium text-zinc-400">
              online
            </span>
          </div>

          <p className="mt-2 text-[11px] text-zinc-400">
            {showLiveList ? "Click to hide live list" : "Click to view active users"}
          </p>
        </button>

        {/* Shown ONLY on Orders Tab */}
        {showOrderStats && (
          <>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Website Visitors</span>
                <Eye className="h-4 w-4 text-sky-400" />
              </div>
              <p className="mt-3 font-mono text-3xl font-bold">
                {visitors.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Ordered Members</span>
                <ShoppingBag className="h-4 w-4 text-[#FFD54A]" />
              </div>
              <p className="mt-3 font-mono text-3xl font-bold">{totalOrders}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {paidCount} Confirmed • {completedCount} Completed
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Collected Cash</span>
                <span className="font-bold text-emerald-400">₹</span>
              </div>
              <p className="mt-3 font-mono text-3xl font-bold text-emerald-400">
                ₹{collectedCash.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Pending Verification: ₹{pendingCash.toLocaleString("en-IN")}
              </p>
            </div>
          </>
        )}
      </div>

      {showLiveList && (
        <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-zinc-900/80 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Active Live Users ({liveNow.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowLiveList(false)}
              className="cursor-pointer text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>
          {liveNow.length === 0 ? (
            <p className="mt-3 text-xs text-zinc-400">
              No customers currently browsing right this second.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {liveNow.map((s, idx) => {
                const secAgo = Math.max(
                  0,
                  Math.round((nowMs - (s.lastSeenMs || nowMs)) / 1000)
                );
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        Client #{idx + 1} • {s.device || "Web"}
                      </p>
                      <p className="font-mono text-[11px] text-[#FFD54A]">
                        {s.page || "/"}
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-400">
                      {secAgo < 10 ? "Active now" : `${secAgo}s ago`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminStats;
