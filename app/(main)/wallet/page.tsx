"use client";

import { WalletTab } from "@/components/tabs/WalletTab";
import { useRouter } from "next/navigation";

export default function WalletPage() {
    const router = useRouter();

    return <WalletTab onOpenManageSIP={() => router.push("/manage-sip")} />;
}
