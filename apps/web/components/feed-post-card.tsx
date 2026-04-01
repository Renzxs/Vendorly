"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  PRODUCT_REACTION_OPTIONS,
  cn,
  formatRelativeTime,
  getInitials,
  getTotalReactionCount,
  type FeedPost,
  type ProductReaction,
} from "@vendorly/utils";

import { toggleFeedPostReactionAction } from "@/app/actions/buyer";
import { getActionErrorMessage } from "@/lib/action-errors";

type FeedPostCardProps = {
  post: FeedPost;
  sellerChatHref?: string;
  viewerId?: string | null;
};

export function FeedPostCard({
  post,
  sellerChatHref,
  viewerId,
}: FeedPostCardProps) {
  const viewerName = post.viewerName || "Vendorly shopper";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canReact = Boolean(viewerId);
  const totalReactions =
    post.reactionCount ?? getTotalReactionCount(post.reactionCounts);
  const profileHref = `/user/${encodeURIComponent(post.viewerId)}`;

  function handleReaction(reaction: ProductReaction) {
    if (!canReact) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await toggleFeedPostReactionAction({
          postId: post._id,
          reaction,
        });

        if (!result.success) {
          setError(result.message);
        }
      } catch (mutationError) {
        setError(
          getActionErrorMessage(mutationError, "Unable to save your reaction."),
        );
      }
    });
  }

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <Link href={profileHref} className="flex min-w-0 items-start gap-3">
          {post.viewerImage ? (
            <img
              alt={viewerName}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              src={post.viewerImage}
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
              {getInitials(viewerName || "V")}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-950 transition hover:text-slate-700">
                {viewerName}
              </p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Community post
              </span>
              {formatRelativeTime(post._creationTime) ? (
                <span className="text-xs text-slate-500">
                  {formatRelativeTime(post._creationTime)}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {post.body}
      </p>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{totalReactions}</span>{" "}
            reaction{totalReactions === 1 ? "" : "s"} on this post
            {!canReact ? " • sign in to react" : ""}
          </div>

          <div className="flex flex-wrap gap-2">
            {sellerChatHref ? (
              <a
                href={sellerChatHref}
                className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
              >
                Chat buyer
              </a>
            ) : null}

            {PRODUCT_REACTION_OPTIONS.map((option) => {
              const active = post.viewerReaction === option.value;
              const count = post.reactionCounts?.[option.value] ?? 0;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isPending || !canReact}
                  onClick={() => handleReaction(option.value)}
                  className={cn(
                    "inline-flex min-w-[4.1rem] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                    (isPending || !canReact) && "cursor-not-allowed opacity-60",
                  )}
                  aria-label={`${option.label} reaction`}
                >
                  <span aria-hidden="true" className="text-sm leading-none">
                    {option.emoji}
                  </span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>
    </article>
  );
}
