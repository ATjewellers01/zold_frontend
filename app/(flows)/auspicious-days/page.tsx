"use client";

import { AuspiciousDays } from "@/components/AuspiciousDays";
import { useRouter } from "next/navigation";

export default function AuspiciousDaysPage() {
    const router = useRouter();
    return <AuspiciousDays onClose={() => router.back()} />;
}
