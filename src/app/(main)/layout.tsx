import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { Home, User } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { WhoToFollow } from "@/components/feed/who-to-follow";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-7xl min-h-screen flex flex-col sm:flex-row">
      <div className="flex flex-1 min-h-screen">
        {/* Left Column: Navigation Sidebar (Hidden on mobile) */}
        <nav className="w-20 md:w-64 flex-none border-r border-gray-100 dark:border-gray-800 hidden sm:flex flex-col sticky top-0 h-screen p-5 justify-between">
          <div className="flex flex-col space-y-3">
            {/* Logo / Brand Header */}
            <div className="flex items-center space-x-3 px-3 py-4 select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xl tracking-tighter">D</span>
              </div>

              <span className="hidden md:inline font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight">
                DevBoard
              </span>
            </div>

            <Link
              href="/"
              className="flex items-center space-x-4 p-3.5 hover:bg-gray-100/70 dark:hover:bg-gray-900/60 rounded-xl transition-all duration-200 group"
            >
              <Home className="w-5.5 h-5.5 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="hidden md:inline font-semibold text-[17px] text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Home
              </span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center space-x-4 p-3.5 hover:bg-gray-100/70 dark:hover:bg-gray-900/60 rounded-xl transition-all duration-200 group"
            >
              <User className="w-5.5 h-5.5 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="hidden md:inline font-semibold text-[17px] text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Profile
              </span>
            </Link>
          </div>
          
          <div className="mb-4">
            <LogoutButton />
          </div>
        </nav>

        {/* Center Column: Main Content */}
        <main className="flex-1 min-w-0 border-r border-gray-100 dark:border-gray-800 max-w-2xl w-full pb-20 sm:pb-0">
          {children}
        </main>

        {/* Right Column: Aside */}
        <aside className="w-80 flex-none hidden lg:block sticky top-0 h-screen p-6">
          <Suspense
            fallback={
              <div className="glass-card rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
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

      {/* Bottom Navigation Bar for Mobile Devices */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-850 z-50 flex items-center justify-around px-4">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-16"
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-16"
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold mt-1">Profile</span>
        </Link>

        <div className="flex items-center justify-center w-16">
          <LogoutButton variant="mobile" />
        </div>
      </div>
    </div>
  );
}
