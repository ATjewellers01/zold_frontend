"use client";

import { KYCFlow } from "@/components/KYCFlow";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function KYCPage() {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.replace("/onboarding");
        }
    }, [router]);

    const handleCompleteOrSkip = () => {
        localStorage.setItem("kycCompleted", "true");
        localStorage.setItem("appState", "main");
        router.push("/home");
    };

    return <KYCFlow onComplete={handleCompleteOrSkip} onSkip={handleCompleteOrSkip} />;
}
