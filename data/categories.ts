export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  accent: string;
  glow: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: "diwali",
    title: "Diwali Ka Dhamaka",
    subtitle: "Sivakasi Direct Firecracker Combos & Gift Boxes",
    tag: "FESTIVAL SPECIAL",
    href: "/diwali-ka-dhamaka",
    accent: "#FFD54A",
    glow: "rgba(255, 180, 40, 0.28)",
  },
  {
    id: "fashion",
    title: "Fashion Wear",
    subtitle: "Festive Streetwear, Ethnic & Stylish Drops",
    tag: "TRENDING STYLE",
    href: "/fashion-wear",
    accent: "#FF5D8F",
    glow: "rgba(255, 93, 143, 0.25)",
  },
  {
    id: "electronics",
    title: "Electronics",
    subtitle: "ANC Earbuds, Headphones & Smart Audio Gear",
    tag: "TECH ESSENTIALS",
    href: "/electronics",
    accent: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.25)",
  },
  {
    id: "new-launch",
    title: "New Launch",
    subtitle: "Limited Edition Releases & Exclusive Bundles",
    tag: "JUST DROPPED",
    href: "/new-launch",
    accent: "#A78BFA",
    glow: "rgba(167, 139, 250, 0.28)",
  },
];
