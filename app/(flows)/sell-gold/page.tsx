"use client";

import { BuySellFlow } from "@/components/flows/BuySellFlow";
import { useRouter } from "next/navigation";

export default function SellGoldPage() {
    const router = useRouter();
    return <BuySellFlow defaultMetal="gold" defaultAction="sell" onClose={() => router.back()} />;
}
