import { StoreEditorPage } from "@/components/store-editor-page";
import { getDashboardStoreContext } from "@/lib/dashboard-stores";

export default async function NewDashboardStorePage() {
  const { stores } = await getDashboardStoreContext();

  return <StoreEditorPage mode="create" stores={stores} />;
}
