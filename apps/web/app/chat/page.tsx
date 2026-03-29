import { ChatPageShell } from "@/components/chat-page-shell";
import { requireWebUser } from "@/lib/current-user";

type ChatPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildCallbackPath(
  params: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    }
  }

  const serialized = query.toString();

  return serialized ? `/chat?${serialized}` : "/chat";
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const resolvedSearchParams = await searchParams;

  await requireWebUser(buildCallbackPath(resolvedSearchParams));

  return <ChatPageShell />;
}
