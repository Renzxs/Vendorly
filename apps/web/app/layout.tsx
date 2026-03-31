import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { auth } from "@/auth";
import { WebNavbar } from "@/components/web-navbar";
import {
  buildSocialMetadata,
  DEFAULT_METADATA_DESCRIPTION,
  DEFAULT_METADATA_TITLE,
  getMarketplaceUrl,
} from "@/lib/metadata";
import { Providers } from "./providers";

const marketplaceUrl = getMarketplaceUrl();

export const metadata: Metadata = {
  metadataBase: marketplaceUrl,
  title: DEFAULT_METADATA_TITLE,
  ...buildSocialMetadata({
    description: DEFAULT_METADATA_DESCRIPTION,
    title: DEFAULT_METADATA_TITLE,
  }),
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
