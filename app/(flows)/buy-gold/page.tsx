"use client";

import { BuySellFlow } from "@/components/flows/BuySellFlow";
import { useRouter } from "next/navigation";

export default function BuyGoldPage() {
    const router = useRouter();
    return <BuySellFlow defaultMetal="gold" defaultAction="buy" onClose={() => router.back()} />;
}
