export function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-card-foreground animate-pulse">
        <div className="flex flex-col space-y-2 p-6">
          <div className="h-6 w-32 rounded bg-[var(--pulse)]" />
          <div className="h-4 w-64 rounded bg-[var(--pulse)]" />
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-[var(--pulse)]" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-[var(--pulse)]" />
              <div className="grid gap-2">
                <div className="h-4 w-32 rounded bg-[var(--pulse)]" />
                <div className="h-10 w-48 rounded bg-[var(--pulse)]" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
              <div className="h-10 w-full md:col-span-2 rounded bg-[var(--pulse)]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-5 w-44 rounded bg-[var(--pulse)]" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-md bg-[var(--pulse)]" />
              <div className="grid gap-2">
                <div className="h-4 w-40 rounded bg-[var(--pulse)]" />
                <div className="h-10 w-48 rounded bg-[var(--pulse)]" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
              <div className="h-10 w-full rounded bg-[var(--pulse)]" />
            </div>
          </div>

          {/* Botón */}
          <div className="h-10 w-40 rounded bg-[var(--pulse)]" />
        </div>
      </div>
    </div>
  );
}
