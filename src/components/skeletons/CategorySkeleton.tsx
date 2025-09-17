export const CategorySkeleton = () => {
    return (
        <div className="animate-pulse space-y-4 flex flex-col items-end">
            <div className="h-11 w-full rounded bg-[var(--pulse)]" />
            <div className="h-9 w-10/11 rounded bg-[var(--pulse)]" />
            <div className="h-9 w-9/11 rounded bg-[var(--pulse)]" />
        </div>
    );
};