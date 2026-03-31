"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAction } from "convex/react";

import { api } from "@vendorly/convex";

import { getActionErrorMessage } from "@/lib/action-errors";

type AssistantRole = "assistant" | "user";

type AssistantMessage = {
  content: string;
  id: string;
  role: AssistantRole;
  tone?: "welcome";
};

type StoreAiAssistantProps = {
  productId?: string;
  productTitle?: string;
  storeDescription?: string;
  storeId: string;
  storeName: string;
  themeColor?: string;
};

const MAX_HISTORY_MESSAGES = 8;

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildWelcomeMessage({
  productTitle,
  storeDescription,
  storeName,
}: StoreAiAssistantProps) {
  if (productTitle) {
    return `Ask me about ${productTitle}, how it fits into ${storeName}'s catalog, or what makes this product stand out.`;
  }

  if (storeDescription?.trim()) {
    const shortDescription =
      storeDescription.trim().length > 120
        ? `${storeDescription.trim().slice(0, 117).trimEnd()}...`
        : storeDescription.trim();

    return `Ask me about ${storeName}, the products in this store, or what shoppers should look at first. ${shortDescription}`;
  }

  return `Ask me about ${storeName}, its product lineup, pricing, or which item looks like the best fit for what you need.`;
}

function buildQuickQuestions({
  productTitle,
  storeName,
}: StoreAiAssistantProps) {
  if (productTitle) {
    return [
      `What should I know about ${productTitle}?`,
      `Who is ${productTitle} best for?`,
      `How does ${productTitle} compare to other products from ${storeName}?`,
      `What else from ${storeName} should I look at with this product?`,
    ];
  }

  return [
    `What kind of products does ${storeName} sell?`,
    `What makes ${storeName} stand out?`,
    `Which products should I look at first?`,
    `Is there a good starting product from ${storeName}?`,
  ];
}

function AssistantSparkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3.5l1.65 4.35L18 9.5l-4.35 1.65L12 15.5l-1.65-4.35L6 9.5l4.35-1.65L12 3.5z"
        fill="currentColor"
      />
      <path
        d="M18.5 14l.95 2.55L22 17.5l-2.55.95L18.5 21l-.95-2.55L15 17.5l2.55-.95L18.5 14zM6 15.5l.68 1.82L8.5 18l-1.82.68L6 20.5l-.68-1.82L3.5 18l1.82-.68L6 15.5z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function AssistantSendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 12.5L19 5l-3 14-4.8-4-4.2 2 1.5-5.3L4 12.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StoreAiAssistant(props: StoreAiAssistantProps) {
  const askStoreAssistant = useAction(api.assistant.askStoreAssistant);
  const welcomeMessage = useMemo(
    () => buildWelcomeMessage(props),
    [props.productTitle, props.storeDescription, props.storeName],
  );
  const quickQuestions = useMemo(
    () => buildQuickQuestions(props),
    [props.productTitle, props.storeName],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      content: welcomeMessage,
      id: "assistant-welcome",
      role: "assistant",
      tone: "welcome",
    },
  ]);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        content: welcomeMessage,
        id: "assistant-welcome",
        role: "assistant",
        tone: "welcome",
      },
    ]);
    setDraft("");
    setError(null);
    setIsSending(false);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!threadRef.current || !isOpen) {
      return;
    }

    threadRef.current.scrollTo({
      behavior: "smooth",
      top: threadRef.current.scrollHeight,
    });
  }, [isOpen, isSending, messages.length]);

  async function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();

    if (!question || isSending) {
      return;
    }

    const history = messages
      .filter((message) => message.tone !== "welcome")
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        content: message.content,
        role: message.role,
      }));

    setIsOpen(true);
    setDraft("");
    setError(null);
    setIsSending(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        content: question,
        id: createMessageId("user"),
        role: "user",
      },
    ]);

    try {
      const result = await askStoreAssistant({
        messages: history,
        productId: props.productId,
        question,
        storeId: props.storeId,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content:
            result?.answer?.trim() ||
            "I couldn't find a grounded answer in the storefront data yet.",
          id: createMessageId("assistant"),
          role: "assistant",
        },
      ]);
    } catch (assistantError) {
      setError(
        getActionErrorMessage(
          assistantError,
          "The AI assistant couldn't answer right now.",
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendQuestion(draft);
    }
  }

  const assistantLabel = props.productTitle
    ? `Ask AI about ${props.productTitle}`
    : `Chat with ${props.storeName} AI`;
  const panelDescription = props.productTitle
    ? `Ask about ${props.productTitle}, how it compares to other products, or whether it's a good fit.`
    : `Ask about ${props.storeName}, the store's catalog, or where to start.`;

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-x-4 bottom-24 z-40 sm:inset-x-auto sm:right-4 sm:w-[25rem]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_90px_-32px_rgba(15,23,42,0.45)]">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: props.themeColor ?? "#10b981" }}
                    />
                    {props.productTitle ? "Product assistant" : "Store assistant"}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {props.productTitle
                      ? `Ask about ${props.productTitle}`
                      : `Ask ${props.storeName} AI`}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {panelDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                  aria-label="Close store assistant"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-5">
              <div
                ref={threadRef}
                className="flex max-h-[23rem] flex-col gap-3 overflow-y-auto pr-1"
              >
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-[1.45rem] border px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUser
                            ? "border-slate-950 bg-slate-950 text-white"
                            : message.tone === "welcome"
                              ? "border-slate-200 bg-slate-50 text-slate-700"
                              : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                })}

                {isSending ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-[1.45rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300 [animation-delay:240ms]" />
                    </div>
                  </div>
                ) : null}
              </div>

              {messages.length === 1 ? (
                <div className="grid gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={isSending}
                      onClick={() => void sendQuestion(question)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Ask a question
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-none rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={
                      props.productTitle
                        ? "Ask about features, fit, comparisons, or where this product fits in the catalog."
                        : "Ask about the store, featured products, price points, or where to start."
                    }
                    value={draft}
                  />
                </label>

                {error ? (
                  <p className="mt-3 text-sm text-rose-600">{error}</p>
                ) : null}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Powered by GitHub Models
                  </p>
                  <button
                    type="button"
                    disabled={isSending || !draft.trim()}
                    onClick={() => void sendQuestion(draft)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-950 bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Send question to the store assistant"
                  >
                    <AssistantSendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="fixed inset-x-4 bottom-4 z-40 inline-flex items-center justify-center gap-3 rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.88)] transition hover:bg-slate-800 sm:inset-x-auto sm:right-4"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950">
          <AssistantSparkIcon />
        </span>
        <span className="text-left">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/55">
            {props.productTitle ? "Product AI" : "Store AI"}
          </span>
          <span className="block text-sm font-medium">{assistantLabel}</span>
        </span>
      </button>
    </>
  );
}
