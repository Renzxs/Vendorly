import { anyApi } from "convex/server";

export const api = anyApi as {
  assistant: {
    askStoreAssistant: any;
  };
  feed: {
    createFeedPost: any;
    getPaginatedProductFeed: any;
    getRecentFeedPosts: any;
  };
  chat: {
    getOwnerStoreChatMessages: any;
    getOwnerStoreChatThreads: any;
    getViewerStoreMessages: any;
    sendSellerStoreMessage: any;
    sendViewerStoreMessage: any;
  };
  notifications: {
    getInbox: any;
    markAllRead: any;
  };
  orders: {
    createOrdersFromCheckout: any;
    getOrdersByOwner: any;
    getViewerOrders: any;
    updateOrderStatus: any;
  };
  products: {
    createProduct: any;
    generateProductImageUploadUrl: any;
    getProductById: any;
    getProductFeed: any;
    getMarketplaceProducts: any;
    getProductsByStore: any;
    toggleProductReaction: any;
    updateProduct: any;
  };
  seed: {
    seedDemoData: any;
  };
  stores: {
    createStore: any;
    getStoresByOwner: any;
    getStoreBySlug: any;
    getStores: any;
    toggleStoreFollow: any;
    updateStore: any;
  };
  users: {
    getUserByAuthUserId: any;
    getUserByEmail: any;
    syncUser: any;
  };
};
