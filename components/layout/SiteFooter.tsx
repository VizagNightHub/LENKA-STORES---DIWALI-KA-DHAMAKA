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
            A Lenka Ventures initiative • Hyderabad &amp; Visakhapatnam
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-xs font-medium">
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

          <div className="flex items-center gap-2.5 pl-1">
            <a
              href="https://www.instagram.com/the_lenka_8116?bqrl=MWZoNGtpZHMyM2dscA=="
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#111114] px-3 py-1.5 text-[#E1E0CC] transition-colors hover:border-[#FFD54A] hover:text-[#FFD54A]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/channel/UC0sC5Fil2UV9W24JKoafzpg"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#111114] px-3 py-1.5 text-[#E1E0CC] transition-colors hover:border-[#FFD54A] hover:text-[#FFD54A]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="2.5" y="5" width="19" height="14" rx="4" stroke="currentColor" strokeWidth="1.75" />
                <path d="M10 9.2 15.5 12 10 14.8V9.2Z" fill="currentColor" />
              </svg>
              <span>YouTube</span>
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
};
