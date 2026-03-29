export type LayoutType = "grid" | "list";
export type ProductReaction = "love" | "fire" | "wow";
export type ChatSender = "buyer" | "seller";

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
}
