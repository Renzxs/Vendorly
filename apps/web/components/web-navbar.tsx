"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { Navbar } from "@vendorly/ui";
import { cn, getInitials } from "@vendorly/utils";

import { useCart } from "@/lib/cart";
import { WebNotificationMenu } from "./web-notification-menu";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 5H6.17391C6.70254 5 7.1647 5.36087 7.29374 5.8735L7.66667 7.33333M7.66667 7.33333H18.3127C18.9658 7.33333 19.4478 7.94455 19.2957 8.57967L18.3371 12.5797C18.2287 13.0321 17.8241 13.3519 17.3589 13.3519H9.24349C8.7808 13.3519 8.37784 13.0355 8.26673 12.5863L7.66667 10.1605V7.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.5 18.5C9.5 19.0523 9.05228 19.5 8.5 19.5C7.94772 19.5 7.5 19.0523 7.5 18.5C7.5 17.9477 7.94772 17.5 8.5 17.5C9.05228 17.5 9.5 17.9477 9.5 18.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M18 18.5C18 19.0523 17.5523 19.5 17 19.5C16.4477 19.5 16 19.0523 16 18.5C16 17.9477 16.4477 17.5 17 17.5C17.5523 17.5 18 17.9477 18 18.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AvatarButton({
  image,
  initials,
  label,
  onError,
}: {
  image?: string;
  initials: string;
  label: string;
  onError: () => void;
}) {
  return (
    <span className="inline-flex h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Auth avatars can come from arbitrary provider domains, so keep this unoptimized. */}
          <img
            alt={`${label} profile`}
            className="h-full w-full object-cover"
            onError={onError}
            src={image}
          />
        </>
      ) : (
        <span className="inline-flex h-full w-full items-center justify-center bg-slate-950 text-xs font-semibold text-white">
          {initials}
        </span>
      )}
    </span>
  );
}

export function WebNavbar({ dashboardUrl }: { dashboardUrl: string }) {
  const cart = useCart();
  const { data: session } = useSession();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAvatarImageBroken, setIsAvatarImageBroken] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const user = session?.user;
  const profileLabel = user?.name || user?.email || "Vendorly user";
  const avatarInitials = getInitials(profileLabel);
  const avatarImage = !isAvatarImageBroken
    ? user?.image || undefined
    : undefined;

  useEffect(() => {
    setIsAvatarImageBroken(false);
  }, [user?.image]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Navbar
      badge="Vendorly shop"
      ctaHref={dashboardUrl}
      ctaLabel="Seller dashboard"
      links={[
        { href: "/", label: "Shop" },
        { href: "/#stores", label: "Stores" },
        { href: "/#products", label: "Products" },
        { href: "/orders", label: "Orders" },
        { href: "/feed", label: "Feed" },
      ]}
      rightAccessory={
        <div className="flex items-center gap-2.5">
          {user?.id ? <WebNotificationMenu iconOnly userId={user.id} /> : null}
          <button
            type="button"
            onClick={cart.openCart}
            aria-label={`Open cart (${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"})`}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition hover:border-slate-300 hover:bg-white"
          >
            <span className="sr-only">Cart</span>
            <CartIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-slate-200 bg-white px-1.5 text-[0.65rem] font-semibold leading-5 text-slate-700">
              {cart.itemCount}
            </span>
          </button>
          {user?.id ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                className={cn(
                  "inline-flex items-center justify-center rounded-full transition hover:-translate-y-0.5",
                  isAccountMenuOpen
                    ? "ring-2 ring-slate-200 ring-offset-2"
                    : "",
                )}
              >
                <AvatarButton
                  image={avatarImage}
                  initials={avatarInitials}
                  label={profileLabel}
                  onError={() => setIsAvatarImageBroken(true)}
                />
              </button>

              {isAccountMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[18rem] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <AvatarButton
                        image={avatarImage}
                        initials={avatarInitials}
                        label={profileLabel}
                        onError={() => setIsAvatarImageBroken(true)}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {user.name || "Vendorly shopper"}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      void signOut({ callbackUrl: "/login" });
                    }}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <a
              href="/login"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Sign in
            </a>
          )}
        </div>
      }
    />
  );
}
