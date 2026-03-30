import { StoreEditorPage } from "@/components/store-editor-page";
import { getOwnedDashboardStore } from "@/lib/dashboard-stores";

type EditDashboardStorePageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function EditDashboardStorePage({
  params,
}: EditDashboardStorePageProps) {
  const { storeId } = await params;
  const { store, stores } = await getOwnedDashboardStore(storeId);

  return <StoreEditorPage mode="edit" store={store} stores={stores} />;
}
