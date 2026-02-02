"use client";

import { SellGoldFlow } from "@/components/flows/SellGoldFlow";
import { useRouter } from "next/navigation";

export default function SellGoldPage() {
    const router = useRouter();
    return <SellGoldFlow onClose={() => router.back()} />;
}
