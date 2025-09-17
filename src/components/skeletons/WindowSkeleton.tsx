export const WindowSkeleton = () => {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-11 w-full rounded bg-[var(--pulse)] py-4" />
            <div className="h-6 w-full rounded bg-[var(--pulse)] py-4" />
        </div>
    );
};