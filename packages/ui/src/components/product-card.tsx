"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { LayoutType, MarketplaceProduct, Product } from "@vendorly/utils";
import { cn, formatCurrency, getProductImages } from "@vendorly/utils";

import { ThemeWrapper } from "./theme-wrapper";

type ProductCardProps = {
  className?: string;
  footerContent?: ReactNode;
  footerLabel?: string;
  layout?: LayoutType;
  product: Product | MarketplaceProduct;
  storeName?: string;
  themeColor?: string;
};

export function ProductCard({
  className,
  footerContent,
  footerLabel = "Storefront-ready catalog item",
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
        themeColor ??
        ("store" in product ? product.store?.themeColor : undefined)
      }
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        isList && "md:grid md:grid-cols-[220px_minmax(0,1fr)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative isolate overflow-hidden bg-slate-100",
          isList
            ? "h-56 border-b border-slate-200 md:h-full md:border-b-0 md:border-r"
            : "aspect-[4/3] border-b border-slate-200",
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
      <div className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              {resolvedStoreName ? (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {resolvedStoreName}
                </p>
              ) : null}
              <h3 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
                {product.title}
              </h3>
            </div>
            <span className="shrink-0 text-lg font-semibold text-slate-950">
              {formatCurrency(product.price)}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
            {product.description}
          </p>
        </div>
        <div className="mt-auto space-y-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {footerLabel}
            </span>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--vendorly-theme)" }}
            />
          </div>
          {footerContent ? (
            <div className="flex flex-wrap items-center gap-2">
              {footerContent}
            </div>
          ) : null}
        </div>
      </div>
    </ThemeWrapper>
  );
}
