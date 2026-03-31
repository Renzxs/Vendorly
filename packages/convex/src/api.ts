import { anyApi } from "convex/server";

export const api = anyApi as {
  chat: {
    getOwnerStoreChatMessages: any;
    getOwnerStoreChatThreads: any;
    getViewerStoreMessages: any;
    sendSellerStoreMessage: any;
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
    updateStore: any;
  };
  users: {
    getUserByAuthUserId: any;
    getUserByEmail: any;
    syncUser: any;
  };
};

export const internal = anyApi as {
  chat: {
    sendViewerStoreMessage: any;
  };
  products: {
    toggleProductReaction: any;
  };
  stores: {
    toggleStoreFollow: any;
  };
};
