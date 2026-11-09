import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * The order sheet's body while its record loads. Drawn inside the open sheet,
 * so the sheet slides in on the click and the wait happens where the user is
 * looking, never as a spinner on the list behind it.
 */
export const OrderDetailsSkeleton = () => (
  <div aria-busy className="flex flex-col gap-6 px-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="contents" key={index}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </dl>
  </div>
);
