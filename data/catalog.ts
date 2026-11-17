export interface StoreProduct {
  id: string;
  category: "fashion-wear" | "electronics" | "new-launch";
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  images: string[];
  accent: string;
}

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "fw-1",
    category: "fashion-wear",
    name: "Lenka Street Heavyweight Jacket",
    tagline: "Matte black & cream paneled festive streetwear",
    price: 1899,
    mrp: 3299,
    badge: "TRENDING",
    images: ["/images/fashion.png"],
    accent: "#FF5D8F",
  },
  {
    id: "fw-2",
    category: "fashion-wear",
    name: "Diwali Gold-Thread Kurta Set",
    tagline: "Tailored festive ethnic wear with gold embroidery",
    price: 1499,
    mrp: 2499,
    images: ["/images/fashion.png"],
    accent: "#FF5D8F",
  },
  {
    id: "el-1",
    category: "electronics",
    name: "Lenka Pods Pro ANC",
    tagline: "Active Noise Cancellation • Anodized charging case",
    price: 1999,
    mrp: 3999,
    badge: "BEST SELLER",
    images: ["/images/electronics.png"],
    accent: "#38BDF8",
  },
  {
    id: "el-2",
    category: "electronics",
    name: "Studio Wireless Over-Ear ANC",
    tagline: "40hr battery • Deep bass • Matte obsidian finish",
    price: 2999,
    mrp: 5499,
    images: ["/images/electronics.png"],
    accent: "#38BDF8",
  },
  {
    id: "nl-1",
    category: "new-launch",
    name: "D-27 Collector's Mystery Box",
    tagline: "Limited Diwali drop — curated tech + festive essentials",
    price: 2499,
    mrp: 4999,
    badge: "LIMITED DROP",
    images: ["/images/new-launch.png"],
    accent: "#A78BFA",
  },
];
