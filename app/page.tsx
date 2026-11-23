import { PromoBanner } from "@/components/ads/PromoBanner";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { PrismaHero } from "@/components/hero/PrismaHero";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#071410]">
      <PrismaHero />
      <GlobalSearchBar />
      <PromoBanner />
      <CategoryGrid />
    </main>
  );
}
