"use client";

import { WalletTab } from "@/components/tabs/WalletTab";
import { useRouter } from "next/navigation";

export default function WalletDetailsFlow() {
    const router = useRouter();
    const onBack = () => {
        router.back();
    };
    return <WalletTab onBack={onBack} />;
}
