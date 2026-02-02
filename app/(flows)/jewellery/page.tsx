"use client";

import { JewelleryFlow } from "@/components/JewelleryPage";
import { useRouter } from "next/navigation";

export default function JewelleryPage() {
    const router = useRouter();
    return <JewelleryFlow onClose={() => router.back()} />;
}
