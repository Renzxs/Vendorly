"use client";
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { StoreCard } from "@vendorly/ui";
import {
  formatRelativeTime,
  getInitials,
  type PublicUserProfile,
  type Store,
} from "@vendorly/utils";

import { FeedPostCard } from "./feed-post-card";
import { ProductSocialCard } from "./product-social-card";
import { buildSellerDashboardChatHref } from "@/lib/seller-chat";
import { useViewerId } from "@/lib/use-viewer-id";

function Section({
  body,
  children,
  title,
}: {
  body: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      </div>
      {children}
    </section>
  );
}

function LoadingCard({ className }: { className: string }) {
  return (
    <div
      className={`${className} animate-pulse rounded-[1.75rem] border border-slate-200 bg-white`}
    />
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export function UserProfileShell({ userId }: { userId: string }) {
  const viewerId = useViewerId();
  const profile = useQuery(api.users.getPublicProfile, {
    userId,
    viewerId: viewerId ?? undefined,
  }) as PublicUserProfile | null | undefined;
  const ownedStores = useQuery(
    api.stores.getStoresByOwner,
    viewerId
      ? {
          ownerId: viewerId,
        }
      : "skip",
  ) as Store[] | undefined;
  const primaryOwnedStore = ownedStores?.[0];

  if (profile === undefined) {
    return (
      <main className="mx-auto max-w-[86rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-5">
          <LoadingCard className="h-56" />
          <LoadingCard className="h-44" />
          <LoadingCard className="h-72" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="User not found"
          body="That profile is not available right now."
        />
      </main>
    );
  }

  const displayName = profile.user.name || "Vendorly shopper";
  const sellerChatHref =
    primaryOwnedStore && profile.user.authUserId !== viewerId
      ? buildSellerDashboardChatHref(
          primaryOwnedStore._id,
          profile.user.authUserId,
        )
      : undefined;

  return (
    <main className="mx-auto max-w-[86rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#eef2ff_48%,#f8fafc_100%)] p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex items-start gap-4">
            {profile.user.image ? (
              <img
                alt={displayName}
                className="h-20 w-20 rounded-[1.75rem] border border-slate-200 object-cover"
                src={profile.user.image}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white text-xl font-semibold text-slate-700">
                {getInitials(displayName || "V")}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                User profile
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Browse this user&apos;s recent posts, storefronts, and products
                shared across Vendorly.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>Vendorly community member</span>
                {formatRelativeTime(profile.user._creationTime) ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>
                      Joined {formatRelativeTime(profile.user._creationTime)}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Posts
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {profile.posts.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Stores
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {profile.stores.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Products
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {profile.products.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
          >
            Back to feed
          </Link>
          {sellerChatHref ? (
            <a
              href={sellerChatHref}
              className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
            >
              Chat buyer from seller dashboard
            </a>
          ) : null}
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <Section
          title="Recent posts"
          body="Community posts from this user stay interactive here too, including reactions and seller chat shortcuts."
        >
          {profile.posts.length > 0 ? (
            <div className="space-y-4">
              {profile.posts.map((post) => (
                <FeedPostCard
                  key={post._id}
                  post={post}
                  sellerChatHref={sellerChatHref}
                  viewerId={viewerId}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No posts yet"
              body="This user has not shared any community updates yet."
            />
          )}
        </Section>

        <Section
          title="Stores"
          body="If this user is also a seller, their storefronts show up here."
        >
          {profile.stores.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profile.stores.map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No storefronts"
              body="This user does not have any storefronts published right now."
            />
          )}
        </Section>

        <Section
          title="Products"
          body="Recent products from the stores tied to this profile."
        >
          {profile.products.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {profile.products.map((product) => (
                <ProductSocialCard
                  key={product._id}
                  layout="grid"
                  product={product}
                  viewerId={viewerId}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products yet"
              body="Once this user lists products in a store, they will appear here."
            />
          )}
        </Section>
      </div>
    </main>
  );
}
