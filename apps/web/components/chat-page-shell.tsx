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
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="border border-black/10 bg-[rgba(255,253,247,0.92)]">
        <div className="border-b border-black/10 px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                Store chat
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
                {storeName ?? "Chat"}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {storeSlug ? (
                <Link
                  href={`/store/${storeSlug}`}
                  className="inline-flex border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
                >
                  View storefront
                </Link>
              ) : null}
              <Link
                href="/"
                className="inline-flex border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
              >
                Back to marketplace
              </Link>
            </div>
          </div>
          {productTitle ? (
            <p className="mt-4 border border-black/10 bg-white px-3 py-2 text-sm text-slate-600">
              Asking about: <span className="font-medium text-slate-950">{productTitle}</span>
            </p>
          ) : null}
          {viewerName ? (
            <p className="mt-4 text-sm text-slate-600">
              Signed in as <span className="font-medium text-slate-950">{viewerName}</span>
            </p>
          ) : null}
        </div>

        <div className="p-6 sm:p-8">
          {!storeId ? (
            <div className="border border-dashed border-slate-400 bg-white p-10 text-center">
              <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                Choose a store to chat with
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                Start a conversation from any product card or storefront page.
              </p>
            </div>
          ) : (
            <>
              <div className="min-h-[20rem] border border-black/10 bg-white p-5 sm:p-6">
                {messages === undefined ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-20 animate-pulse border border-black/10 bg-[rgba(255,253,247,0.84)]"
                      />
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`max-w-[88%] border px-4 py-3 text-sm leading-7 ${
                          message.senderType === "buyer"
                            ? "ml-auto border-slate-950 bg-slate-950 text-white"
                            : "border-black/10 bg-[rgba(255,253,247,0.92)] text-slate-700"
                        }`}
                      >
                        {message.productTitle ? (
                          <p
                            className={`mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${
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
                  <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.86)] p-8 text-center">
                    <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                      Start the conversation
                    </p>
                    <p className="mt-4 text-sm leading-8 text-slate-600">
                      Ask this store about products, shipping, customization, or anything else before you buy.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 border border-black/10 bg-white p-5 sm:p-6">
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Message
                  </span>
                  <textarea
                    className="min-h-32 w-full border border-black/10 bg-[rgba(255,253,247,0.92)] px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Ask about sizing, materials, shipping, or a specific product."
                    value={body}
                  />
                </label>
                {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
                <button
                  type="button"
                  disabled={isSending || !body.trim()}
                  onClick={handleSendMessage}
                  className="mt-4 inline-flex w-full justify-center border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? "Sending..." : "Send message"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
