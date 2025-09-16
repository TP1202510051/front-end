export function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
        <div className="flex flex-col space-y-2 p-6">
          <div className="h-6 w-32 rounded bg-gray-300" />
          <div className="h-4 w-64 rounded bg-gray-300" />
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-gray-300" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-300" />
              <div className="grid gap-2">
                <div className="h-4 w-32 rounded bg-gray-300" />
                <div className="h-10 w-48 rounded bg-gray-300" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-10 w-full rounded bg-gray-300" />
              <div className="h-10 w-full rounded bg-gray-300" />
              <div className="h-10 w-full md:col-span-2 rounded bg-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-5 w-44 rounded bg-gray-300" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-md bg-gray-300" />
              <div className="grid gap-2">
                <div className="h-4 w-40 rounded bg-gray-300" />
                <div className="h-10 w-48 rounded bg-gray-300" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-10 w-full rounded bg-gray-300" />
              <div className="h-10 w-full rounded bg-gray-300" />
              <div className="h-10 w-full rounded bg-gray-300" />
              <div className="h-10 w-full rounded bg-gray-300" />
            </div>
          </div>

          {/* Botón */}
          <div className="h-10 w-40 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
