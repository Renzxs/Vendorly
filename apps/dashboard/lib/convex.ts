export function getConvexUrl() {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL in apps/dashboard/.env.local.",
    );
  }

  return url;
}

export function getConvexServerOptions() {
  return {
    url: getConvexUrl(),
  };
}
