"use client";

import { UsersTab } from "@/components/tabs/UsersTab";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') {
          setIsAuthorized(true);
        } else {
          router.push('/home');
        }
      } catch (e) {
        console.error("Failed to parse user data");
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D3066] border-t-transparent"></div>
      </div>
    );
  }

  return <UsersTab />;
}
