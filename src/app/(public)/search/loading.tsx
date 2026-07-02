export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-[280px] hidden md:block">
          <div className="h-[480px] rounded-lg bg-zinc-100 animate-pulse" />
        </aside>
        <main className="flex-1 min-w-0 space-y-6">
          <div className="h-10 w-64 rounded bg-zinc-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 rounded-lg bg-zinc-100 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}