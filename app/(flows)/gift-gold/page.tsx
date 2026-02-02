"use client";

import { GiftGold } from "@/components/GiftGold";
import { useRouter } from "next/navigation";

export default function GiftGoldPage() {
    const router = useRouter();
    return <GiftGold onClose={() => router.back()} />;
}
