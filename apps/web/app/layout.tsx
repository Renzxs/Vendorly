import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { auth } from "@/auth";
import { WebNavbar } from "@/components/web-navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vendorly | Discover storefront-first commerce",
  description:
    "Vendorly is a customizable marketplace where sellers launch branded storefronts and buyers discover standout products.",
};

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[family-name:var(--font-sans)] text-slate-950 antialiased">
        <Providers session={session}>
          <WebNavbar dashboardUrl={dashboardUrl} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
