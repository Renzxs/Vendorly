import { redirect } from "next/navigation";

import { auth } from "@/auth";

export type AuthenticatedWebUser = {
  email: string;
  id: string;
  image?: string;
  name?: string;
};

export async function requireWebUser(callbackPath: string) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return {
    email: session.user.email,
    id: session.user.id,
    image: session.user.image ?? undefined,
    name: session.user.name ?? undefined,
  } satisfies AuthenticatedWebUser;
}
