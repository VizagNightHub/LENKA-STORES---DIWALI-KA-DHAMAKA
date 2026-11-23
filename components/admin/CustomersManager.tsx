"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Search, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface CustomerRow {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  dob?: string;
  photo?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  address?: string;
  streetRoad?: string;
}

export const CustomersManager = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CustomerRow, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  const filtered = customers.filter((c) =>
    `${c.name || ""} ${c.phone || ""} ${c.city || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">
          Registered Customers ({customers.length})
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/15 bg-zinc-900 py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#FFD54A]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          No registered customer accounts yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              {c.photo ? (
                <img
                  src={c.photo}
                  alt={c.name || "User"}
                  className="h-12 w-12 shrink-0 rounded-full border border-[#FFD54A]/40 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#FFD54A]">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1 text-xs">
                <p className="truncate text-sm font-bold text-white">{c.name}</p>
                <p className="font-mono text-[#FFD54A]">+91 {c.phone}</p>
                {(c.email || c.dob) && (
                  <p className="text-zinc-400">
                    {c.email || "No email"} {c.dob ? `• DOB: ${c.dob}` : ""}
                  </p>
                )}
                <p className="text-zinc-400">
                  {[c.address, c.streetRoad, c.city, c.district, c.state, c.pincode]
                    .filter(Boolean)
                    .join(", ") || "Address not saved yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersManager;
