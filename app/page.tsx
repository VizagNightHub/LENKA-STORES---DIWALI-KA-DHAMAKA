import { PromoBanner } from "@/components/ads/PromoBanner";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { PrismaHero } from "@/components/hero/PrismaHero";
import { RecentlyViewedStrip } from "@/components/product/RecentlyViewedStrip";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAF9] text-[#0B2219]">
      <PrismaHero />
      <PromoBanner />
      <CategoryGrid />
      <RecentlyViewedStrip />
    </main>
  );
}
