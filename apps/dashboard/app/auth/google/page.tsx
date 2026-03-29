import { redirect } from "next/navigation";

import { authProviderAvailability, signIn } from "@/auth";

type OAuthStartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/dashboard";
  }

  return value;
}

export default async function DashboardGoogleStartPage({
  searchParams,
}: OAuthStartPageProps) {
  if (!authProviderAvailability.google) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  await signIn("google", {
    redirectTo: getCallbackUrl(resolvedSearchParams.callbackUrl),
  });
}
