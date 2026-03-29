"use server";

import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";

import { api } from "@vendorly/convex";
import {
  normalizeThemeColor,
  normalizeUrlInput,
  parseImageUrls,
  slugify,
  type LayoutType,
} from "@vendorly/utils";

import { requireDashboardUser } from "@/lib/current-user";
import { getConvexServerOptions } from "@/lib/convex";

export type DashboardActionResult = {
  message: string;
  storeId?: string;
  success: boolean;
};

type SaveStoreInput = {
  bannerImage?: string;
  bio: string;
  description: string;
  instagramUrl?: string;
  layoutType: LayoutType;
  logoImage?: string;
  name: string;
  previousSlug?: string;
  slug: string;
  storeId?: string;
  tiktokUrl?: string;
  themeColor: string;
  websiteUrl?: string;
  xUrl?: string;
};

type SaveProductInput = {
  description: string;
  imagesText: string;
  imageStorageIds: string[];
  price: string;
  productId?: string;
  storeId: string;
  storeSlug: string;
  title: string;
};

type SendSellerChatReplyInput = {
  body: string;
  storeId: string;
  viewerId: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export async function saveStoreAction(
  input: SaveStoreInput,
): Promise<DashboardActionResult> {
  try {
    const currentUser = await requireDashboardUser();
    const convexOptions = getConvexServerOptions();
    const slug = slugify(input.slug || input.name);

    if (!input.name.trim()) {
      return {
        success: false,
        message: "Store name is required.",
      };
    }

    if (!slug) {
      return {
        success: false,
        message: "Store slug is required.",
      };
    }

    const payload = {
      bannerImage: normalizeUrlInput(input.bannerImage),
      bio: input.bio.trim() || undefined,
      description: input.description.trim(),
      instagramUrl: normalizeUrlInput(input.instagramUrl),
      layoutType: input.layoutType,
      logoImage: normalizeUrlInput(input.logoImage),
      name: input.name.trim(),
      ownerEmail: currentUser.email,
      ownerId: currentUser.id,
      ownerImage: currentUser.image,
      ownerName: currentUser.name,
      slug,
      tiktokUrl: normalizeUrlInput(input.tiktokUrl),
      themeColor: normalizeThemeColor(input.themeColor),
      websiteUrl: normalizeUrlInput(input.websiteUrl),
      xUrl: normalizeUrlInput(input.xUrl),
    };

    const storeId = input.storeId
      ? await fetchMutation(
          api.stores.updateStore,
          {
            ...payload,
            storeId: input.storeId,
          },
          convexOptions,
        )
      : await fetchMutation(api.stores.createStore, payload, convexOptions);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/store/${slug}`);

    if (input.previousSlug && input.previousSlug !== slug) {
      revalidatePath(`/store/${input.previousSlug}`);
    }

    return {
      success: true,
      message: input.storeId ? "Store updated." : "Store created.",
      storeId: String(storeId),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function saveProductAction(
  input: SaveProductInput,
): Promise<DashboardActionResult> {
  try {
    const currentUser = await requireDashboardUser();
    const convexOptions = getConvexServerOptions();
    const price = Number(input.price);

    if (!input.storeId) {
      return {
        success: false,
        message: "Choose a store before saving products.",
      };
    }

    if (!input.title.trim()) {
      return {
        success: false,
        message: "Product title is required.",
      };
    }

    if (!Number.isFinite(price) || price < 0) {
      return {
        success: false,
        message: "Enter a valid product price.",
      };
    }

    const images = parseImageUrls(input.imagesText);
    const payload = {
      description: input.description.trim(),
      image: images[0],
      images: images.length > 0 ? images : undefined,
      imageStorageIds:
        input.imageStorageIds.length > 0 ? input.imageStorageIds : undefined,
      ownerId: currentUser.id,
      price,
      title: input.title.trim(),
    };

    if (input.productId) {
      await fetchMutation(
        api.products.updateProduct,
        {
          ...payload,
          productId: input.productId,
        },
        convexOptions,
      );
    } else {
      await fetchMutation(
        api.products.createProduct,
        {
          ...payload,
          storeId: input.storeId,
        },
        convexOptions,
      );
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/store/${input.storeSlug}`);

    return {
      success: true,
      message: input.productId ? "Product updated." : "Product created.",
      storeId: input.storeId,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function seedDemoDataAction(): Promise<DashboardActionResult> {
  try {
    await requireDashboardUser();
    const convexOptions = getConvexServerOptions();
    const result = await fetchMutation(
      api.seed.seedDemoData,
      {},
      convexOptions,
    );

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function sendSellerChatReplyAction(
  input: SendSellerChatReplyInput,
): Promise<DashboardActionResult> {
  try {
    const currentUser = await requireDashboardUser();
    const convexOptions = getConvexServerOptions();

    if (!input.storeId) {
      return {
        success: false,
        message: "Choose a store before replying to chats.",
      };
    }

    if (!input.viewerId) {
      return {
        success: false,
        message: "Select a conversation before replying.",
      };
    }

    if (!input.body.trim()) {
      return {
        success: false,
        message: "Reply cannot be empty.",
      };
    }

    await fetchMutation(
      api.chat.sendSellerStoreMessage,
      {
        body: input.body.trim(),
        ownerId: currentUser.id,
        storeId: input.storeId,
        viewerId: input.viewerId,
      },
      convexOptions,
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Reply sent.",
      storeId: input.storeId,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function generateProductImageUploadUrlAction() {
  await requireDashboardUser();
  const convexOptions = getConvexServerOptions();

  return await fetchMutation(
    api.products.generateProductImageUploadUrl,
    {},
    convexOptions,
  );
}
