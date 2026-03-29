"use client";

import { useEffect, useMemo, useState } from "react";

import type { LayoutType, MarketplaceProduct, Product } from "@vendorly/utils";
import { cn, formatCurrency, getProductImages } from "@vendorly/utils";

import { ThemeWrapper } from "./theme-wrapper";

type ProductCardProps = {
  className?: string;
  layout?: LayoutType;
  product: Product | MarketplaceProduct;
  storeName?: string;
  themeColor?: string;
};

export function ProductCard({
  className,
  layout = "grid",
  product,
  storeName,
  themeColor,
}: ProductCardProps) {
  const resolvedStoreName =
    storeName ?? ("store" in product ? product.store?.name : undefined);
  const isList = layout === "list";
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [product._id]);

  const currentImage = images[activeImage] ?? images[0];

  return (
    <ThemeWrapper
      themeColor={
        themeColor ?? ("store" in product ? product.store?.themeColor : undefined)
      }
      className={cn(
        "overflow-hidden border border-black/10 bg-[rgba(255,253,247,0.94)]",
        isList && "md:grid md:grid-cols-[260px_minmax(0,1fr)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative isolate overflow-hidden border-b border-black/10 bg-slate-100",
          isList
            ? "h-64 border-b-0 md:h-full md:border-b-0 md:border-r"
            : "aspect-[4/3]",
        )}
      >
        {currentImage ? (
          <img
            alt={product.title}
            className="h-full w-full object-cover"
            src={currentImage}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--vendorly-theme), rgba(241,245,249,0.95), rgba(226,232,240,0.92))",
            }}
          />
        )}
        <div className="absolute inset-x-4 top-4 flex justify-between gap-3">
          <span className="border border-white/70 bg-white/85 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-700 backdrop-blur">
            Vendorly pick
          </span>
          <span className="bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
            {formatCurrency(product.price)}
          </span>
        </div>
        {images.length > 1 ? (
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={`${product._id}-${image}`}
                type="button"
                onClick={() => setActiveImage(index)}
                className={cn(
                  "h-12 w-12 overflow-hidden border-2 bg-white/90 transition",
                  index === activeImage
                    ? "border-white shadow-md"
                    : "border-white/40 opacity-80 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1} for ${product.title}`}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={image}
                />
              </button>
            ))}
            {images.length > 4 ? (
              <span className="bg-slate-950/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                +{images.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
              {product.title}
            </h3>
            {resolvedStoreName ? (
              <span className="border border-black/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                {resolvedStoreName}
              </span>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            Storefront-ready catalog item
          </span>
          <button
            type="button"
            className="inline-flex items-center border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add to cart
          </button>
        </div>
      </div>
    </ThemeWrapper>
  );
}
