"use client";

import { SIPCalculator } from "@/components/SIPCalculator";
import { useRouter } from "next/navigation";

export default function SIPCalculatorPage() {
    const router = useRouter();
    return <SIPCalculator onClose={() => router.back()} />;
}
