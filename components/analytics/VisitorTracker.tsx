"use client";

import { doc, increment, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/lib/firebase";

export const VisitorTracker = () => {
  useEffect(() => {
    if (sessionStorage.getItem("lenka_visited")) return;
    sessionStorage.setItem("lenka_visited", "1");
    setDoc(
      doc(db, "stats", "visitors"),
      { count: increment(1) },
      { merge: true }
    ).catch(() => {});
  }, []);

  return null;
};
