"use client";

import { GoldGoals } from "@/components/GoldGoals";
import { useRouter } from "next/navigation";

export default function GoldGoalsPage() {
    const router = useRouter();

    // GoldGoals required onBuyGold prop potentially, based on looking at MainApp usage:
    // onBuyGold={() => setShowBuyFlow(true)}

    return (
        <GoldGoals
            onClose={() => router.back()}
            mode="view"
            onBuyGold={() => router.push('/buy-gold')}
        />
    );
}
