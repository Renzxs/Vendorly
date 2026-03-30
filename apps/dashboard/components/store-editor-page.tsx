"use client";

import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LayoutSwitcher, StoreBanner, ThemeWrapper } from "@vendorly/ui";
import {
  DEFAULT_STORE_FORM,
  getStoreSocialLinks,
  MARKETPLACE_URL,
  normalizeThemeColor,
  slugify,
  type Store,
  type StoreFormValues,
} from "@vendorly/utils";

import { saveStoreAction } from "@/app/dashboard/actions";
import { StoreRouteSidebar } from "@/components/store-route-sidebar";

type StatusState = {
  kind: "error" | "success";
  message: string;
} | null;

type StoreEditorPageProps = {
  mode: "create" | "edit";
  store?: Store;
  stores: Store[];
};

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
    />
  );
}

function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
    />
  );
}

function getStoreFormValues(store?: Store): StoreFormValues {
  if (!store) {
    return DEFAULT_STORE_FORM;
  }

  return {
    name: store.name,
    slug: store.slug,
    description: store.description,
    bio: store.bio ?? "",
    bannerImage: store.bannerImage ?? "",
    logoImage: store.logoImage ?? "",
    themeColor: store.themeColor,
    layoutType: store.layoutType,
    websiteUrl: store.websiteUrl ?? "",
    instagramUrl: store.instagramUrl ?? "",
    tiktokUrl: store.tiktokUrl ?? "",
    xUrl: store.xUrl ?? "",
  };
}

export function StoreEditorPage({
  mode,
  store,
  stores,
}: StoreEditorPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusState>(null);
  const [submittingStore, setSubmittingStore] = useState(false);
  const [storeForm, setStoreForm] = useState<StoreFormValues>(() =>
    getStoreFormValues(store),
  );

  const isEditing = mode === "edit";
  const previewThemeColor = normalizeThemeColor(storeForm.themeColor);
  const previewSlug = slugify(storeForm.slug || storeForm.name);
  const previewUrl = previewSlug
    ? `${MARKETPLACE_URL}/store/${previewSlug}`
    : undefined;
  const previewSocialLinks = useMemo(
    () => getStoreSocialLinks(storeForm),
    [storeForm],
  );

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
        previousSlug: store?.slug,
        slug: storeForm.slug,
        storeId: store?._id,
        tiktokUrl: storeForm.tiktokUrl || undefined,
        themeColor: storeForm.themeColor,
        websiteUrl: storeForm.websiteUrl || undefined,
        xUrl: storeForm.xUrl || undefined,
      });

      setStatus({
        kind: result.success ? "success" : "error",
        message: result.message,
      });

      if (!result.success) {
        return;
      }

      const nextStoreId = result.storeId ?? store?._id;

      if (nextStoreId) {
        router.push(`/dashboard/stores/${nextStoreId}`);
        router.refresh();
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setSubmittingStore(false);
    }
  }

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <StoreRouteSidebar activeStoreId={store?._id} stores={stores} />

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  {isEditing ? "Edit storefront" : "New storefront"}
                </p>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
                  {isEditing && store
                    ? `Update ${store.name}`
                    : "Create another store without leaving your current one behind"}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                  Keep creation, editing, and store details on separate pages so
                  each workflow has its own dedicated space.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {store ? (
                  <Link
                    href={`/dashboard/stores/${store._id}`}
                    className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                  >
                    View details
                  </Link>
                ) : null}
                <Link
                  href={store ? `/dashboard?store=${store._id}` : "/dashboard"}
                  className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                >
                  Back to dashboard
                </Link>
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Preview live store
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          {status ? (
            <div
              className={`rounded-2xl border px-5 py-4 text-sm shadow-sm ${
                status.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <form onSubmit={handleStoreSubmit}>
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      Store editor
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {isEditing && store
                        ? `Editing ${store.name}`
                        : "Create a new storefront"}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                      Update the store profile, branding, social links, and
                      layout from a dedicated page.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-5">
                  <Field label="Store name">
                    <TextInput
                      onChange={(event) =>
                        setStoreForm((current) => ({
                          ...current,
                          name: event.target.value,
                          slug: current.slug
                            ? current.slug
                            : isEditing
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
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
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
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
                        <input
                          className="w-full border-0 bg-transparent text-sm text-slate-950 outline-none"
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

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submittingStore}
                    className="inline-flex rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingStore
                      ? "Saving..."
                      : isEditing
                        ? "Update storefront"
                        : "Create storefront"}
                  </button>
                  <Link
                    href={store ? `/dashboard/stores/${store._id}` : "/dashboard"}
                    className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                  >
                    Cancel
                  </Link>
                </div>
              </section>
            </form>

            <div className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Live preview
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Storefront preview
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  See how the current branding and content will feel before you
                  publish changes.
                </p>

                <div className="mt-6">
                  <StoreBanner
                    bannerImage={storeForm.bannerImage || undefined}
                    description={
                      storeForm.description ||
                      "Your store description preview will appear here."
                    }
                    logoImage={storeForm.logoImage || undefined}
                    name={storeForm.name || "Untitled Store"}
                    themeColor={previewThemeColor}
                    variant="compact"
                  />
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Preview details
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  What buyers will notice
                </h2>

                <dl className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Slug
                    </dt>
                    <dd className="mt-3 break-all text-sm font-medium text-slate-950">
                      {previewSlug || "Generated from the store name"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Layout
                    </dt>
                    <dd className="mt-3 text-sm font-medium text-slate-950">
                      {storeForm.layoutType === "grid"
                        ? "Grid storefront"
                        : "List storefront"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Social links
                    </dt>
                    <dd className="mt-3 text-sm text-slate-950">
                      {previewSocialLinks.length > 0 ? (
                        <ul className="space-y-2">
                          {previewSocialLinks.map((link) => (
                            <li key={link.label}>
                              <span className="font-medium">{link.label}:</span>{" "}
                              {link.url}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No social links yet."
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
