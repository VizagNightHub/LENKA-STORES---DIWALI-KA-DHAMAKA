"use client";

import { doc, increment, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/lib/firebase";

const SHARD_COUNT = 20;
const SESSION_KEY = "lenka_d27_visited";

export function VisitorTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        if (typeof window === "undefined") return;
        if (sessionStorage.getItem(SESSION_KEY)) return;

        sessionStorage.setItem(SESSION_KEY, "1");

        const shardId = Math.floor(Math.random() * SHARD_COUNT);
        await setDoc(
          doc(db, "stats", `visitors_shard_${shardId}`),
          { count: increment(1) },
          { merge: true }
        );
      } catch {
        // Silently ignore tracking errors so the storefront never glitches
      }
    };

    trackVisit();
  }, []);

  return null;
}

export default VisitorTracker;
