"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const storedState = localStorage.getItem("appState");

      if (storedState === "main") {
        router.push("/home");
      } else if (storedState === "kyc") {
        router.push("/kyc");
      } else if (storedState === "login") {
        router.push("/login");
      } else {
        router.push("/onboarding");
      }
    } catch (e) {
      router.push("/onboarding");
    }
  }, [router]);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D3066] border-t-transparent"></div>
    </div>
  );
}
