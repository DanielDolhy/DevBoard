import { PostSkeleton } from "@/components/feed/post-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </header>

      {/* TweetBox Skeleton Placeholder */}
      <div className="p-4 border-b border-gray-100 flex space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-4 py-2">
          <div className="h-4 bg-gray-200 rounded w-[40%] animate-pulse"></div>
          <div className="flex justify-between pt-4 border-t border-gray-100">
            <div className="w-10"></div>
            <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Feed Stack Skeletons */}
      <div className="flex flex-col divide-y divide-gray-100">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}
