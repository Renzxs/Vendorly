import { anyApi } from "convex/server";

export const api = anyApi as {
  products: {
    createProduct: any;
    generateProductImageUploadUrl: any;
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
  };
};
