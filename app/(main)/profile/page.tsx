"use client";

import { ProfileTab } from "@/components/tabs/ProfileTab";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function ProfileContent() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            // ignore
        }
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem("user");
            localStorage.setItem("appState", "onboarding");
        } catch (e) {
            // ignore
        }
        router.replace("/onboarding");
    };

    return <ProfileTab user={user} onLogout={handleLogout} />;
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#4B3B80] via-[#3A2C66] to-[#1F173D]" />}>
            <ProfileContent />
        </Suspense>
    );
}
