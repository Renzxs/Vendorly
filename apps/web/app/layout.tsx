import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Navbar } from "@vendorly/ui";

import "./globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vendorly | Discover storefront-first commerce",
  description:
    "Vendorly is a customizable marketplace where sellers launch branded storefronts and buyers discover standout products.",
};

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[family-name:var(--font-sans)] text-slate-950 antialiased">
        <Providers>
          <Navbar
            badge="Storefront marketplace"
            ctaHref={dashboardUrl}
            ctaLabel="Seller dashboard"
            links={[
              { href: "/", label: "Marketplace" },
              { href: "/feed", label: "Product feed" },
              { href: "/#stores", label: "Featured stores" },
              { href: "/#products", label: "Products" },
            ]}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
