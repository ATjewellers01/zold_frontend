"use client";

import { HomeTab } from "@/components/tabs/HomeTab";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    return (
        <HomeTab
            isLoading={false}
            onLoadingComplete={() => { }}
            onBuyGold={() => router.push("/buy-gold")}
            onSellGold={() => router.push("/sell-gold")}
            onJewellery={() => router.push("/jewellery")}
            onOpenSIPCalculator={() => router.push("/sip-calculator")}
            onOpenReferral={() => router.push("/referral")}
            onOpenGiftGold={() => router.push("/gift-gold")}
            onOpenAuspiciousDays={() => router.push("/auspicious-days")}
            onOpenGoldGoals={() => router.push("/gold-goals")}
            onOpenWalletDetails={() => router.push("/wallet-details")}
        />
    );
}
