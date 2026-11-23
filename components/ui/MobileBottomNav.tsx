"use client";

import { Home, LayoutGrid, ShoppingBag, Truck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

export const MobileBottomNav = () => {
  const pathname = usePathname() || "/";
  const { openDrawer } = useCart();

  // Hide on Admin pages and Checkout
  if (pathname.startsWith("/lenka-ops-d27") || pathname.startsWith("/checkout")) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C9A45C]/30 bg-[#071410]/95 px-2 py-2 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center text-center">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            isActive("/") ? "text-[#C9A45C]" : "text-[#FFFDF2]/70"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/#categories"
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#FFFDF2]/70 hover:text-[#C9A45C]"
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          onClick={openDrawer}
          className="flex cursor-pointer flex-col items-center gap-0.5 text-[10px] font-bold text-[#C9A45C]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A45C] text-[#071410] shadow-md">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <span>Cart</span>
        </button>

        <Link
          href="/track-order"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            isActive("/track-order") ? "text-[#C9A45C]" : "text-[#FFFDF2]/70"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Track</span>
        </Link>

        <Link
          href="/account"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            isActive("/account") ? "text-[#C9A45C]" : "text-[#FFFDF2]/70"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
