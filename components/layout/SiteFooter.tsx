import Link from "next/link";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#09090b] px-4 py-12 text-[#E1E0CC]/75 sm:px-8 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-base font-semibold tracking-tight text-white">
            LENKA STORE — Diwali Ka Dhamaka
          </p>
          <p className="mt-1 text-xs text-[#E1E0CC]/55">
            A Lenka Ventures initiative • Hyderabad & Visakhapatnam
          </p>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs font-medium">
          <Link href="/diwali-ka-dhamaka" className="hover:text-[#FFD54A]">
            Diwali Dhamaka
          </Link>
          <Link href="/fashion-wear" className="hover:text-[#FFD54A]">
            Fashion Wear
          </Link>
          <Link href="/electronics" className="hover:text-[#FFD54A]">
            Electronics
          </Link>
          <Link href="/new-launch" className="hover:text-[#FFD54A]">
            New Launch
          </Link>
          <Link href="/about" className="hover:text-[#FFD54A]">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#FFD54A]">
            Contact
          </Link>
          <a
            href="https://github.com/VizagNightHub/LENKA-STORES----DIWALI-KA-DHAMAKA"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#FFD54A]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
};
