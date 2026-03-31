"use client";

import { useSession } from "next-auth/react";

export function useViewerId() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  return session?.user?.id ?? null;
}
