"use client";

import { LoginScreen } from "@/components/LoginScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            router.push("/home");
        }
    }, []);

    const handleComplete = (userData: any, isSignup: boolean) => {
        localStorage.setItem("user", JSON.stringify(userData));
        // Always redirect to KYC after login/signup if KYC not completed
        const kycCompleted = localStorage.getItem("kycCompleted") === "true";
        if (kycCompleted) {
            localStorage.setItem("appState", "main");
            router.push("/home");
        } else {
            localStorage.setItem("appState", "kyc");
            router.push("/kyc");
        }
    };

    return <LoginScreen onComplete={handleComplete} />;
}
