"use server";

import { redirect } from "next/navigation";

import { authProviderAvailability, signIn, signOut } from "@/auth";

export async function signInWithGoogleAction() {
  if (!authProviderAvailability.google) {
    redirect("/login");
  }

  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithGitHubAction() {
  if (!authProviderAvailability.github) {
    redirect("/login");
  }

  await signIn("github", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

