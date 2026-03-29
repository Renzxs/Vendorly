"use client";

import { useEffect, useState } from "react";

const VIEWER_STORAGE_KEY = "vendorly:viewer";

export function useViewerId() {
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const existingViewerId = window.localStorage.getItem(VIEWER_STORAGE_KEY);

    if (existingViewerId) {
      setViewerId(existingViewerId);
      return;
    }

    const nextViewerId = crypto.randomUUID();
    window.localStorage.setItem(VIEWER_STORAGE_KEY, nextViewerId);
    setViewerId(nextViewerId);
  }, []);

  return viewerId;
}
