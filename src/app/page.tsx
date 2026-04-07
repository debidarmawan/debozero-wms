"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      // If user has token, redirect to dashboard
      router.push("/dashboard");
    } else {
      // If no token, redirect to login
      router.push("/login");
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
    </div>
  );
}
