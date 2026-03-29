"use client";

import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  LayoutSwitcher,
  ProductCard,
  StoreBanner,
  ThemeWrapper,
} from "@vendorly/ui";
import {
  DEFAULT_PRODUCT_FORM,
  DEFAULT_STORE_FORM,
  getProductImages,
  getStoreSocialLinks,
  MARKETPLACE_URL,
  getInitials,
  normalizeThemeColor,
  parseImageUrls,
  slugify,
  type Product,
  type ProductFormValues,
  type Store,
  type StoreFormValues,
} from "@vendorly/utils";

import {
  saveProductAction,
  saveStoreAction,
  generateProductImageUploadUrlAction,
  seedDemoDataAction,
  type DashboardActionResult,
} from "@/app/dashboard/actions";
import { signOutAction } from "@/lib/auth-actions";

type StatusState =
  | {
      kind: "error" | "success";
      message: string;
    }
  | null;

type DashboardShellProps = {
  currentUser: {
    email: string;
    id: string;
    image?: string;
    name?: string;
  };
  selectedStoreId?: string;
  selectedStoreProducts: Product[];
  stores: Store[];
};

type UploadedImagePreview = {
  previewUrl: string;
  storageId: string;
};

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-black/10 bg-[rgba(255,253,247,0.96)] px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
    />
  );
}

function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full border border-black/10 bg-[rgba(255,253,247,0.96)] px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
    />
  );
}

function StoreListCard({
  active,
  onClick,
  store,
}: {
  active: boolean;
  onClick: () => void;
  store: Store;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border p-4 text-left transition ${
        active
          ? "border-slate-950 bg-[#111c18] text-white"
          : "border-black/10 bg-[rgba(255,253,247,0.92)] hover:border-slate-400 hover:bg-white/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          {store.logoImage ? (
            <img
              alt={`${store.name} logo`}
              className="h-12 w-12 border border-white/10 object-cover"
              src={store.logoImage}
            />
          ) : (
            <div
              className={`inline-flex h-11 w-11 items-center justify-center border text-sm font-semibold ${
                active ? "bg-white/15 text-white" : "text-white"
              }`}
              style={active ? undefined : { backgroundColor: store.themeColor }}
            >
              {getInitials(store.name)}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold tracking-tight">{store.name}</p>
            <p
              className={`text-sm leading-6 ${
                active ? "text-white/70" : "text-slate-600"
              }`}
            >
              {store.description}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
            active
              ? "border border-white/15 bg-white/10 text-white/75"
              : "border border-black/10 text-slate-500"
          }`}
        >
          {store.layoutType}
        </span>
      </div>
    </button>
  );
}

function EmptyProductsState() {
  return (
    <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.9)] p-6 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        No products yet
      </h3>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        Add your first product and it will appear on this storefront
        immediately.
      </p>
    </div>
  );
}

export function DashboardShell({
  currentUser,
  selectedStoreId,
  selectedStoreProducts,
  stores,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigatingStore, startNavigationTransition] = useTransition();
  const [storeForm, setStoreForm] = useState<StoreFormValues>(DEFAULT_STORE_FORM);
  const [productForm, setProductForm] =
    useState<ProductFormValues>(DEFAULT_PRODUCT_FORM);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>(null);
  const [submittingStore, setSubmittingStore] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImagePreview[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const selectedStore = useMemo(
    () => stores.find((store) => store._id === selectedStoreId),
    [selectedStoreId, stores],
  );
  const previewThemeColor = normalizeThemeColor(storeForm.themeColor);
  const previewSlug = slugify(storeForm.slug || storeForm.name);
  const previewUrl = previewSlug
    ? `${MARKETPLACE_URL}/store/${previewSlug}`
    : undefined;
  const productImagePreviews = parseImageUrls(productForm.imagesText);
  const previewSocialLinks = getStoreSocialLinks(storeForm);

  function replaceUploadedImages(nextImages: UploadedImagePreview[]) {
    setUploadedImages((current) => {
      current.forEach((image) => {
        if (image.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });

      return nextImages;
    });
  }

  useEffect(() => {
    if (!selectedStore) {
      setStoreForm(DEFAULT_STORE_FORM);
      setProductForm(DEFAULT_PRODUCT_FORM);
      setSelectedProductId(null);
      replaceUploadedImages([]);
      return;
    }

    setStoreForm({
      name: selectedStore.name,
      slug: selectedStore.slug,
      description: selectedStore.description,
      bio: selectedStore.bio ?? "",
      bannerImage: selectedStore.bannerImage ?? "",
      logoImage: selectedStore.logoImage ?? "",
      themeColor: selectedStore.themeColor,
      layoutType: selectedStore.layoutType,
      websiteUrl: selectedStore.websiteUrl ?? "",
      instagramUrl: selectedStore.instagramUrl ?? "",
      tiktokUrl: selectedStore.tiktokUrl ?? "",
      xUrl: selectedStore.xUrl ?? "",
    });
    setSelectedProductId(null);
    setProductForm(DEFAULT_PRODUCT_FORM);
    replaceUploadedImages([]);
  }, [selectedStore]);

  useEffect(() => {
    if (!selectedProductId) {
      return;
    }

    const product = selectedStoreProducts.find(
      (item) => item._id === selectedProductId,
    );

    if (!product) {
      return;
    }

    const externalImageUrls =
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];
    const displayedImages = getProductImages(product);

    setProductForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      imagesText: externalImageUrls.join("\n"),
    });
    replaceUploadedImages(
      (product.imageStorageIds ?? []).map((storageId, index) => ({
        previewUrl:
          displayedImages[index + externalImageUrls.length] ??
          displayedImages[0] ??
          "",
        storageId,
      })),
    );
  }, [selectedProductId, selectedStoreProducts]);

  function clearUploadedImages() {
    replaceUploadedImages([]);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setUploadingImages(true);
    setStatus(null);

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateProductImageUploadUrlAction();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}.`);
          }

          const payload = (await response.json()) as { storageId?: string };

          if (!payload.storageId) {
            throw new Error(`Missing storage id for ${file.name}.`);
          }

          return {
            previewUrl: URL.createObjectURL(file),
            storageId: payload.storageId,
          };
        }),
      );

      setUploadedImages((current) => [...current, ...uploaded]);
      setStatus({
        kind: "success",
        message: `${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded.`,
      });
      event.target.value = "";
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to upload images.",
      });
    } finally {
      setUploadingImages(false);
    }
  }

  function removeUploadedImage(storageId: string) {
    setUploadedImages((current) =>
      current.filter((image) => {
        if (image.storageId === storageId && image.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }

        return image.storageId !== storageId;
      }),
    );
  }

  function navigateToStore(storeId?: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (storeId) {
      nextSearchParams.set("store", storeId);
    } else {
      nextSearchParams.delete("store");
    }

    const nextUrl = nextSearchParams.toString()
      ? `${pathname}?${nextSearchParams.toString()}`
      : pathname;

    startNavigationTransition(() => {
      router.replace(nextUrl);
    });
  }

  async function applyActionResult(result: DashboardActionResult) {
    setStatus({
      kind: result.success ? "success" : "error",
      message: result.message,
    });

    if (!result.success) {
      return;
    }

    if (result.storeId) {
      if (result.storeId === selectedStoreId) {
        startNavigationTransition(() => {
          router.refresh();
        });
      } else {
        navigateToStore(result.storeId);
      }
    } else {
      startNavigationTransition(() => {
        router.refresh();
      });
    }
  }

  async function handleStoreSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingStore(true);
    setStatus(null);

    try {
      const result = await saveStoreAction({
        bannerImage: storeForm.bannerImage || undefined,
        bio: storeForm.bio,
        description: storeForm.description,
        instagramUrl: storeForm.instagramUrl || undefined,
        layoutType: storeForm.layoutType,
        logoImage: storeForm.logoImage || undefined,
        name: storeForm.name,
        previousSlug: selectedStore?.slug,
        slug: storeForm.slug,
        storeId: selectedStore?._id,
        tiktokUrl: storeForm.tiktokUrl || undefined,
        themeColor: storeForm.themeColor,
        websiteUrl: storeForm.websiteUrl || undefined,
        xUrl: storeForm.xUrl || undefined,
      });

      await applyActionResult(result);
    } finally {
      setSubmittingStore(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStore) {
      setStatus({
        kind: "error",
        message: "Create or select a store before saving products.",
      });
      return;
    }

    setSubmittingProduct(true);
    setStatus(null);

    try {
      const result = await saveProductAction({
        description: productForm.description,
        imageStorageIds: uploadedImages.map((image) => image.storageId),
        imagesText: productForm.imagesText,
        price: productForm.price,
        productId: selectedProductId || undefined,
        storeId: selectedStore._id,
        storeSlug: selectedStore.slug,
        title: productForm.title,
      });

      if (result.success) {
        setProductForm(DEFAULT_PRODUCT_FORM);
        setSelectedProductId(null);
        clearUploadedImages();
      }

      await applyActionResult(result);
    } finally {
      setSubmittingProduct(false);
    }
  }

  return (
    <main className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-8">
      <section className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              Vendorly seller control center
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
              One account, multiple storefronts, secure product management.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Sign in with Google or GitHub, create as many stores as you need,
              and manage each catalog from a server-secured dashboard.
            </p>
          </div>

          <div className="border border-black/10 bg-slate-950 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {currentUser.image ? (
                  <img
                    alt={currentUser.name || currentUser.email}
                    className="h-14 w-14 border border-white/10 object-cover"
                    src={currentUser.image}
                  />
                ) : (
                  <div className="inline-flex h-14 w-14 items-center justify-center border border-white/10 bg-white/10 text-sm font-semibold text-white">
                    {getInitials(currentUser.name || currentUser.email)}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    {currentUser.name || "Vendorly seller"}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{currentUser.email}</p>
                </div>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Sign out
                </button>
              </form>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                  Stores owned
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  {stores.length}
                </p>
              </div>
              <div className="border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                  Products in view
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  {selectedStoreProducts.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setStatus(null);
                const result = await seedDemoDataAction();
                await applyActionResult(result);
              }}
              className="mt-6 inline-flex border border-white bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Seed demo marketplace
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                  Your stores
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Switch between storefronts or start a new one.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatus(null);
                  setStoreForm(DEFAULT_STORE_FORM);
                  setProductForm(DEFAULT_PRODUCT_FORM);
                  setSelectedProductId(null);
                  clearUploadedImages();
                  navigateToStore(undefined);
                }}
                className="inline-flex border border-black/10 bg-[rgba(255,253,247,0.96)] px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-white/70"
              >
                Create new store
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <StoreListCard
                    key={store._id}
                    active={selectedStoreId === store._id}
                    onClick={() => {
                      setStatus(null);
                      navigateToStore(store._id);
                    }}
                    store={store}
                  />
                ))
              ) : (
                <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.9)] p-6 text-center">
                  <h3 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                    No stores yet
                  </h3>
                  <p className="mt-3 text-sm leading-8 text-slate-600">
                    Create your first storefront to start selling on Vendorly.
                  </p>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleStoreSubmit}
            className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                  Store editor
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedStore
                    ? `Editing ${selectedStore.name}`
                    : "Create a new branded storefront"}
                </h2>
              </div>
              {previewUrl ? (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Preview storefront
                </a>
              ) : null}
            </div>

            <div className="mt-8 grid gap-5">
              <Field label="Store name">
                <TextInput
                  onChange={(event) =>
                    setStoreForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug:
                        current.slug || Boolean(selectedStore)
                          ? current.slug
                          : slugify(event.target.value),
                    }))
                  }
                  placeholder="Aurora Atelier"
                  value={storeForm.name}
                />
              </Field>
              <Field label="Store slug">
                <div className="flex gap-3">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="aurora-atelier"
                    value={storeForm.slug}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setStoreForm((current) => ({
                        ...current,
                        slug: slugify(current.name),
                      }))
                    }
                    className="border border-black/10 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white/70"
                  >
                    Generate
                  </button>
                </div>
              </Field>
              <Field label="Description">
                <Textarea
                  onChange={(event) =>
                    setStoreForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Tell buyers what makes this storefront unique."
                  value={storeForm.description}
                />
              </Field>
              <Field label="Store bio">
                <Textarea
                  onChange={(event) =>
                    setStoreForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  placeholder="Share the story behind the brand, your aesthetic, and what buyers can expect."
                  value={storeForm.bio}
                />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Store logo image URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        logoImage: event.target.value,
                      }))
                    }
                    placeholder="https://images.unsplash.com/..."
                    value={storeForm.logoImage}
                  />
                </Field>
                <Field label="Banner image URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        bannerImage: event.target.value,
                      }))
                    }
                    placeholder="https://images.unsplash.com/..."
                    value={storeForm.bannerImage}
                  />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                <Field label="Theme color">
                  <div className="flex items-center gap-3 border border-black/10 bg-[rgba(255,253,247,0.96)] px-4 py-3">
                    <input
                      type="color"
                      className="h-10 w-12 border-0 bg-transparent p-0"
                      onChange={(event) =>
                        setStoreForm((current) => ({
                          ...current,
                          themeColor: event.target.value,
                        }))
                      }
                      value={previewThemeColor}
                    />
                    <TextInput
                      onChange={(event) =>
                        setStoreForm((current) => ({
                          ...current,
                          themeColor: event.target.value,
                        }))
                      }
                      value={storeForm.themeColor}
                    />
                  </div>
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Website URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        websiteUrl: event.target.value,
                      }))
                    }
                    placeholder="yourstore.com"
                    value={storeForm.websiteUrl}
                  />
                </Field>
                <Field label="Instagram URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        instagramUrl: event.target.value,
                      }))
                    }
                    placeholder="instagram.com/yourstore"
                    value={storeForm.instagramUrl}
                  />
                </Field>
                <Field label="TikTok URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        tiktokUrl: event.target.value,
                      }))
                    }
                    placeholder="tiktok.com/@yourstore"
                    value={storeForm.tiktokUrl}
                  />
                </Field>
                <Field label="X URL">
                  <TextInput
                    onChange={(event) =>
                      setStoreForm((current) => ({
                        ...current,
                        xUrl: event.target.value,
                      }))
                    }
                    placeholder="x.com/yourstore"
                    value={storeForm.xUrl}
                  />
                </Field>
              </div>
              <Field label="Store layout">
                <ThemeWrapper themeColor={previewThemeColor}>
                  <LayoutSwitcher
                    value={storeForm.layoutType}
                    onChange={(layoutType) =>
                      setStoreForm((current) => ({
                        ...current,
                        layoutType,
                      }))
                    }
                  />
                </ThemeWrapper>
              </Field>
            </div>

            <button
              type="submit"
              disabled={submittingStore}
              className="mt-8 inline-flex border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingStore
                ? "Saving..."
                : selectedStore
                  ? "Update storefront"
                  : "Create storefront"}
            </button>
          </form>

          <form
            onSubmit={handleProductSubmit}
            className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                  Product editor
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedStore
                    ? `Manage products for ${selectedStore.name}`
                    : "Select a store to manage products"}
                </h2>
              </div>
              {selectedProductId ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductId(null);
                    setProductForm(DEFAULT_PRODUCT_FORM);
                    clearUploadedImages();
                  }}
                  className="inline-flex border border-black/10 bg-[rgba(255,253,247,0.96)] px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-white/70"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-5">
              <Field label="Title">
                <TextInput
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Stoneware candle"
                  value={productForm.title}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe materials, vibe, and what makes it special."
                  value={productForm.description}
                />
              </Field>
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <Field label="Price (USD)">
                  <TextInput
                    min="0"
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                    }
                    step="0.01"
                    type="number"
                    value={productForm.price}
                  />
                </Field>
                <Field label="Product image URLs">
                  <Textarea
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        imagesText: event.target.value,
                      }))
                    }
                    placeholder={
                      "https://images.unsplash.com/photo-1\nhttps://images.unsplash.com/photo-2"
                    }
                    value={productForm.imagesText}
                  />
                </Field>
              </div>
              <Field label="Attach image files">
                <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.96)] p-4">
                  <input
                    accept="image/*"
                    className="block w-full text-sm text-slate-700 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                    multiple
                    onChange={handleImageUpload}
                    type="file"
                  />
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Upload PNG, JPG, WEBP, or other image files. You can combine
                    uploaded files with external image URLs.
                  </p>
                </div>
              </Field>
              <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.84)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Gallery preview
                  </p>
                  <p className="text-xs text-slate-500">
                    {productImagePreviews.length + uploadedImages.length} image
                    {productImagePreviews.length + uploadedImages.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
                {productImagePreviews.length > 0 || uploadedImages.length > 0 ? (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {productImagePreviews.map((image) => (
                      <img
                        key={image}
                        alt=""
                        className="aspect-square border border-black/10 object-cover"
                        src={image}
                      />
                    ))}
                    {uploadedImages.map((image) => (
                      <div key={image.storageId} className="relative">
                        <img
                          alt=""
                          className="aspect-square border border-black/10 object-cover"
                          src={image.previewUrl}
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(image.storageId)}
                          className="absolute right-2 top-2 bg-slate-950/85 px-2 py-1 text-xs font-medium text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Paste one image URL per line, upload files, or combine both
                    to build a product gallery.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingProduct || uploadingImages || !selectedStore}
              className="mt-8 inline-flex border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImages
                ? "Uploading images..."
                : submittingProduct
                ? "Saving..."
                : selectedProductId
                  ? "Update product"
                  : "Add product"}
            </button>
          </form>

          {status ? (
            <div
              className={`border px-5 py-4 text-sm ${
                status.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {status.message}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <ThemeWrapper themeColor={previewThemeColor}>
            <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-4">
              <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Live preview
              </p>
              <StoreBanner
                bannerImage={storeForm.bannerImage}
                description={
                  storeForm.description || "Describe the mood and offer of your store."
                }
                logoImage={storeForm.logoImage}
                name={storeForm.name || "Your Vendorly Store"}
                themeColor={previewThemeColor}
              />
            </div>
          </ThemeWrapper>

          <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Store profile preview
            </p>
            <div className="mt-5 flex items-start gap-4">
              {storeForm.logoImage ? (
                <img
                  alt={storeForm.name || "Store logo"}
                  className="h-20 w-20 border border-black/10 object-cover"
                  src={storeForm.logoImage}
                />
              ) : (
                <div
                  className="inline-flex h-20 w-20 items-center justify-center border border-black/10 text-lg font-semibold text-white"
                  style={{ backgroundColor: previewThemeColor }}
                >
                  {getInitials(storeForm.name || "Vendorly Store")}
                </div>
              )}
              <div className="space-y-3">
                <h3 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
                  {storeForm.name || "Your Vendorly Store"}
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  {storeForm.description || "Your short storefront description will appear here."}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-8 text-slate-600">
              {storeForm.bio ||
                "Use the store bio to tell buyers who you are, what you sell, and the feeling behind your brand."}
            </p>
            {previewSocialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {previewSocialLinks.map((link) => (
                  <span
                    key={link.label}
                    className="border border-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Add website or social links to highlight them here.
              </p>
            )}
          </div>

          <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Existing products
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedStore
                    ? `Showing products for ${selectedStore.name}`
                    : "Choose a store to view products"}
                </p>
              </div>
              {isNavigatingStore ? (
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Loading
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              {!selectedStore ? (
                <EmptyProductsState />
              ) : selectedStoreProducts.length > 0 ? (
                selectedStoreProducts.map((product) => (
                  <div key={product._id} className="space-y-3">
                    <ProductCard
                      layout="list"
                      product={product}
                      storeName={selectedStore.name}
                      themeColor={selectedStore.themeColor}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(product._id)}
                      className="inline-flex border border-black/10 bg-[rgba(255,253,247,0.96)] px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-white/70"
                    >
                      Edit product
                    </button>
                  </div>
                ))
              ) : (
                <EmptyProductsState />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
