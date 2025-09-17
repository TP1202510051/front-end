export const DashboardSkeleton = () => {
    return (
        <div className=" w-full py-0 gap-0 overflow-hidden rounded-lg bg-[var(--card-background)] backdrop-blur-sm border border-white/10">
        <div className="animate-pulse">
          <div className="p-0 bg-[var(--pulse)] h-48 w-full object-cover"></div>
          <div className="flex flex-col flex-grow w-full items-start p-4 pt-2 .lato-regular">
            <div className="w-full text-md rounded bg-[var(--pulse)] h-5"></div>
            <div className="flex w-full items-center gap-2 text-xs mt-1">
              <div className="w-full rounded bg-[var(--pulse)] h-4"></div>
            </div>
          </div>
        </div> 
      </div>
    );
};