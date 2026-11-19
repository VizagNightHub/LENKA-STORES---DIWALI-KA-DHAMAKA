export interface SubcategoryOption {
  slug: string;
  label: string;
}

export const SUBCATEGORIES: Record<string, SubcategoryOption[]> = {
  "fashion-wear": [
    { slug: "mens-wear", label: "Men's Wear" },
    { slug: "womens-wear", label: "Women's Wear" },
    { slug: "shoes", label: "Shoes & Footwear" },
    { slug: "watches", label: "Watches" },
    { slug: "daily-wear", label: "Daily Wear & Essentials" },
    { slug: "accessories", label: "Fashion Accessories" },
  ],
  electronics: [
    { slug: "earbuds", label: "Earbuds & TWS" },
    { slug: "wireless-earphones", label: "Wireless & Bluetooth Earphones" },
    { slug: "headphones", label: "Headphones" },
    { slug: "smart-watches", label: "Smart Watches" },
    { slug: "power-banks", label: "Power Banks" },
    { slug: "chargers-cables", label: "Chargers & Cables" },
    { slug: "speakers-gadgets", label: "Speakers & Daily Tech" },
  ],
  "new-launch": [
    { slug: "trending", label: "Trending Drops" },
    { slug: "limited-edition", label: "Limited Edition" },
    { slug: "combo-deals", label: "Special Combos" },
  ],
  "diwali-ka-dhamaka": [
    { slug: "family-packs", label: "Family Packs" },
    { slug: "gift-boxes", label: "Gift Boxes" },
    { slug: "single-items", label: "Single Crackers" },
  ],
};
