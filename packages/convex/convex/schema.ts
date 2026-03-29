import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  })
    .index("by_auth_user_id", ["authUserId"])
    .index("by_email", ["email"]),
  stores: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    bio: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    logoImage: v.optional(v.string()),
    themeColor: v.string(),
    layoutType: v.union(v.literal("grid"), v.literal("list")),
    ownerId: v.string(),
    websiteUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    xUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),
  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    storeId: v.id("stores"),
  }).index("by_store", ["storeId"]),
  storeFollowers: defineTable({
    storeId: v.id("stores"),
    viewerId: v.string(),
  })
    .index("by_store", ["storeId"])
    .index("by_viewer", ["viewerId"])
    .index("by_store_viewer", ["storeId", "viewerId"]),
  productReactions: defineTable({
    productId: v.id("products"),
    viewerId: v.string(),
    reaction: v.union(v.literal("love"), v.literal("fire"), v.literal("wow")),
  })
    .index("by_product", ["productId"])
    .index("by_viewer", ["viewerId"])
    .index("by_product_viewer", ["productId", "viewerId"]),
  chatMessages: defineTable({
    body: v.string(),
    productId: v.optional(v.id("products")),
    productTitle: v.optional(v.string()),
    senderType: v.union(v.literal("buyer"), v.literal("seller")),
    storeId: v.id("stores"),
    viewerId: v.string(),
    viewerName: v.optional(v.string()),
  })
    .index("by_store", ["storeId"])
    .index("by_viewer", ["viewerId"])
    .index("by_store_viewer", ["storeId", "viewerId"]),
});
