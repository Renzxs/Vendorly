"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, useTransition } from "react";
import { getInitials } from "@vendorly/utils";
import { useSession } from "next-auth/react";

import { createFeedPostAction } from "@/app/actions/buyer";

const MAX_POST_LENGTH = 280;

export function FeedPostComposer() {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const viewerName =
    session?.user?.name ?? session?.user?.email ?? "Vendorly shopper";

  function handleSubmit() {
    const nextBody = body.trim();

    if (!session?.user?.id || !nextBody) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createFeedPostAction({
        body: nextBody,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setBody("");
    });
  }

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        {session?.user?.image ? (
          <img
            alt={viewerName}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
            src={session.user.image}
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
            {getInitials(viewerName || "V")}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Share something with the feed
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Post what you are shopping for, what store caught your eye, or a
                quick product recommendation.
              </p>
            </div>
            {session?.user?.id ? (
              <span className="text-xs font-medium text-slate-500">
                {body.length}/{MAX_POST_LENGTH}
              </span>
            ) : null}
          </div>

          {session?.user?.id ? (
            <>
              <textarea
                className="mt-4 min-h-28 w-full resize-none rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                maxLength={MAX_POST_LENGTH}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What should shoppers and sellers know today?"
                value={body}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Your post shows up at the top of the community updates section.
                </p>
                <button
                  type="button"
                  disabled={isPending || !body.trim()}
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isPending ? "Posting..." : "Post update"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                Sign in to post to the feed, react to drops, and message sellers.
              </p>
              <Link
                href="/login?callbackUrl=/feed"
                className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in to post
              </Link>
            </div>
          )}

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
