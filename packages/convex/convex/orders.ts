import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  calculateShippingFee,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from "@vendorly/utils";

import { createNotification } from "./lib/notifications";

const orderPaymentMethodValidator = v.union(
  v.literal("card"),
  v.literal("online"),
  v.literal("cod"),
);

const orderPaymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("cod_due"),
);

const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
);

const shippingAddressValidator = v.object({
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
});

function generateOrderCodeCandidate() {
  return `VD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function buildDashboardOrderHref(storeId: string) {
  return `/dashboard?store=${encodeURIComponent(storeId)}`;
}

function buildBuyerOrdersHref() {
  return "/orders";
}

async function generateUniqueOrderCode(ctx: any) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderCode = generateOrderCodeCandidate();
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_order_code", (query: any) =>
        query.eq("orderCode", orderCode),
      )
      .unique();

    if (!existingOrder) {
      return orderCode;
    }
  }

  throw new Error("Unable to generate a unique order code.");
}

async function resolveProductImage(ctx: any, product: any) {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }

  if (product.image) {
    return product.image;
  }

  if (product.imageStorageIds?.[0]) {
    return (await ctx.storage.getUrl(product.imageStorageIds[0])) ?? undefined;
  }

  return undefined;
}

function getInitialOrderState(paymentMethod: "card" | "cod" | "online") {
  if (paymentMethod === "card") {
    return {
      label: "Card payment approved. Seller can begin preparing the order.",
      orderStatus: "confirmed" as const,
      paymentStatus: "paid" as const,
    };
  }

  if (paymentMethod === "cod") {
    return {
      label:
        "Cash on delivery selected. Payment will be collected on delivery.",
      orderStatus: "confirmed" as const,
      paymentStatus: "cod_due" as const,
    };
  }

  return {
    label: "Waiting for online payment confirmation from the seller.",
    orderStatus: "pending" as const,
    paymentStatus: "pending" as const,
  };
}

function buildUpdateLabel(args: {
  nextOrderStatus: string;
  nextPaymentStatus: string;
  orderStatusChanged: boolean;
  paymentStatusChanged: boolean;
}) {
  if (args.orderStatusChanged && args.paymentStatusChanged) {
    return `Order marked ${args.nextOrderStatus} and payment updated.`;
  }

  if (args.orderStatusChanged) {
    return `Order marked ${args.nextOrderStatus}.`;
  }

  return `Payment marked ${args.nextPaymentStatus}.`;
}

async function hydrateOrder(ctx: any, order: any) {
  const store = await ctx.db.get(order.storeId);

  return {
    ...order,
    store: store
      ? {
          _id: store._id,
          name: store.name,
          slug: store.slug,
          themeColor: store.themeColor,
        }
      : undefined,
  };
}

export const getViewerOrders = queryGeneric({
  args: {
    buyerId: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (query) => query.eq("buyerId", args.buyerId))
      .take(100);

    const hydratedOrders = await Promise.all(
      orders.map(async (order) => await hydrateOrder(ctx, order)),
    );

    return hydratedOrders.sort(
      (left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0),
    );
  },
});

export const getOrdersByOwner = queryGeneric({
  args: {
    ownerId: v.string(),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    if (!args.storeId) {
      return [];
    }

    const store = await ctx.db.get(args.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_store", (query) => query.eq("storeId", args.storeId!))
      .take(100);

    return orders.sort(
      (left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0),
    );
  },
});

export const createOrdersFromCheckout = mutationGeneric({
  args: {
    buyerEmail: v.string(),
    buyerId: v.string(),
    buyerName: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      }),
    ),
    paymentMethod: orderPaymentMethodValidator,
    shippingAddress: shippingAddressValidator,
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const mergedItems = new Map<string, { productId: any; quantity: number }>();

    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Each cart item must have a positive quantity.");
      }

      const existingItem = mergedItems.get(String(item.productId));

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        mergedItems.set(String(item.productId), {
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    const ordersByStore = new Map<
      string,
      {
        itemCount: number;
        items: Array<{
          productId: any;
          productImage?: string;
          productTitle: string;
          quantity: number;
          unitPrice: number;
        }>;
        store: any;
        subtotal: number;
      }
    >();

    for (const item of mergedItems.values()) {
      const product = await ctx.db.get(item.productId);

      if (!product) {
        throw new Error("One of the products in your cart no longer exists.");
      }

      if (product.isSoldOut) {
        throw new Error(`${product.title} is currently sold out.`);
      }

      const store = await ctx.db.get(product.storeId);

      if (!store) {
        throw new Error("A product in your cart is missing its store.");
      }

      const storeKey = String(store._id);
      const existingStoreOrder = ordersByStore.get(storeKey) ?? {
        itemCount: 0,
        items: [],
        store,
        subtotal: 0,
      };

      existingStoreOrder.items.push({
        productId: product._id,
        productImage: await resolveProductImage(ctx, product),
        productTitle: product.title,
        quantity: item.quantity,
        unitPrice: product.price,
      });
      existingStoreOrder.itemCount += item.quantity;
      existingStoreOrder.subtotal += product.price * item.quantity;

      ordersByStore.set(storeKey, existingStoreOrder);
    }

    const createdOrders = [];
    const now = Date.now();
    const initialOrderState = getInitialOrderState(args.paymentMethod);

    for (const storeOrder of ordersByStore.values()) {
      const shippingFee = calculateShippingFee(storeOrder.subtotal);
      const total = storeOrder.subtotal + shippingFee;
      const orderCode = await generateUniqueOrderCode(ctx);
      const statusHistory = [
        {
          at: now,
          label: "Order placed.",
          orderStatus: "pending" as const,
        },
        {
          at: now,
          label: initialOrderState.label,
          orderStatus: initialOrderState.orderStatus,
          paymentStatus: initialOrderState.paymentStatus,
        },
      ];

      const orderId = await ctx.db.insert("orders", {
        buyerEmail: args.buyerEmail,
        buyerId: args.buyerId,
        buyerName: args.buyerName,
        itemCount: storeOrder.itemCount,
        items: storeOrder.items,
        orderCode,
        orderStatus: initialOrderState.orderStatus,
        paymentMethod: args.paymentMethod,
        paymentStatus: initialOrderState.paymentStatus,
        shippingAddress: args.shippingAddress,
        shippingFee,
        statusHistory,
        statusUpdatedAt: now,
        storeId: storeOrder.store._id,
        storeName: storeOrder.store.name,
        subtotal: storeOrder.subtotal,
        total,
      });

      await createNotification(ctx, {
        body: `${storeOrder.store.name} received order ${orderCode} for ${storeOrder.itemCount} item${storeOrder.itemCount === 1 ? "" : "s"}.`,
        href: buildDashboardOrderHref(String(storeOrder.store._id)),
        kind: "order_created",
        recipientRole: "seller",
        title: `New order from ${args.buyerName?.trim() || args.buyerEmail}`,
        userId: storeOrder.store.ownerId,
      });

      await createNotification(ctx, {
        body: `Order ${orderCode} at ${storeOrder.store.name} is ${getOrderStatusLabel(initialOrderState.orderStatus).toLowerCase()}.`,
        href: buildBuyerOrdersHref(),
        kind: "order_created",
        recipientRole: "buyer",
        title: `Order placed with ${storeOrder.store.name}`,
        userId: args.buyerId,
      });

      createdOrders.push({
        orderCode,
        orderId,
        storeId: storeOrder.store._id,
        storeName: storeOrder.store.name,
      });
    }

    return createdOrders;
  },
});

export const updateOrderStatus = mutationGeneric({
  args: {
    orderId: v.id("orders"),
    orderStatus: v.optional(orderStatusValidator),
    ownerId: v.string(),
    paymentStatus: v.optional(orderPaymentStatusValidator),
  },
  handler: async (ctx, args) => {
    if (!args.orderStatus && !args.paymentStatus) {
      throw new Error("Choose an order or payment update first.");
    }

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const store = await ctx.db.get(order.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      throw new Error("You can only update orders for your own store.");
    }

    const nextOrderStatus = args.orderStatus ?? order.orderStatus;
    const nextPaymentStatus =
      args.paymentStatus ??
      (args.orderStatus === "delivered" && order.paymentMethod === "cod"
        ? "paid"
        : order.paymentStatus);
    const orderStatusChanged = nextOrderStatus !== order.orderStatus;
    const paymentStatusChanged = nextPaymentStatus !== order.paymentStatus;

    if (!orderStatusChanged && !paymentStatusChanged) {
      return args.orderId;
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      orderStatus: nextOrderStatus,
      paymentStatus: nextPaymentStatus,
      statusHistory: [
        ...order.statusHistory,
        {
          at: now,
          label: buildUpdateLabel({
            nextOrderStatus,
            nextPaymentStatus,
            orderStatusChanged,
            paymentStatusChanged,
          }),
          orderStatus: orderStatusChanged ? nextOrderStatus : undefined,
          paymentStatus: paymentStatusChanged ? nextPaymentStatus : undefined,
        },
      ],
      statusUpdatedAt: now,
    });

    await createNotification(ctx, {
      body: `${store.name} updated order ${order.orderCode}: ${buildUpdateLabel(
        {
          nextOrderStatus,
          nextPaymentStatus,
          orderStatusChanged,
          paymentStatusChanged,
        },
      )} Payment is ${getPaymentStatusLabel(nextPaymentStatus).toLowerCase()}.`,
      href: buildBuyerOrdersHref(),
      kind: "order_updated",
      recipientRole: "buyer",
      title: `Order ${order.orderCode} was updated`,
      userId: order.buyerId,
    });

    return args.orderId;
  },
});
