"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { api } from "@vendorly/convex";
import type { ChatMessage } from "@vendorly/utils";

import { sendViewerStoreMessageAction } from "@/app/actions/buyer";
import { getActionErrorMessage } from "@/lib/action-errors";

function getSearchParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key);

  return value && value.length > 0 ? value : undefined;
}

const chatTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function formatChatTime(value?: number) {
  if (!value) {
    return "";
  }

  return chatTimeFormatter.format(value);
}

export function ChatPageShell() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const viewerId = session?.user?.id;
  const viewerName = session?.user?.name ?? session?.user?.email ?? undefined;
  const viewerInitial = (viewerName ?? "You").slice(0, 1).toUpperCase();
  const storeId = getSearchParam(searchParams, "storeId");
  const storeName = getSearchParam(searchParams, "storeName");
  const storeSlug = getSearchParam(searchParams, "storeSlug");
  const productId = getSearchParam(searchParams, "productId");
  const productTitle = getSearchParam(searchParams, "productTitle");
  const storeInitial = (storeName ?? "Seller").slice(0, 1).toUpperCase();
  const threadRef = useRef<HTMLDivElement | null>(null);

  const messages = useQuery(
    api.chat.getViewerStoreMessages,
    storeId && viewerId
      ? {
          storeId,
          viewerId,
        }
      : "skip",
  ) as ChatMessage[] | undefined;

  useEffect(() => {
    if (!threadRef.current) {
      return;
    }

    threadRef.current.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages?.length]);

  async function handleSendMessage() {
    if (!viewerId || !storeId || !body.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await sendViewerStoreMessageAction({
        body,
        productId,
        productTitle,
        storeId,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setBody("");
    } catch (messageError) {
      setError(getActionErrorMessage(messageError, "Unable to send message."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Store chat
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
            {storeName ?? "Chat with a store"}
          </h1>
          {viewerName ? (
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Signed in as{" "}
              <span className="font-medium text-slate-950">{viewerName}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {storeSlug ? (
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              View storefront
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
          >
            Back to marketplace
          </Link>
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Conversation
              </p>
              {productTitle ? (
                <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                  Asking about{" "}
                  <span className="ml-1 font-medium text-slate-950">
                    {productTitle}
                  </span>
                </p>
              ) : null}
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              {messages?.length ?? 0} message
              {(messages?.length ?? 0) === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:p-5">
            {!storeId ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
                  Choose a store to chat with
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Start a conversation from any product card or storefront page.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div
                    ref={threadRef}
                    className="flex min-h-[14rem] max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1"
                  >
                    {messages === undefined ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                      ))
                    ) : messages.length > 0 ? (
                      messages.map((message) => {
                        const isBuyer = message.senderType === "buyer";

                        return (
                          <div
                            key={message._id}
                            className={`flex ${isBuyer ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex max-w-[82%] flex-col gap-1.5 ${
                                isBuyer ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
                                  isBuyer ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {!isBuyer ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[0.65rem] text-slate-700">
                                    {storeInitial}
                                  </span>
                                ) : null}
                                <span>{isBuyer ? "You" : storeName ?? "Seller"}</span>
                                {formatChatTime(message._creationTime) ? (
                                  <span className="normal-case tracking-normal text-slate-400">
                                    {formatChatTime(message._creationTime)}
                                  </span>
                                ) : null}
                                {isBuyer ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[0.65rem] text-slate-700">
                                    {viewerInitial}
                                  </span>
                                ) : null}
                              </div>

                              <div
                                className={`rounded-[1.35rem] border px-4 py-3 text-sm leading-6 shadow-sm ${
                                  isBuyer
                                    ? "border-slate-950 bg-slate-950 text-white"
                                    : "border-slate-200 bg-white text-slate-700"
                                }`}
                              >
                                {message.productTitle ? (
                                  <p
                                    className={`mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
                                      isBuyer ? "text-white/70" : "text-slate-400"
                                    }`}
                                  >
                                    {message.productTitle}
                                  </p>
                                ) : null}
                                <p>{message.body}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex min-h-[14rem] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-7 text-center">
                        <div>
                          <p className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
                            Start the conversation
                          </p>
                          <p className="mt-4 text-sm leading-7 text-slate-600">
                            Ask this store about products, shipping,
                            customization, or anything else before you buy.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Message
                    </span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Ask about sizing, materials, shipping, or a specific product."
                      value={body}
                    />
                  </label>
                  {error ? (
                    <p className="mt-3 text-sm text-rose-600">{error}</p>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Keep it specific so the seller can reply faster.
                    </p>
                    <button
                      type="button"
                      disabled={isSending || !body.trim()}
                      onClick={handleSendMessage}
                      className="inline-flex min-w-40 justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSending ? "Sending..." : "Send message"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Conversation details
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Store
              </p>
              <p className="mt-2 font-medium text-slate-950">
                {storeName ?? "Not selected"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Product
              </p>
              <p className="mt-2 font-medium text-slate-950">
                {productTitle ?? "General store question"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Notes
              </p>
              <p className="mt-2 leading-6">
                Keep your questions specific so the seller can answer faster.
                Shipping, customization, and stock questions usually work best
                here.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
