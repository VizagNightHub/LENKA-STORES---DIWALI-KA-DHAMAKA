export interface DiwaliCombo {
  id: "small" | "medium" | "large";
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  badge?: string;
  itemCount: string;
  items: string[];
  accent: string;
}

export const DIWALI_COMBOS: DiwaliCombo[] = [
  {
    id: "small",
    name: "Small Dhamaka Pack",
    tagline: "Perfect family starter kit from Sivakasi",
    price: 2500,
    mrp: 4500,
    itemCount: "22 Items",
    accent: "#38BDF8",
    items: [
      "Electric Sparklers (10cm & 15cm) — 4 Boxes",
      "Color Flower Pots (Big) — 2 Boxes",
      "Ground Chakkar Deluxe — 2 Boxes",
      "Twinkling Stars — 2 Boxes",
      "Baby Rockets — 2 Boxes",
      "Lakshmi & Bijili Crackers — 6 Packs",
      "7-Shot Aerial Burst — 2 Pcs",
      "Kids Pop-Pop & Snake Tablets — 2 Packs",
    ],
  },
  {
    id: "medium",
    name: "Medium Dhamaka Pack",
    tagline: "Best-seller balanced mix of ground & sky shots",
    price: 4000,
    mrp: 7500,
    badge: "MOST POPULAR",
    itemCount: "36 Items",
    accent: "#FFD54A",
    items: [
      "Assorted Gold & Red Sparklers — 6 Boxes",
      "Special Giant Flower Pots — 4 Boxes",
      "Ground Chakkar Spinner — 4 Boxes",
      "12-Shot Multicolour Sky Aerial — 2 Pcs",
      "Whistling & Lunik Rockets — 3 Boxes",
      "1000-Wala Garland Cracker — 1 Pc",
      "Bullet & Atom Bombs (Green) — 4 Boxes",
      "Lakshmi, Kurvi & Bijili Mix — 8 Packs",
      "Pencil & Fountain Sparklers — 4 Boxes",
    ],
  },
  {
    id: "large",
    name: "Large Mega Dhamaka Pack",
    tagline: "Full celebration box with heavy aerial shows",
    price: 7000,
    mrp: 13500,
    badge: "BEST VALUE",
    itemCount: "55+ Items",
    accent: "#FF5D8F",
    items: [
      "30-Shot & 60-Shot Grand Sky Aerials — 2 Pcs",
      "12-Shot & 25-Shot Multicolour Aerials — 3 Pcs",
      "2000-Wala & 1000-Wala Garland — 2 Pcs",
      "Giant Koti & Special Flower Pots — 6 Boxes",
      "Whistling, Sky & Musical Rockets — 5 Boxes",
      "Chakkar Special & Disco Wheel — 6 Boxes",
      "Long 30cm & 50cm Sparklers — 8 Boxes",
      "Hydro, Classic & Atom Bombs — 6 Boxes",
      "Mega Sound & Bijili Family Bundle — 12 Packs",
      "Kids Safe Fountain & Magic Box — 5 Packs",
    ],
  },
];
