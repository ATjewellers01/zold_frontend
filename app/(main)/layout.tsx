"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { BottomNav } from "@/components/Navigation/BottomNav";
import { useRouter } from "next/navigation";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const user = localStorage.getItem("user");
        if (!user) {
            router.replace("/onboarding");
        }
    }, [router]);

    if (!mounted) {
        return <div className="min-h-screen" />;
    }

    return (
        <div className="flex min-h-screen dark:bg-neutral-900">
            {/* Desktop Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div
                className={`min-h-screen flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 dark:bg-neutral-900 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                    }`}
            >
                <div className="w-full lg:px-3 pb-20 lg:pb-0">
                    {children}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
