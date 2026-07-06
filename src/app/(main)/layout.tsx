import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { Home, User } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { WhoToFollow } from "@/components/feed/who-to-follow";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-7xl min-h-screen flex">
      {/* Left Column: Navigation Sidebar */}
      <nav className="w-20 md:w-64 flex-none border-r border-gray-100 dark:border-gray-800 hidden sm:flex flex-col sticky top-0 h-screen p-4">
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors w-max"
          >
            <Home className="w-6 h-6" />
            <span className="hidden md:inline font-medium text-lg">Home</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors w-max"
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline font-medium text-lg">Profile</span>
          </Link>
        </div>
        
        <div className="mt-auto mb-4">
          <LogoutButton />
        </div>
      </nav>

      {/* Center Column: Main Content */}
      <main className="flex-1 min-w-0 border-r border-gray-100 dark:border-gray-800 max-w-2xl w-full">
        {children}
      </main>

      {/* Right Column: Aside */}
      <aside className="w-80 flex-none hidden lg:block sticky top-0 h-screen p-6">
        <Suspense
          fallback={
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <WhoToFollow />
        </Suspense>
      </aside>
    </div>
  );
}
