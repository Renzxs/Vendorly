"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import type { FeedPost, MarketplaceProduct } from "@vendorly/utils";

import { FeedPostCard } from "./feed-post-card";
import { FeedPostComposer } from "./feed-post-composer";
import { ProductSocialCard } from "./product-social-card";
import { useViewerId } from "@/lib/use-viewer-id";

const INITIAL_FEED_BATCH = 4;
const LOAD_MORE_BATCH = 4;

function SectionShell({
  description,
  title,
  children,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SidebarCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function FeedPostsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function ProductFeedLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function EmptyCard({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export function ProductFeedShell() {
  const viewerId = useViewerId();
  const loadMoreAnchorRef = useRef<HTMLDivElement | null>(null);
  const recentPosts = useQuery(api.feed.getRecentFeedPosts, {
    limit: 4,
  }) as FeedPost[] | undefined;
  const { loadMore, results, status } = usePaginatedQuery(
    api.feed.getPaginatedProductFeed,
    {
      viewerId: viewerId ?? undefined,
    },
    {
      initialNumItems: INITIAL_FEED_BATCH,
    },
  );
  const products = results as MarketplaceProduct[];
  const followedDropsLoaded = products.filter(
    (product) => product.fromFollowedStore,
  ).length;

  useEffect(() => {
    if (
      status !== "CanLoadMore" ||
      !loadMoreAnchorRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore(LOAD_MORE_BATCH);
        }
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(loadMoreAnchorRef.current);

    return () => observer.disconnect();
  }, [loadMore, status]);

  return (
    <main className="mx-auto mt-4 max-w-[86rem] rounded-[2rem] bg-[#f3f5f8] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#eef4ff_45%,#f8fafc_100%)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Vendorly feed
                </p>
                <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
                  A cleaner social feed for product drops and shopper updates.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Browse store launches in a denser Facebook-style feed, post
                  quick updates, and keep scrolling to automatically load the
                  next batch of products.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Products loaded
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {products.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Followed drops loaded
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {followedDropsLoaded}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Community posts
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {recentPosts?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <FeedPostComposer />

          <SectionShell
            title="Community updates"
            description="Quick posts from shoppers keep the feed feeling active without overwhelming the product drops."
          >
            {recentPosts === undefined ? (
              <FeedPostsLoading />
            ) : recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <FeedPostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No posts yet"
                body="Be the first shopper to kick off the conversation in the feed."
              />
            )}
          </SectionShell>

          <SectionShell
            title="Fresh product drops"
            description="Products stay compact, actions are tighter, and the next set loads automatically as you reach the bottom."
          >
            {status === "LoadingFirstPage" ? (
              <ProductFeedLoading />
            ) : products.length > 0 ? (
              <>
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductSocialCard
                      key={product._id}
                      product={product}
                      variant="feed"
                      viewerId={viewerId}
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <div
                    ref={loadMoreAnchorRef}
                    className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm text-slate-500 shadow-sm"
                  >
                    {status === "LoadingMore" ? (
                      "Loading more products..."
                    ) : status === "CanLoadMore" ? (
                      "Scroll a little more to load the next batch."
                    ) : (
                      "You are all caught up for now."
                    )}
                  </div>

                  {status === "CanLoadMore" ? (
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => loadMore(LOAD_MORE_BATCH)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
                      >
                        Load more products
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <EmptyCard
                title="No products in the feed yet"
                body="Once sellers publish products, they will show up here automatically."
              />
            )}
          </SectionShell>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <SidebarCard title="Feed rhythm">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                The feed now behaves more like a social timeline instead of a
                storefront list.
              </p>
              <p>
                Posts stay at the top, product cards are denser, and the next
                batch of drops appears as you scroll.
              </p>
            </div>
          </SidebarCard>

          <SidebarCard title="Quick tips">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Use posts to ask for recommendations or call out a great find.</p>
              <p>
                Reactions, cart actions, and seller chat still live right on
                each product card.
              </p>
              <p>
                Tap through to a product page whenever you need the full detail
                view.
              </p>
            </div>
          </SidebarCard>

          {viewerId ? (
            <SidebarCard title="Signed in">
              <p className="text-sm leading-6 text-slate-600">
                You can post to the feed, react to new drops, add products to
                cart, and chat with sellers from here.
              </p>
            </SidebarCard>
          ) : (
            <SidebarCard title="Join the feed">
              <p className="text-sm leading-6 text-slate-600">
                Sign in if you want to publish posts, react, and message
                sellers directly from the feed.
              </p>
              <Link
                href="/login?callbackUrl=/feed"
                className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </Link>
            </SidebarCard>
          )}
        </aside>
      </div>
    </main>
  );
}
