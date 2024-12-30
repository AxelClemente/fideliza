import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="w-[400px] space-y-4">
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}