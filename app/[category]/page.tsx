import { CategoryStorefront } from "@/components/product/CategoryStorefront";

interface CustomCategoryPageProps {
  params: { category: string };
}

export default function CustomCategoryPage({ params }: CustomCategoryPageProps) {
  const slug = decodeURIComponent(params.category || "");
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <CategoryStorefront
      category={slug}
      title={title}
      subtitle="Curated collection from LENKA STORE."
    />
  );
}
