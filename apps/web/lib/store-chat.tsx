"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type OpenStoreChatInput = {
  productId?: string;
  productTitle?: string;
  storeId: string;
  storeName: string;
  storeSlug?: string;
  themeColor?: string;
};

type StoreChatContextValue = {
  openChat: (input: OpenStoreChatInput) => void;
};

const StoreChatContext = createContext<StoreChatContextValue | null>(null);

function buildChatPath(input: OpenStoreChatInput) {
  const searchParams = new URLSearchParams({
    storeId: input.storeId,
    storeName: input.storeName,
  });

  if (input.productId) {
    searchParams.set("productId", input.productId);
  }

  if (input.productTitle) {
    searchParams.set("productTitle", input.productTitle);
  }

  if (input.storeSlug) {
    searchParams.set("storeSlug", input.storeSlug);
  }

  if (input.themeColor) {
    searchParams.set("themeColor", input.themeColor);
  }

  return `/chat?${searchParams.toString()}`;
}

export function StoreChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const authUserId = session?.user?.id;

  const value = useMemo<StoreChatContextValue>(
    () => ({
      openChat(input) {
        if (status === "loading") {
          return;
        }

        const destination = buildChatPath(input);

        if (!authUserId) {
          router.push(`/login?callbackUrl=${encodeURIComponent(destination)}`);
          return;
        }

        router.push(destination);
      },
    }),
    [authUserId, router, status],
  );

  return (
    <StoreChatContext.Provider value={value}>
      {children}
    </StoreChatContext.Provider>
  );
}

export function useStoreChat() {
  const context = useContext(StoreChatContext);

  if (!context) {
    throw new Error("useStoreChat must be used within a StoreChatProvider.");
  }

  return context;
}
