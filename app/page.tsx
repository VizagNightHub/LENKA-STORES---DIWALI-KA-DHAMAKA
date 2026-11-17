import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { PrismaHero } from "@/components/hero/PrismaHero";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <PrismaHero />
      <CategoryGrid />
    </main>
  );
}
