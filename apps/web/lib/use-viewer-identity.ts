"use client";

import { useEffect, useState } from "react";

import { useViewerId } from "./use-viewer-id";

const VIEWER_NAME_STORAGE_KEY = "vendorly:viewer-name";

export function useViewerIdentity() {
  const viewerId = useViewerId();
  const [viewerName, setViewerName] = useState("");

  useEffect(() => {
    if (!viewerId) {
      return;
    }

    const savedName = window.localStorage.getItem(VIEWER_NAME_STORAGE_KEY);

    if (savedName) {
      setViewerName(savedName);
      return;
    }

    const nextName = `Guest ${viewerId.slice(0, 4)}`;
    window.localStorage.setItem(VIEWER_NAME_STORAGE_KEY, nextName);
    setViewerName(nextName);
  }, [viewerId]);

  function updateViewerName(nextName: string) {
    setViewerName(nextName);
    window.localStorage.setItem(VIEWER_NAME_STORAGE_KEY, nextName);
  }

  return {
    viewerId,
    viewerName,
    setViewerName: updateViewerName,
  };
}
