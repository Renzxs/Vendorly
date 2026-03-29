"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  getProductImages,
  type CartItem,
  type MarketplaceProduct,
  type Product,
} from "@vendorly/utils";

const CART_STORAGE_KEY = "vendorly:cart";

type CartContextValue = {
  addItem: (product: Product | MarketplaceProduct, storeName?: string) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  openCart: () => void;
  removeItem: (productId: string) => void;
  total: number;
  updateQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const authUserId = session?.user?.id;
  const storageKey = authUserId ? `${CART_STORAGE_KEY}:${authUserId}` : null;
  const currentPath = useMemo(() => {
    const currentSearch = searchParams.toString();

    return currentSearch ? `${pathname}?${currentSearch}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!storageKey) {
      setItems([]);
      return;
    }

    const savedCart = window.localStorage.getItem(storageKey);

    if (!savedCart) {
      setItems([]);
      return;
    }

    try {
      setItems(JSON.parse(savedCart) as CartItem[]);
    } catch {
      window.localStorage.removeItem(storageKey);
      setItems([]);
    }
  }, [status, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      addItem(product, storeName) {
        if (status === "loading") {
          return;
        }

        if (!authUserId) {
          router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
          return;
        }

        const image = getProductImages(product)[0];
        setItems((current) => {
          const existingItem = current.find(
            (item) => item.productId === product._id,
          );

          if (existingItem) {
            return current.map((item) =>
              item.productId === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }

          return [
            ...current,
            {
              image,
              price: product.price,
              productId: product._id,
              quantity: 1,
              storeId: product.storeId,
              storeName:
                storeName ??
                ("store" in product ? product.store?.name : undefined),
              title: product.title,
            },
          ];
        });
        router.push("/cart");
      },
      clearCart() {
        setItems([]);
      },
      itemCount,
      items,
      openCart() {
        if (status === "loading") {
          return;
        }

        if (!authUserId) {
          router.push("/login?callbackUrl=%2Fcart");
          return;
        }

        router.push("/cart");
      },
      removeItem(productId) {
        setItems((current) =>
          current.filter((item) => item.productId !== productId),
        );
      },
      total,
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          setItems((current) =>
            current.filter((item) => item.productId !== productId),
          );
          return;
        }

        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        );
      },
    };
  }, [authUserId, currentPath, items, router, status]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
