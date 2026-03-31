import Link from "next/link";

import { cn, getInitials, type Store } from "@vendorly/utils";

type StoreRouteSidebarProps = {
  activeStoreId?: string;
  stores: Store[];
};

export function StoreRouteSidebar({
  activeStoreId,
  stores,
}: StoreRouteSidebarProps) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
      <section className="rounded-[1.75rem] border border-slate-950 bg-slate-950 p-5 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
          Store pages
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
          Create, view, and edit each storefront separately.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/72">
          Keep store setup on its own page, then jump back to the dashboard
          workspace when you want to manage products, orders, and chats.
        </p>

        <div className="mt-5 grid gap-3">
          <Link
            href="/dashboard/stores/new"
            className="inline-flex justify-center rounded-xl border border-white bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            New store
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Your storefronts
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Open any store
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            View details, edit branding, or jump into the main dashboard
            workspace for store operations.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {stores.length > 0 ? (
            stores.map((store) => {
              const isActive = store._id === activeStoreId;

              return (
                <div
                  key={store._id}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {store.logoImage ? (
                        <img
                          alt={`${store.name} logo`}
                          className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                          src={store.logoImage}
                        />
                      ) : (
                        <div
                          className={cn(
                            "inline-flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold",
                            isActive ? "bg-white/15 text-white" : "text-white",
                          )}
                          style={
                            isActive
                              ? undefined
                              : { backgroundColor: store.themeColor }
                          }
                        >
                          {getInitials(store.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/stores/${store._id}`}
                          className="block text-lg font-semibold tracking-tight hover:underline"
                        >
                          {store.name}
                        </Link>
                        <p
                          className={cn(
                            "mt-1 text-xs uppercase tracking-[0.22em]",
                            isActive ? "text-white/60" : "text-slate-400",
                          )}
                        >
                          {store.layoutType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "mt-4 text-sm leading-6 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden",
                      isActive ? "text-white/70" : "text-slate-600",
                    )}
                  >
                    {store.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/stores/${store._id}`}
                      className={cn(
                        "inline-flex rounded-xl px-3 py-2 text-xs font-medium transition",
                        isActive
                          ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                          : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100",
                      )}
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/stores/${store._id}/edit`}
                      className={cn(
                        "inline-flex rounded-xl px-3 py-2 text-xs font-medium transition",
                        isActive
                          ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                          : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100",
                      )}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard?store=${store._id}`}
                      className={cn(
                        "inline-flex rounded-xl px-3 py-2 text-xs font-medium transition",
                        isActive
                          ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                          : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100",
                      )}
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <h3 className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-tight text-slate-950">
                No stores yet
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Create your first storefront to get started.
              </p>
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
