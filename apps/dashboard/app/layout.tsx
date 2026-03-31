import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Navbar } from "@vendorly/ui";

import { auth } from "@/auth";
import { DashboardNavbarActions } from "@/components/dashboard-navbar-actions";

import "./globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vendorly Dashboard | Seller control center",
  description:
    "Manage your Vendorly store branding, product catalog, and storefront presentation from one seller dashboard.",
};

const marketplaceUrl =
  process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "http://localhost:3000";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[family-name:var(--font-sans)] text-slate-950 antialiased">
        <Providers>
          <Navbar
            badge="Vendorly admin"
            ctaHref={marketplaceUrl}
            ctaLabel="View shop"
            links={[
              { href: "/dashboard", label: "Overview" },
              { href: marketplaceUrl, label: "Marketplace" },
            ]}
            rightAccessory={
              session?.user?.id ? (
                <DashboardNavbarActions userId={session.user.id} />
              ) : null
            }
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
