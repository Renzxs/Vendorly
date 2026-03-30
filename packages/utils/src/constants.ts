import type {
  CheckoutFormValues,
  LayoutType,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from "./types";

export const DEFAULT_THEME_COLOR = "#0f766e";
export const ORDER_STANDARD_SHIPPING_FEE = 8;
export const ORDER_FREE_SHIPPING_THRESHOLD = 100;

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

export const ORDER_PAYMENT_METHOD_OPTIONS: Array<{
  description: string;
  label: string;
  value: OrderPaymentMethod;
}> = [
  {
    label: "Card payment",
    value: "card",
    description: "Demo instant approval for card checkout.",
  },
  {
    label: "Online transfer",
    value: "online",
    description: "Place the order first, then confirm payment manually.",
  },
  {
    label: "Cash on delivery",
    value: "cod",
    description: "Collect payment when the order reaches the buyer.",
  },
];

export const ORDER_STATUS_OPTIONS: Array<{
  label: string;
  value: OrderStatus;
}> = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Preparing", value: "preparing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  cod_due: "Due on delivery",
  paid: "Paid",
  pending: "Pending payment",
};

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
  isSoldOut: false,
};

export const DEFAULT_CHECKOUT_FORM: CheckoutFormValues = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "Philippines",
  email: "",
  fullName: "",
  notes: "",
  paymentMethod: "card",
  phone: "",
  postalCode: "",
  stateProvince: "",
};
