"use client";

import { ReferralProgram } from "@/components/ReferralProgram";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
    const router = useRouter();
    return <ReferralProgram onClose={() => router.back()} />;
}
