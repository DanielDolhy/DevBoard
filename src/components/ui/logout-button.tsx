"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    if (isPending) return;
    setIsPending(true);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });

      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center space-x-4 p-3 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 rounded-full transition-colors w-max disabled:opacity-50 cursor-pointer"
    >
      <LogOut className="w-6 h-6" />
      <span className="hidden md:inline font-medium text-lg">
        {isPending ? "Logging out…" : "Logout"}
      </span>
    </button>
  );
}
