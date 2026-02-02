"use client";

import { ManageSIPPage as ManageSIPComponent } from "@/components/ManageSIPPage";
import { useRouter } from "next/navigation";

export default function ManageSIPPage() {
    const router = useRouter();
    return <ManageSIPComponent onClose={() => router.back()} />;
}
