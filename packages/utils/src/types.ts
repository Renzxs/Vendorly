export type LayoutType = "grid" | "list";
export type ProductReaction = "love" | "fire" | "wow";
export type ChatSender = "buyer" | "seller";
export type NotificationKind =
  | "chat_message"
  | "order_created"
  | "order_updated";
export type NotificationRecipientRole = "buyer" | "seller";
export type OrderPaymentMethod = "card" | "cod" | "online";
export type OrderPaymentStatus = "cod_due" | "paid" | "pending";
export type OrderStatus =
  | "cancelled"
  | "confirmed"
  | "delivered"
  | "pending"
  | "preparing"
  | "shipped";

export interface VendorlyUser {
  _id: string;
  _creationTime?: number;
  authUserId: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Store {
  _id: string;
  _creationTime?: number;
  name: string;
  slug: string;
  description: string;
  bio?: string;
  bannerImage?: string;
  logoImage?: string;
  themeColor: string;
  layoutType: LayoutType;
  ownerId: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  followerCount?: number;
  isFollowed?: boolean;
}

export interface Product {
  _id: string;
  _creationTime?: number;
  title: string;
  description: string;
  price: number;
  isSoldOut?: boolean;
  image?: string;
  images?: string[];
  imageStorageIds?: string[];
  resolvedImages?: string[];
  storeId: string;
  reactionCounts?: Record<ProductReaction, number>;
  reactionCount?: number;
  viewerReaction?: ProductReaction;
  fromFollowedStore?: boolean;
}

export interface MarketplaceProduct extends Product {
  store?: Pick<Store, "_id" | "name" | "slug" | "themeColor">;
}

export interface CartItem {
  image?: string;
  price: number;
  productId: string;
  quantity: number;
  storeId: string;
  storeName?: string;
  title: string;
}

export interface CheckoutFormValues {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  email: string;
  fullName: string;
  notes: string;
  paymentMethod: OrderPaymentMethod;
  phone: string;
  postalCode: string;
  stateProvince: string;
}

export interface ChatMessage {
  _id: string;
  _creationTime?: number;
  body: string;
  productId?: string;
  productTitle?: string;
  senderType: ChatSender;
  storeId: string;
  viewerId: string;
  viewerName?: string;
}

export interface ChatThread {
  lastMessageAt?: number;
  lastMessageBody?: string;
  lastProductTitle?: string;
  lastSenderType: ChatSender;
  messageCount: number;
  storeId: string;
  viewerId: string;
  viewerName?: string;
}

export interface NotificationItem {
  _id: string;
  _creationTime?: number;
  body: string;
  href: string;
  isUnread: boolean;
  kind: NotificationKind;
  recipientRole: NotificationRecipientRole;
  title: string;
  userId: string;
}

export interface NotificationInbox {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface OrderLineItem {
  productId: string;
  productImage?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimelineEvent {
  at: number;
  label: string;
  orderStatus?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  email: string;
  fullName: string;
  notes?: string;
  phone: string;
  postalCode: string;
  stateProvince: string;
}

export interface Order {
  _id: string;
  _creationTime?: number;
  buyerEmail: string;
  buyerId: string;
  buyerName?: string;
  itemCount: number;
  items: OrderLineItem[];
  orderCode: string;
  orderStatus: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  shippingAddress: ShippingAddress;
  shippingFee: number;
  statusHistory: OrderTimelineEvent[];
  statusUpdatedAt: number;
  store?: Pick<Store, "_id" | "name" | "slug" | "themeColor">;
  storeId: string;
  storeName: string;
  subtotal: number;
  total: number;
}

export interface StoreFormValues {
  name: string;
  slug: string;
  description: string;
  bio: string;
  bannerImage: string;
  logoImage: string;
  themeColor: string;
  layoutType: LayoutType;
  websiteUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
}

export interface ProductFormValues {
  title: string;
  description: string;
  price: string;
  imagesText: string;
  isSoldOut: boolean;
}
