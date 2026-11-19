"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface GlobalCartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category?: string;
  variant?: string;
}

interface CartContextValue {
  items: GlobalCartItem[];
  addItem: (item: Omit<GlobalCartItem, "qty">) => void;
  updateQty: (id: string, variant: string | undefined, delta: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<GlobalCartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lenka_d27_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  const persist = (next: GlobalCartItem[]) => {
    setItems(next);
    localStorage.setItem("lenka_d27_cart", JSON.stringify(next));
  };

  const addItem = (item: Omit<GlobalCartItem, "qty">) => {
    const idx = items.findIndex(
      (i) => i.id === item.id && (i.variant || "") === (item.variant || "")
    );
    if (idx >= 0) {
      const copy = [...items];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
      persist(copy);
    } else {
      persist([...items, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id: string, variant: string | undefined, delta: number) => {
    const next = items
      .map((i) =>
        i.id === id && (i.variant || "") === (variant || "")
          ? { ...i, qty: i.qty + delta }
          : i
      )
      .filter((i) => i.qty > 0);
    persist(next);
  };

  const clearCart = () => persist([]);

  const totalCount = items.reduce((s, i) => s + i.qty, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hideFloatingBar =
    pathname?.startsWith("/lenka-ops-d27") || pathname?.startsWith("/checkout");

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, clearCart, openDrawer: () => setOpen(true) }}
    >
      {children}

      {/* Floating Cart Button */}
      {totalCount > 0 && !hideFloatingBar && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex cursor-pointer items-center gap-3 rounded-full border border-[#FFD54A]/60 bg-zinc-950/95 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_40px_rgba(0,0,0,0.8)] backdrop-blur-md transition-transform hover:scale-105"
        >
          <ShoppingBag className="h-4 w-4 text-[#FFD54A]" />
          <span>
            {totalCount} Item{totalCount > 1 ? "s" : ""} • ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </button>
      )}

      {/* Slide-Over Cart Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-white/10 bg-[#09090b] p-6 text-[#E1E0CC]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Your Cart ({totalCount})</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full p-1.5 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex-1 space-y-3 overflow-y-auto">
              {items.length === 0 ? (
                <p className="pt-10 text-center text-sm text-[#E1E0CC]/60">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.variant || "std"}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      {item.variant && (
                        <p className="text-[11px] text-[#FFD54A]">{item.variant}</p>
                      )}
                      <p className="mt-1 text-xs text-[#E1E0CC]/70">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.variant, -1)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#FFD54A]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.variant, 1)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#FFD54A] text-black"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-base font-bold text-white">
                  <span>Subtotal</span>
                  <span className="text-[#FFD54A]">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="flex cursor-pointer items-center justify-center rounded-full border border-red-500/35 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white"
                    title="Clear Cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push("/checkout");
                    }}
                    className="flex-1 cursor-pointer rounded-full bg-[#FFD54A] py-3 text-sm font-bold text-black hover:bg-[#ffe27a]"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
