const NEXT_SERVER_RENDER_ERROR =
  "An error occurred in the Server Components render";

export function getActionErrorMessage(value: unknown, fallback: string) {
  const message =
    typeof value === "string"
      ? value.trim()
      : value instanceof Error
        ? value.message.trim()
        : "";

  if (!message || message.includes(NEXT_SERVER_RENDER_ERROR)) {
    return fallback;
  }

  return message;
}
