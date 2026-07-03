export function PostSkeleton() {
  return (
    <article className="p-4 border-b border-gray-100 flex space-x-3">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
      
      <div className="flex-1 space-y-3 py-1">
        {/* Header skeleton (Name, Username, Time) */}
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
        
        {/* Content lines skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-[90%] animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-[80%] animate-pulse"></div>
        </div>
      </div>
    </article>
  );
}
