"use server";

import { redirect } from "next/navigation";

import { authProviderAvailability, signIn, signOut } from "@/auth";

function getRedirectTarget(formData: FormData, fallback: string) {
  const value = formData.get("callbackUrl");

  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!authProviderAvailability.google) {
    redirect("/login");
  }

  await signIn("google", {
    redirectTo: getRedirectTarget(formData, "/dashboard"),
  });
}

export async function signInWithGitHubAction(formData: FormData) {
  if (!authProviderAvailability.github) {
    redirect("/login");
  }

  await signIn("github", {
    redirectTo: getRedirectTarget(formData, "/dashboard"),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
