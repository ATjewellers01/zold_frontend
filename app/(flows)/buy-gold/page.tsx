"use client";

import { BuyGoldFlow } from "@/components/flows/BuyGoldFlow";
import { useRouter } from "next/navigation";

export default function BuyGoldPage() {
    const router = useRouter();
    return <BuyGoldFlow onClose={() => router.back()} />;
}
