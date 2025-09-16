export const DashboardSkeleton = () => {
    return (
        <div
        className=" w-full py-0 gap-0 overflow-hidden rounded-lg bg-[var(--card-background)]/40 backdrop-blur-sm border border-white/10"
      >
        <div className="animate-pulse">
            <div className="p-0 bg-gray-600 h-40">
        </div>

        <div className="flex flex-col flex-grow w-full items-start p-4 pt-2 .lato-regular">
          <div className="w-full text-md rounded bg-gray-600 h-5"></div>
          <div className="flex w-full items-center gap-2 text-xs mt-1">
            <div className="w-full rounded bg-gray-600 h-4"></div>
          </div>
        </div>
        </div> 
      </div>
    );
};