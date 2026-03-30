"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { api } from "@vendorly/convex";
import type { ChatMessage } from "@vendorly/utils";

function getSearchParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key);

  return value && value.length > 0 ? value : undefined;
}

export function ChatPageShell() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sendMessage = useMutation(api.chat.sendViewerStoreMessage);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const viewerId = session?.user?.id;
  const viewerName = session?.user?.name ?? session?.user?.email ?? undefined;
  const storeId = getSearchParam(searchParams, "storeId");
  const storeName = getSearchParam(searchParams, "storeName");
  const storeSlug = getSearchParam(searchParams, "storeSlug");
  const productId = getSearchParam(searchParams, "productId");
  const productTitle = getSearchParam(searchParams, "productTitle");

  const messages = useQuery(
    api.chat.getViewerStoreMessages,
    storeId && viewerId
      ? {
          storeId,
          viewerId,
        }
      : "skip",
  ) as ChatMessage[] | undefined;

  async function handleSendMessage() {
    if (!viewerId || !storeId || !body.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendMessage({
        body,
        productId,
        productTitle,
        storeId,
        viewerId,
        viewerName,
      });
      setBody("");
    } catch (messageError) {
      setError(
        messageError instanceof Error
          ? messageError.message
          : "Unable to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Store chat
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
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

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Conversation
            </p>
            {productTitle ? (
              <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Asking about{" "}
                <span className="ml-1 font-medium text-slate-950">
                  {productTitle}
                </span>
              </p>
            ) : null}
          </div>

          <div className="px-6 py-6 sm:px-8">
            {!storeId ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                  Choose a store to chat with
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Start a conversation from any product card or storefront page.
                </p>
              </div>
            ) : (
              <>
                <div className="min-h-[24rem] rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  {messages === undefined ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`max-w-[88%] rounded-3xl border px-4 py-3 text-sm leading-7 ${
                            message.senderType === "buyer"
                              ? "ml-auto border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {message.productTitle ? (
                            <p
                              className={`mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                                message.senderType === "buyer"
                                  ? "text-white/70"
                                  : "text-slate-400"
                              }`}
                            >
                              {message.productTitle}
                            </p>
                          ) : null}
                          <p>{message.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                      <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                        Start the conversation
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        Ask this store about products, shipping, customization,
                        or anything else before you buy.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Message
                    </span>
                    <textarea
                      className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Ask about sizing, materials, shipping, or a specific product."
                      value={body}
                    />
                  </label>
                  {error ? (
                    <p className="mt-3 text-sm text-rose-600">{error}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={isSending || !body.trim()}
                    onClick={handleSendMessage}
                    className="mt-4 inline-flex w-full justify-center rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Sending..." : "Send message"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Conversation details
          </p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
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
