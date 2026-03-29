import type { LayoutType } from "./types";

export const DEFAULT_THEME_COLOR = "#0f766e";

export const PRODUCT_REACTION_OPTIONS = [
  {
    emoji: "❤️",
    label: "Love",
    value: "love",
  },
  {
    emoji: "🔥",
    label: "Fire",
    value: "fire",
  },
  {
    emoji: "😮",
    label: "Wow",
    value: "wow",
  },
] as const;

export const MARKETPLACE_URL =
  process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "http://localhost:3000";

export const LAYOUT_OPTIONS: Array<{
  description: string;
  label: string;
  value: LayoutType;
}> = [
  {
    label: "Grid",
    value: "grid",
    description: "Show products as cards in a responsive storefront grid.",
  },
  {
    label: "List",
    value: "list",
    description: "Show products in a detailed vertical catalog layout.",
  },
];

export const DEFAULT_STORE_FORM = {
  name: "",
  slug: "",
  description: "",
  bio: "",
  bannerImage: "",
  logoImage: "",
  themeColor: DEFAULT_THEME_COLOR,
  layoutType: "grid" as LayoutType,
  websiteUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  xUrl: "",
};

export const DEFAULT_PRODUCT_FORM = {
  title: "",
  description: "",
  price: "49",
  imagesText: "",
};
