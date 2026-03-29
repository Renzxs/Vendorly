"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { VendorlyConvexProvider } from "@vendorly/convex";

import { CartProvider } from "@/lib/cart";
import { StoreChatProvider } from "@/lib/store-chat";

type ProvidersProps = {
  children: ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <VendorlyConvexProvider>
        <CartProvider>
          <StoreChatProvider>{children}</StoreChatProvider>
        </CartProvider>
      </VendorlyConvexProvider>
    </SessionProvider>
  );
}
