export function RenderSkeleton() {
  return (
    <div className="animate-pulse">
      <header className="w-full border-b bg-card p-4 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-gray-300" />
        <div className="flex gap-4">
          <div className="h-6 w-20 rounded bg-gray-300" />
          <div className="h-6 w-20 rounded bg-gray-300" />
          <div className="h-6 w-20 rounded bg-gray-300" />
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-300" />
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card shadow-sm overflow-hidden"
            >
              <div className="h-40 w-full bg-gray-300" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-32 rounded bg-gray-300" />
                <div className="h-4 w-20 rounded bg-gray-300" />
                <div className="h-10 w-full rounded bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full border-t bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
        <div className="h-4 w-40 rounded bg-gray-300" />
        <div className="flex gap-4">
          <div className="h-4 w-20 rounded bg-gray-300" />
          <div className="h-4 w-20 rounded bg-gray-300" />
          <div className="h-4 w-20 rounded bg-gray-300" />
        </div>
      </footer>
    </div>
  );
}
