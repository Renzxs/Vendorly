import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const orderPaymentMethod = v.union(
  v.literal("card"),
  v.literal("online"),
  v.literal("cod"),
);

const orderPaymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("cod_due"),
);

const orderStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
);

const notificationKind = v.union(
  v.literal("chat_message"),
  v.literal("order_created"),
  v.literal("order_updated"),
);

const notificationRecipientRole = v.union(
  v.literal("buyer"),
  v.literal("seller"),
);

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
    isSoldOut: v.optional(v.boolean()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    storeId: v.id("stores"),
  }).index("by_store", ["storeId"]),
  orders: defineTable({
    buyerEmail: v.string(),
    buyerId: v.string(),
    buyerName: v.optional(v.string()),
    itemCount: v.number(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productImage: v.optional(v.string()),
        productTitle: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
    orderCode: v.string(),
    orderStatus,
    paymentMethod: orderPaymentMethod,
    paymentStatus: orderPaymentStatus,
    shippingAddress: v.object({
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      country: v.string(),
      email: v.string(),
      fullName: v.string(),
      notes: v.optional(v.string()),
      phone: v.string(),
      postalCode: v.string(),
      stateProvince: v.string(),
    }),
    shippingFee: v.number(),
    statusHistory: v.array(
      v.object({
        at: v.number(),
        label: v.string(),
        orderStatus: v.optional(orderStatus),
        paymentStatus: v.optional(orderPaymentStatus),
      }),
    ),
    statusUpdatedAt: v.number(),
    storeId: v.id("stores"),
    storeName: v.string(),
    subtotal: v.number(),
    total: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_store", ["storeId"])
    .index("by_store_status", ["storeId", "orderStatus"])
    .index("by_order_code", ["orderCode"]),
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
  feedPosts: defineTable({
    body: v.string(),
    viewerId: v.string(),
    viewerImage: v.optional(v.string()),
    viewerName: v.optional(v.string()),
  }).index("by_viewer", ["viewerId"]),
  feedPostReactions: defineTable({
    postId: v.id("feedPosts"),
    reaction: v.union(v.literal("love"), v.literal("fire"), v.literal("wow")),
    viewerId: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_viewer", ["viewerId"])
    .index("by_post_viewer", ["postId", "viewerId"]),
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
  notifications: defineTable({
    body: v.string(),
    href: v.string(),
    kind: notificationKind,
    recipientRole: notificationRecipientRole,
    title: v.string(),
    userId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_recipient_role", ["userId", "recipientRole"]),
  notificationStates: defineTable({
    lastReadAt: v.optional(v.number()),
    recipientRole: v.optional(notificationRecipientRole),
    unreadCount: v.number(),
    userId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_recipient_role", ["userId", "recipientRole"]),
});
