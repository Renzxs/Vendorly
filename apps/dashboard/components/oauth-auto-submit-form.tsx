"use client";

import { useEffect, useRef } from "react";

type OAuthAutoSubmitFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  callbackUrl: string;
  providerLabel: string;
};

export function OAuthAutoSubmitForm({
  action,
  callbackUrl,
  providerLabel,
}: OAuthAutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full border border-black/10 bg-[rgba(255,253,247,0.94)] p-6 sm:p-8">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-teal-700">
          Vendorly authentication
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Redirecting to {providerLabel}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          If nothing happens, use the button below to continue the secure
          sign-in flow.
        </p>

        <form ref={formRef} action={action} className="mt-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button
            type="submit"
            className="inline-flex w-full justify-center border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Continue with {providerLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
