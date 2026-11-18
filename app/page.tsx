import { PromoBanner } from "@/components/ads/PromoBanner";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { PrismaHero } from "@/components/hero/PrismaHero";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <PrismaHero />
      <PromoBanner />
      <CategoryGrid />
      <SiteFooter />
    </main>
  );
}
