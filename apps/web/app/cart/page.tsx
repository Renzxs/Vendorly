import { CartPageShell } from "@/components/cart-page-shell";
import { requireWebUser } from "@/lib/current-user";

export default async function CartPage() {
  await requireWebUser("/cart");

  return <CartPageShell />;
}
