"use client";
/* eslint-disable @next/next/no-img-element */

import {
  formatRelativeTime,
  getInitials,
  type FeedPost,
} from "@vendorly/utils";

export function FeedPostCard({ post }: { post: FeedPost }) {
  const viewerName = post.viewerName || "Vendorly shopper";

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
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
            <p className="text-sm font-semibold text-slate-950">{viewerName}</p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Community post
            </span>
            {formatRelativeTime(post._creationTime) ? (
              <span className="text-xs text-slate-500">
                {formatRelativeTime(post._creationTime)}
              </span>
            ) : null}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {post.body}
          </p>
        </div>
      </div>
    </article>
  );
}
