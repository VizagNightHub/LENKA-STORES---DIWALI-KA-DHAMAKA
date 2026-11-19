"use client";

import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/firebase";

const SHARD_COUNT = 20;
const VISITED_KEY = "lenka_d27_visited";
const SESSION_ID_KEY = "lenka_d27_session_id";

export function VisitorTracker() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/lenka-ops-d27")) return;

    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    const trackTotalVisit = async () => {
      try {
        if (sessionStorage.getItem(VISITED_KEY)) return;
        sessionStorage.setItem(VISITED_KEY, "1");
        const shardId = Math.floor(Math.random() * SHARD_COUNT);
        await setDoc(
          doc(db, "stats", `visitors_shard_${shardId}`),
          { count: increment(1) },
          { merge: true }
        );
      } catch {
        // Ignore tracking errors
      }
    };

    const device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "Mobile"
      : "Desktop";

    const sendHeartbeat = async () => {
      try {
        if (document.visibilityState === "hidden") return;
        await setDoc(
          doc(db, "active_sessions", sessionId!),
          {
            page: pathname,
            device,
            lastSeen: serverTimestamp(),
            lastSeenMs: Date.now(),
          },
          { merge: true }
        );
      } catch {
        // Ignore heartbeat errors
      }
    };

    trackTotalVisit();
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 45_000);

    const handleLeave = () => {
      try {
        deleteDoc(doc(db, "active_sessions", sessionId!)).catch(() => {});
      } catch {
        // Ignore
      }
    };

    window.addEventListener("pagehide", handleLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", handleLeave);
    };
  }, [pathname]);

  return null;
}

export default VisitorTracker;
