"use client";

import { ProfileTab } from "@/components/tabs/ProfileTab";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
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
