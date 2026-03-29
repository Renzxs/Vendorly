export type LayoutType = "grid" | "list";
export type ProductReaction = "love" | "fire" | "wow";

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
