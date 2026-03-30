import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, authProviderAvailability } from "@/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackPath(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const callbackPath = getCallbackPath(resolvedSearchParams.callbackUrl);

  if (session?.user?.id) {
    redirect(callbackPath);
  }

  const dashboardOrigin = new URL(
    process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard",
  ).origin;
  const marketplaceOrigin =
    process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "http://localhost:3000";
  const callbackUrl = new URL(callbackPath, marketplaceOrigin).toString();
  const hasAnyProvider =
    authProviderAvailability.github || authProviderAvailability.google;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full gap-0 border border-black/10 bg-[rgba(255,253,247,0.92)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border-b border-black/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-700">
            Vendorly buyer access
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
            Sign in to save your cart and message stores directly.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Buyer chat now uses your authenticated account instead of a guest
            display name, and your cart stays tied to that signed-in identity.
          </p>
        </section>

        <section className="bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/55">
            Continue with
          </p>
          <div className="mt-6 grid gap-3">
            {authProviderAvailability.google ? (
              <a
                href={`${dashboardOrigin}/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-flex w-full justify-center border border-white bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
              >
                Continue with Google
              </a>
            ) : null}

            {authProviderAvailability.github ? (
              <a
                href={`${dashboardOrigin}/auth/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-flex w-full justify-center border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Continue with GitHub
              </a>
            ) : null}
          </div>

          {hasAnyProvider ? (
            <p className="mt-6 text-sm leading-7 text-white/70">
              After sign-in, you&apos;ll come right back to the page you were
              on.
            </p>
          ) : (
            <div className="mt-6 border border-amber-300/30 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
              Add `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` and/or
              `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` in `apps/web/.env.local`
              and `apps/dashboard/.env.local` to enable buyer sign-in.
            </div>
          )}

          <Link
            href={callbackPath}
            className="mt-6 inline-flex text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            Back to marketplace
          </Link>
        </section>
      </div>
    </main>
  );
}
