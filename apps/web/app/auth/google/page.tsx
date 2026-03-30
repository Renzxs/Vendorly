import { redirect } from "next/navigation";

import { authProviderAvailability } from "@/auth";
import { OAuthAutoSubmitForm } from "@/components/oauth-auto-submit-form";
import { signInWithGoogleAction } from "@/lib/auth-actions";

type OAuthStartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/";
  }

  return value;
}

export default async function WebGoogleStartPage({
  searchParams,
}: OAuthStartPageProps) {
  if (!authProviderAvailability.google) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  return (
    <OAuthAutoSubmitForm
      action={signInWithGoogleAction}
      callbackUrl={getCallbackUrl(resolvedSearchParams.callbackUrl)}
      providerLabel="Google"
    />
  );
}
