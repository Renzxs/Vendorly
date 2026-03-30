import { authProviderAvailability } from "@/auth";
import { OAuthAutoSubmitForm } from "@/components/oauth-auto-submit-form";
import { signInWithGitHubAction } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

type OAuthStartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/dashboard";
  }

  return value;
}

export default async function DashboardGitHubStartPage({
  searchParams,
}: OAuthStartPageProps) {
  if (!authProviderAvailability.github) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  return (
    <OAuthAutoSubmitForm
      action={signInWithGitHubAction}
      callbackUrl={getCallbackUrl(resolvedSearchParams.callbackUrl)}
      providerLabel="GitHub"
    />
  );
}
