import { mutationGeneric } from "convex/server";

import { DEFAULT_THEME_COLOR } from "@vendorly/utils";

export const seedDemoData = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const existingStores = await ctx.db.query("stores").collect();

    if (existingStores.length > 0) {
      return {
        created: false,
        message: "Demo data already exists.",
      };
    }

    const owners = [
      {
        authUserId: "studio@aurahome.com",
        email: "studio@aurahome.com",
        name: "Aura Home",
      },
      {
        authUserId: "hello@northsupply.co",
        email: "hello@northsupply.co",
        name: "North Supply",
      },
    ];

    for (const owner of owners) {
      await ctx.db.insert("users", owner);
    }

    const auraStoreId = await ctx.db.insert("stores", {
      name: "Aura Home",
      slug: "aura-home",
      description:
        "Curated home accents with warm textures, minimal forms, and boutique editorial styling.",
      bio:
        "Aura Home curates tactile pieces for calm interiors, mixing small-batch ceramics, soft linens, and quiet statement objects designed to make everyday rooms feel composed.",
      bannerImage:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
      logoImage:
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=600&q=80",
      themeColor: "#0f766e",
      layoutType: "grid",
      ownerId: owners[0].email,
      websiteUrl: "https://aurahome.example.com",
      instagramUrl: "https://instagram.com/aurahome",
      tiktokUrl: "https://tiktok.com/@aurahome",
      xUrl: "https://x.com/aurahome",
    });

    const northStoreId = await ctx.db.insert("stores", {
      name: "North Supply",
      slug: "north-supply",
      description:
        "Functional carry goods, desk essentials, and field-ready accessories built for everyday use.",
      bio:
        "North Supply builds reliable everyday gear for workdays, travel, and city movement, blending utility-first design with a quiet outdoor influence.",
      bannerImage:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80",
      logoImage:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      themeColor: "#b45309",
      layoutType: "list",
      ownerId: owners[1].email,
      websiteUrl: "https://northsupply.example.com",
      instagramUrl: "https://instagram.com/northsupply",
      xUrl: "https://x.com/northsupply",
    });

    await Promise.all([
      ctx.db.insert("products", {
        title: "Stoneware Candle",
        description:
          "Hand-poured soy candle in a reusable vessel with cedar, bergamot, and fig notes.",
        price: 38,
        image:
          "https://images.unsplash.com/photo-1602872029708-84d970d338e6?auto=format&fit=crop&w=900&q=80",
        images: [
          "https://images.unsplash.com/photo-1602872029708-84d970d338e6?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1612196808214-b7e239e5cb12?auto=format&fit=crop&w=900&q=80",
        ],
        storeId: auraStoreId,
      }),
      ctx.db.insert("products", {
        title: "Linen Throw",
        description:
          "Soft washed linen throw for reading nooks, bedroom styling, and layered living spaces.",
        price: 74,
        image:
          "https://images.unsplash.com/photo-1616628182509-6cc4d5a9980f?auto=format&fit=crop&w=900&q=80",
        images: [
          "https://images.unsplash.com/photo-1616628182509-6cc4d5a9980f?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        ],
        storeId: auraStoreId,
      }),
      ctx.db.insert("products", {
        title: "Field Notebook Set",
        description:
          "Three-grid pack with recycled kraft covers, numbered pages, and durable stitched binding.",
        price: 24,
        image:
          "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
        images: [
          "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        ],
        storeId: northStoreId,
      }),
      ctx.db.insert("products", {
        title: "Transit Sling",
        description:
          "Weather-resistant crossbody bag sized for tablets, cables, and a day of city errands.",
        price: 89,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
        ],
        storeId: northStoreId,
      }),
    ]);

    return {
      created: true,
      message: `Seeded demo marketplace with ${DEFAULT_THEME_COLOR} as the base accent.`,
    };
  },
});
