"use client";

import { BuySellFlow } from "@/components/flows/BuySellFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BuySellContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const metal = (searchParams.get("metal") as "gold" | "silver") || "gold";
    const action = (searchParams.get("action") as "buy" | "sell") || "buy";

    return (
        <BuySellFlow
            defaultMetal={metal}
            defaultAction={action}
            onClose={() => router.back()}
        />
    );
}

export default function BuySellPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EEC762] border-t-transparent" />
            </div>
        }>
            <BuySellContent />
        </Suspense>
    );
}
