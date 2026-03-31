import { redirect } from "next/navigation";

import { auth, authProviderAvailability } from "@/auth";
import {
  signInWithGitHubAction,
  signInWithGoogleAction,
} from "@/lib/auth-actions";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/dashboard";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const callbackUrl = getCallbackUrl(resolvedSearchParams.callbackUrl);

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  const hasAnyProvider =
    authProviderAvailability.github || authProviderAvailability.google;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-0 border border-black/10 bg-[rgba(255,253,247,0.92)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border-b border-black/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-700">
            Vendorly authentication
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
            Sign in with Google or GitHub to manage multiple storefronts.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Your authenticated account becomes the store owner. One user can own
            multiple stores, and each store can hold its own product catalog.
          </p>
        </section>

        <section className="bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/55">
            Seller access
          </p>
          <div className="mt-6 grid gap-3">
            {authProviderAvailability.google ? (
              <form action={signInWithGoogleAction}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button
                  type="submit"
                  className="inline-flex w-full justify-center border border-white bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                >
                  Continue with Google
                </button>
              </form>
            ) : null}

            {authProviderAvailability.github ? (
              <form action={signInWithGitHubAction}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button
                  type="submit"
                  className="inline-flex w-full justify-center border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Continue with GitHub
                </button>
              </form>
            ) : null}
          </div>

          {hasAnyProvider ? null : (
            <div className="mt-6 border border-amber-300/30 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
              Add `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` and/or
              `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` in
              `apps/dashboard/.env.local` to enable sign-in.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
