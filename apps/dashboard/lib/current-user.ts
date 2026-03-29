import { redirect } from "next/navigation";

import { auth } from "@/auth";

export type AuthenticatedDashboardUser = {
  email: string;
  id: string;
  image?: string;
  name?: string;
};

export async function requireDashboardUser() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  return {
    email: session.user.email,
    id: session.user.id,
    image: session.user.image ?? undefined,
    name: session.user.name ?? undefined,
  } satisfies AuthenticatedDashboardUser;
}

