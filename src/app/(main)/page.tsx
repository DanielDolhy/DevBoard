export default function FeedPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </header>

      {/* Feed Content */}
      <div className="flex flex-col divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((post) => (
          <article key={post} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">User {post}</span>
                  <span className="text-gray-500 text-sm">@user{post}</span>
                  <span className="text-gray-500 text-sm">· 2h</span>
                </div>
                <p className="text-gray-800 mt-1">
                  This is a placeholder post #{post} for the main feed. We will add actual dynamic content here later.
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
