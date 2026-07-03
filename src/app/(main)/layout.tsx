import { ReactNode } from "react";
import Link from "next/link";
import { Home, User, LogOut } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-7xl min-h-screen flex">
      {/* Left Column: Navigation Sidebar */}
      <nav className="w-20 md:w-64 flex-none border-r border-gray-100 hidden sm:flex flex-col sticky top-0 h-screen p-4">
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-full transition-colors w-max"
          >
            <Home className="w-6 h-6" />
            <span className="hidden md:inline font-medium text-lg">Home</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-full transition-colors w-max"
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline font-medium text-lg">Profile</span>
          </Link>
        </div>
        
        <div className="mt-auto mb-4">
          <button className="flex items-center space-x-4 p-3 hover:bg-red-50 text-red-600 rounded-full transition-colors w-max">
            <LogOut className="w-6 h-6" />
            <span className="hidden md:inline font-medium text-lg">Logout</span>
          </button>
        </div>
      </nav>

      {/* Center Column: Main Content */}
      <main className="flex-1 min-w-0 border-r border-gray-100 max-w-2xl w-full">
        {children}
      </main>

      {/* Right Column: Aside */}
      <aside className="w-80 flex-none hidden lg:block sticky top-0 h-screen p-6">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <h2 className="font-bold text-xl mb-4 text-gray-900">Who to follow</h2>
          <div className="space-y-4">
            {/* Placeholder items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">User {i}</p>
                    <p className="text-gray-500 text-sm">@user{i}</p>
                  </div>
                </div>
                <button className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
