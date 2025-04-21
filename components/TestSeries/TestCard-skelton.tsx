import { Skeleton } from "@/components/ui/skeleton";

export const TestSeriesCardSkeleton = () => {
  return (
    <div className="w-full mx-auto border rounded-lg overflow-hidden">
      <div className="p-4 relative">
        <Skeleton className="h-6 w-12 absolute top-2 right-2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};
