import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Navbar } from "@vendorly/ui";

import "./globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vendorly Dashboard | Seller control center",
  description:
    "Manage your Vendorly store branding, product catalog, and storefront presentation from one seller dashboard.",
};

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
            badge="Seller dashboard"
            ctaHref="http://localhost:3000"
            ctaLabel="View marketplace"
            links={[
              { href: "/dashboard", label: "Dashboard" },
              { href: "http://localhost:3000", label: "Storefronts" },
            ]}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
