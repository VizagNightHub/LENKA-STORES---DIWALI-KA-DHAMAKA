"use client";

import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { Ban, CheckCircle2, FileDown, Search, User as UserIcon } from "lucide-react";
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
  blocked?: boolean;
}

export const CustomersManager = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

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

  const toggleBlock = async (c: CustomerRow) => {
    await updateDoc(doc(db, "customers", c.id), { blocked: !c.blocked });
  };

  const filtered = customers.filter((c) => {
    if (filter === "ACTIVE" && c.blocked) return false;
    if (filter === "BLOCKED" && !c.blocked) return false;
    return `${c.name || ""} ${c.phone || ""} ${c.city || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  });

  const handleExportPdf = () => {
    const rows = filtered
      .map(
        (c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c.name || "-"}</td>
          <td>+91 ${c.phone || "-"}</td>
          <td>${c.email || "-"}</td>
          <td>${c.dob || "-"}</td>
          <td>${[c.address, c.streetRoad, c.city, c.district, c.state, c.pincode]
            .filter(Boolean)
            .join(", ") || "-"}</td>
          <td>${c.blocked ? "BLOCKED" : "Active"}</td>
        </tr>`
      )
      .join("");

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>LENKA STORE - Customers</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 18px; color: #111; font-size: 11px; }
            h2 { margin: 0 0 8px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>LENKA STORE — Registered Customers (${filtered.length})</h2>
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Mobile</th><th>Email</th><th>DOB</th><th>Address</th><th>Status</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const blockedCount = customers.filter((c) => c.blocked).length;

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-semibold text-white">
            Customers ({customers.length})
          </h2>
          {[
            { id: "ALL", label: `All (${customers.length})` },
            { id: "ACTIVE", label: `Active (${customers.length - blockedCount})` },
            { id: "BLOCKED", label: `Blocked (${blockedCount})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id as "ALL" | "ACTIVE" | "BLOCKED")}
              className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.id
                  ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#FFD54A]"
                  : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search name, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/15 bg-zinc-900 py-1.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#FFD54A]"
            />
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#FFD54A] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#ffdf70]"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          No customers in this view.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
                c.blocked
                  ? "border-red-500/35 bg-red-950/15"
                  : "border-white/10 bg-zinc-900/70"
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name || "User"}
                    className="h-11 w-11 shrink-0 rounded-full border border-[#FFD54A]/40 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#FFD54A]">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">{c.name}</p>
                    {c.blocked && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[#FFD54A]">+91 {c.phone}</p>
                  <p className="text-zinc-400">
                    {c.email || "No email"} {c.dob ? `• DOB: ${c.dob}` : ""}
                  </p>
                  <p className="text-zinc-400">
                    {[c.address, c.streetRoad, c.city, c.district, c.state, c.pincode]
                      .filter(Boolean)
                      .join(", ") || "Address not saved yet"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleBlock(c)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  c.blocked
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                }`}
              >
                {c.blocked ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Unblock
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" /> Block
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersManager;
