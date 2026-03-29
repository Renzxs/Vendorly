export default function LoadingDashboardApp() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-56 rounded-full bg-slate-200" />
        <div className="h-[220px] rounded-[2rem] bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[520px] rounded-[2rem] bg-slate-200" />
          <div className="h-[520px] rounded-[2rem] bg-slate-200" />
        </div>
      </div>
    </main>
  );
}

