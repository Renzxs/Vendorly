import { getProductReactionSummary } from "./social";

export async function hydrateProduct(ctx: any, product: any) {
  const externalImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const uploadedImages = await Promise.all(
    (product.imageStorageIds ?? []).map(
      async (storageId: any) => await ctx.storage.getUrl(storageId),
    ),
  );
  const resolvedImages = [...externalImages, ...uploadedImages.filter(Boolean)];

  return {
    ...product,
    image: resolvedImages[0] ?? product.image,
    resolvedImages,
  };
}

export async function hydrateMarketplaceProduct(
  ctx: any,
  product: any,
  viewerId?: string,
) {
  const store = await ctx.db.get(product.storeId);
  const hydratedProduct = await hydrateProduct(ctx, product);
  const reactionSummary = await getProductReactionSummary(
    ctx,
    product._id,
    viewerId,
  );

  return {
    ...hydratedProduct,
    ...reactionSummary,
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
