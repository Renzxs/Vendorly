import { DEFAULT_THEME_COLOR, PRODUCT_REACTION_OPTIONS } from "./constants";
import type { ProductReaction } from "./types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeThemeColor(value?: string) {
  if (!value) {
    return DEFAULT_THEME_COLOR;
  }

  const normalized = value.startsWith("#") ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(normalized)
    ? normalized
    : DEFAULT_THEME_COLOR;
}

export function normalizeUrlInput(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseImageUrls(input: string) {
  return Array.from(
    new Set(
      input
        .split(/\r?\n|,/)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function getProductImages(product: {
  image?: string;
  images?: string[];
  resolvedImages?: string[];
}) {
  const resolvedImages = (product.resolvedImages ?? []).filter(Boolean);

  if (resolvedImages.length > 0) {
    return resolvedImages;
  }

  const images = (product.images ?? []).filter(Boolean);

  if (images.length > 0) {
    return images;
  }

  return product.image ? [product.image] : [];
}

export function getStoreSocialLinks(store: {
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  xUrl?: string;
}) {
  return [
    {
      label: "Website",
      url: store.websiteUrl,
    },
    {
      label: "Instagram",
      url: store.instagramUrl,
    },
    {
      label: "TikTok",
      url: store.tiktokUrl,
    },
    {
      label: "X",
      url: store.xUrl,
    },
  ].filter((entry) => Boolean(entry.url));
}

export function createReactionCounts() {
  return Object.fromEntries(
    PRODUCT_REACTION_OPTIONS.map((option) => [option.value, 0]),
  ) as Record<ProductReaction, number>;
}

export function getTotalReactionCount(
  reactionCounts?: Partial<Record<ProductReaction, number>>,
) {
  return PRODUCT_REACTION_OPTIONS.reduce(
    (total, option) => total + (reactionCounts?.[option.value] ?? 0),
    0,
  );
}
