"use server";

import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";

import { api } from "@vendorly/convex";
import type { CheckoutFormValues } from "@vendorly/utils";

import { requireWebUser } from "@/lib/current-user";
import { getConvexServerOptions } from "@/lib/convex";

export type CheckoutActionResult = {
  message: string;
  orderCount?: number;
  success: boolean;
};

type CheckoutInput = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: CheckoutFormValues;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export async function checkoutAction(
  input: CheckoutInput,
): Promise<CheckoutActionResult> {
  try {
    const currentUser = await requireWebUser("/cart");
    const convexOptions = getConvexServerOptions();

    if (input.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty.",
      };
    }

    const requiredFields: Array<[keyof CheckoutFormValues, string]> = [
      ["fullName", "Full name"],
      ["email", "Email"],
      ["phone", "Phone number"],
      ["addressLine1", "Address line 1"],
      ["city", "City"],
      ["stateProvince", "State or province"],
      ["postalCode", "Postal code"],
      ["country", "Country"],
    ];

    for (const [field, label] of requiredFields) {
      if (!input.shippingAddress[field].trim()) {
        return {
          success: false,
          message: `${label} is required.`,
        };
      }
    }

    const orders = await fetchMutation(
      api.orders.createOrdersFromCheckout,
      {
        buyerEmail: currentUser.email,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        items: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: input.shippingAddress.paymentMethod,
        shippingAddress: {
          addressLine1: input.shippingAddress.addressLine1.trim(),
          addressLine2: input.shippingAddress.addressLine2.trim() || undefined,
          city: input.shippingAddress.city.trim(),
          country: input.shippingAddress.country.trim(),
          email: input.shippingAddress.email.trim(),
          fullName: input.shippingAddress.fullName.trim(),
          notes: input.shippingAddress.notes.trim() || undefined,
          phone: input.shippingAddress.phone.trim(),
          postalCode: input.shippingAddress.postalCode.trim(),
          stateProvince: input.shippingAddress.stateProvince.trim(),
        },
      },
      convexOptions,
    );

    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Order placed successfully.",
      orderCount: Array.isArray(orders) ? orders.length : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
