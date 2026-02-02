"use client";

import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();

    const handleComplete = () => {
        // Persist state if necessary, or reliance on localStorage in Onboarding component
        // The original page.tsx did: setAppState("login")
        // We should probably allow the component or this wrapper to set localStorage
        // But page.tsx handled the state.
        // Let's replicate the state persistence if needed, but Onboarding usually sets a flag.
        // Looking at page.tsx:
        // const handleOnboardingComplete = () => setAppState("login");
        // And simple useEffect persisted appState.

        // We can manually set it here or rely on the components.
        // Since we are refactoring to routes, "appState" might be redundant or we just use it for initial redirect.
        localStorage.setItem("appState", "login");
        router.push("/login");
    };

    return <Onboarding onComplete={handleComplete} />;
}
