"use client";

import { motion } from "framer-motion";
import { GripHorizontal, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
  const [pillDismissed, setPillDismissed] = useState(false);
  const draggedRef = useRef(false);

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
    setPillDismissed(false);
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

      {/* Draggable & Dismissible Floating Cart Pill */}
      {totalCount > 0 && !hideFloatingBar && !pillDismissed && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={() => {
            draggedRef.current = true;
          }}
          onDragEnd={() => {
            setTimeout(() => {
              draggedRef.current = false;
            }, 80);
          }}
          className="fixed bottom-20 right-4 z-40 flex touch-none items-center gap-1.5 rounded-full border border-[#0B5D3B]/30 bg-white/95 p-1.5 pl-3 text-xs font-bold text-[#0B2219] shadow-[0_10px_30px_rgba(11,59,43,0.18)] backdrop-blur-md md:bottom-6 md:right-6"
        >
          <GripHorizontal className="h-3.5 w-3.5 shrink-0 cursor-grab text-[#0B5D3B]/60" />

          <button
            type="button"
            onClick={() => {
              if (!draggedRef.current) setOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2 pr-1"
          >
            <ShoppingBag className="h-4 w-4 text-[#0B5D3B]" />
            <span>
              {totalCount} Item{totalCount > 1 ? "s" : ""} • ₹
              {totalAmount.toLocaleString("en-IN")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPillDismissed(true)}
            title="Hide Cart Box"
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B] transition hover:bg-red-600 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}

      {/* Slide-Over Cart Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0B2219]/50 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-[#DCE5DF] bg-[#F8FAF9] p-6 text-[#0B2219]">
            <div className="flex items-center justify-between border-b border-[#DCE5DF] pb-4">
              <h2 className="text-lg font-bold text-[#0B2219]">Your Cart ({totalCount})</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full p-1.5 text-[#4A5D54] hover:bg-[#EDF5F0] hover:text-[#0B5D3B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex-1 space-y-3 overflow-y-auto">
              {items.length === 0 ? (
                <p className="pt-10 text-center text-sm text-[#4A5D54]">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.variant || "std"}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0B2219]">{item.name}</p>
                      {item.variant && (
                        <p className="text-[11px] font-medium text-[#0B5D3B]">{item.variant}</p>
                      )}
                      <p className="mt-1 text-xs text-[#4A5D54]">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.variant, -1)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#EDF5F0] text-[#0B5D3B] hover:bg-[#DCECE3]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#0B2219]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.variant, 1)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#0B5D3B] text-white hover:bg-[#08472D]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-[#DCE5DF] pt-4">
                <div className="flex items-center justify-between text-base font-bold text-[#0B2219]">
                  <span>Subtotal</span>
                  <span className="text-[#0B5D3B]">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="flex cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white"
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
                    className="flex-1 cursor-pointer rounded-full bg-[#0B5D3B] py-3 text-sm font-bold text-white transition hover:bg-[#08472D]"
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
